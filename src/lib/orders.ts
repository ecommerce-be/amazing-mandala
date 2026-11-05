import config from '@payload-config'
import { getPayload } from 'payload'
import type Stripe from 'stripe'

import { revalidateSite } from '@/hooks/revalidateSite'

import { markArtworksSold, releaseArtworks } from './reservations'

export function artworkIdsFromSession(session: Stripe.Checkout.Session): number[] {
  return (session.metadata?.artworkIds ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
}

type ShippingDetails = { name?: string | null; address?: Stripe.Address | null } | null | undefined

async function findOrder(sessionId: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'orders',
    where: { stripeSessionId: { equals: sessionId } },
    limit: 1,
    depth: 0,
  })
  return { payload, order: docs[0] }
}

/** Pagamento riuscito: ordine pagato, quadri venduti. Idempotente (Stripe può ripetere l'evento). */
export async function completeOrder(session: Stripe.Checkout.Session) {
  const { payload, order } = await findOrder(session.id)
  if (!order || order.status !== 'pending') return

  const s = session as Stripe.Checkout.Session & {
    collected_information?: { shipping_details?: ShippingDetails } | null
    shipping_details?: ShippingDetails
  }
  const shipping = s.collected_information?.shipping_details ?? s.shipping_details
  const addr = shipping?.address

  await payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      status: 'paid',
      paidAt: new Date().toISOString(),
      email: session.customer_details?.email ?? undefined,
      customerName: session.customer_details?.name ?? undefined,
      phone: session.customer_details?.phone ?? undefined,
      total: session.amount_total ?? undefined,
      shipping: session.shipping_cost?.amount_total ?? undefined,
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
      shippingAddress: {
        name: shipping?.name ?? undefined,
        line1: addr?.line1 ?? undefined,
        line2: addr?.line2 ?? undefined,
        postalCode: addr?.postal_code ?? undefined,
        city: addr?.city ?? undefined,
        state: addr?.state ?? undefined,
        country: addr?.country ?? undefined,
      },
    },
  })
  await markArtworksSold(artworkIdsFromSession(session))
  revalidateSite()
}

/** Pagamento annullato o scaduto: ordine annullato, quadri di nuovo in vendita. */
export async function cancelOrder(session: Stripe.Checkout.Session) {
  const { payload, order } = await findOrder(session.id)
  if (order && order.status === 'pending') {
    await payload.update({ collection: 'orders', id: order.id, data: { status: 'cancelled' } })
  }
  if (!order || order.status === 'pending') {
    await releaseArtworks(artworkIdsFromSession(session))
    revalidateSite()
  }
}
