'use server'

import { cookies } from 'next/headers'

import type { Locale } from '@/i18n/routing'

import { getArtworksByIds } from './artworks'
import { getCartIds } from './cart'
import { checkCoupon, COUPON_COOKIE } from './coupons'
import { getCurrentCustomer } from './customerAuth'

export type CouponFormState = { error?: string; min?: number } | null

export async function applyCouponCode(locale: Locale, _prev: CouponFormState, form: FormData): Promise<CouponFormState> {
  const code = String(form.get('code') ?? '').trim().toUpperCase()
  if (!code) return { error: 'notFound' }
  const artworks = (await getArtworksByIds(locale, await getCartIds())).filter((a) => a.status === 'published')
  const subtotal = artworks.reduce((s, a) => s + a.price, 0)
  const res = await checkCoupon(code, subtotal, await getCurrentCustomer())
  if (!res.ok) return { error: res.error, min: res.min }
  ;(await cookies()).set(COUPON_COOKIE, res.coupon.code, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return null
}

export async function removeCouponCode() {
  ;(await cookies()).delete(COUPON_COOKIE)
}
