import Stripe from 'stripe'

let client: Stripe | null = null

// Creato al primo uso, così la build funziona anche senza chiavi
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY mancante nel file .env')
  client ??= new Stripe(key)
  return client
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
