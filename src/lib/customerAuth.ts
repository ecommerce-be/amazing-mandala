import config from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'

import type { Customer } from '@/payload-types'

// La sessione del cliente vive in un cookie tutto suo, separato da quello del
// pannello admin: così admin e cliente possono essere connessi nello stesso browser.
export const CUSTOMER_COOKIE = 'am_customer'

export const customerCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
}

export async function setCustomerSession(token: string) {
  ;(await cookies()).set(CUSTOMER_COOKIE, token, customerCookieOptions)
}

export async function clearCustomerSession() {
  ;(await cookies()).delete(CUSTOMER_COOKIE)
}

/** Il cliente connesso, oppure null. Il token viene verificato da Payload. */
export async function getCurrentCustomer(): Promise<Customer | null> {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value
  if (!token) return null
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
    return user?.collection === 'customers' ? (user as Customer) : null
  } catch {
    return null
  }
}
