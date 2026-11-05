import type Stripe from 'stripe'

import { cancelOrder, completeOrder } from '@/lib/orders'
import { getStripe } from '@/lib/stripe'

// Stripe chiama questo indirizzo a ogni evento di pagamento.
// La firma garantisce che la richiesta arrivi davvero da Stripe.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = req.headers.get('stripe-signature')
  if (!secret || !signature) return new Response('Webhook non configurato', { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, secret)
  } catch {
    return new Response('Firma non valida', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      if (event.data.object.payment_status === 'paid') await completeOrder(event.data.object)
      break
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed':
      await cancelOrder(event.data.object)
      break
  }
  return Response.json({ received: true })
}
