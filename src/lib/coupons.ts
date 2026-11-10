import config from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'

import type { Coupon, Customer } from '@/payload-types'

export const COUPON_COOKIE = 'am_coupon'

export type CouponCheck =
  | { ok: true; coupon: Coupon }
  | { ok: false; error: 'notFound' | 'expired' | 'notYet' | 'exhausted' | 'minSubtotal' | 'needsAccount' | 'alreadyUsed'; min?: number }

export async function getCouponCode() {
  return (await cookies()).get(COUPON_COOKIE)?.value ?? null
}

/** Verifica un codice per un carrello con il subtotale indicato (in euro). */
export async function checkCoupon(code: string, subtotalEur: number, customer: Customer | null): Promise<CouponCheck> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'coupons',
    where: { and: [{ code: { equals: code.trim().toUpperCase() } }, { active: { equals: true } }] },
    limit: 1,
  })
  const coupon = docs[0]
  if (!coupon) return { ok: false, error: 'notFound' }
  const now = Date.now()
  if (coupon.validFrom && Date.parse(coupon.validFrom) > now) return { ok: false, error: 'notYet' }
  if (coupon.validUntil && Date.parse(coupon.validUntil) < now) return { ok: false, error: 'expired' }
  if (coupon.maxUses && (coupon.usedCount ?? 0) >= coupon.maxUses) return { ok: false, error: 'exhausted' }
  if (coupon.minSubtotal && subtotalEur < coupon.minSubtotal) return { ok: false, error: 'minSubtotal', min: coupon.minSubtotal }
  if (coupon.oncePerCustomer) {
    if (!customer) return { ok: false, error: 'needsAccount' }
    const used = await payload.count({
      collection: 'orders',
      where: {
        and: [
          { couponCode: { equals: coupon.code } },
          { status: { in: ['paid', 'shipped', 'delivered'] } },
          { or: [{ customer: { equals: customer.id } }, { email: { equals: customer.email } }] },
        ],
      },
    })
    if (used.totalDocs > 0) return { ok: false, error: 'alreadyUsed' }
  }
  return { ok: true, coupon }
}

/** Sconto sui quadri e spedizione dopo il coupon, tutto in centesimi. */
export function applyCoupon(coupon: Coupon | null, subtotalCents: number, shippingCents: number) {
  if (!coupon) return { discountCents: 0, shippingCents }
  if (coupon.type === 'free_shipping') return { discountCents: 0, shippingCents: 0 }
  const raw = coupon.type === 'percent' ? Math.round((subtotalCents * (coupon.value ?? 0)) / 100) : (coupon.value ?? 0) * 100
  // lo sconto non supera mai il valore dei quadri
  return { discountCents: Math.min(raw, subtotalCents), shippingCents }
}

export async function incrementCouponUse(code: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'coupons', where: { code: { equals: code } }, limit: 1 })
  if (docs[0]) {
    await payload.update({ collection: 'coupons', id: docs[0].id, data: { usedCount: (docs[0].usedCount ?? 0) + 1 } })
  }
}
