'use server'

import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

import { clearCustomerSession, getCurrentCustomer, setCustomerSession } from './customerAuth'

export type FormState = { error?: string; ok?: string } | null

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

// I messaggi di errore sono chiavi di traduzione (namespace "account.errors")

export async function register(locale: Locale, _prev: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email').toLowerCase()
  const password = String(form.get('password') ?? '')
  if (!EMAIL_RE.test(email)) return { error: 'invalidEmail' }
  if (password.length < MIN_PASSWORD) return { error: 'shortPassword' }

  const payload = await getPayload({ config })
  const existing = await payload.find({ collection: 'customers', where: { email: { equals: email } }, limit: 1 })
  if (existing.totalDocs > 0) return { error: 'emailTaken' }

  await payload.create({
    collection: 'customers',
    data: { email, password, firstName: str(form, 'firstName'), lastName: str(form, 'lastName'), locale },
  })
  const { token } = await payload.login({ collection: 'customers', data: { email, password } })
  if (token) await setCustomerSession(token)
  redirect(getPathname({ locale, href: '/account' }))
}

export async function login(locale: Locale, _prev: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email').toLowerCase()
  const password = String(form.get('password') ?? '')
  const payload = await getPayload({ config })
  let token: string | undefined
  try {
    token = (await payload.login({ collection: 'customers', data: { email, password } })).token
  } catch (err) {
    const locked = err instanceof Error && err.name === 'LockedAuth'
    return { error: locked ? 'locked' : 'wrongCredentials' }
  }
  if (!token) return { error: 'wrongCredentials' }
  await setCustomerSession(token)
  const next = str(form, 'next')
  // solo percorsi interni, mai URL esterni
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : getPathname({ locale, href: '/account' }))
}

export async function logout(locale: Locale) {
  await clearCustomerSession()
  redirect(getPathname({ locale, href: '/' }))
}

export async function forgotPassword(_locale: Locale, _prev: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email').toLowerCase()
  if (!EMAIL_RE.test(email)) return { error: 'invalidEmail' }
  const payload = await getPayload({ config })
  try {
    await payload.forgotPassword({ collection: 'customers', data: { email } })
  } catch {
    // stessa risposta anche se l'email non esiste: non riveliamo chi è registrato
  }
  return { ok: 'resetSent' }
}

export async function resetPassword(locale: Locale, _prev: FormState, form: FormData): Promise<FormState> {
  const token = str(form, 'token')
  const password = String(form.get('password') ?? '')
  if (password.length < MIN_PASSWORD) return { error: 'shortPassword' }
  const payload = await getPayload({ config })
  let sessionToken: string | undefined
  try {
    const res = await payload.resetPassword({ collection: 'customers', data: { token, password }, overrideAccess: true })
    sessionToken = res.token
  } catch {
    return { error: 'invalidResetLink' }
  }
  if (sessionToken) await setCustomerSession(sessionToken)
  redirect(getPathname({ locale, href: '/account' }))
}

export async function updateProfile(_locale: Locale, _prev: FormState, form: FormData): Promise<FormState> {
  const customer = await getCurrentCustomer()
  if (!customer) return { error: 'notLoggedIn' }
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'customers',
    id: customer.id,
    data: { firstName: str(form, 'firstName'), lastName: str(form, 'lastName'), phone: str(form, 'phone') },
  })
  return { ok: 'profileSaved' }
}
