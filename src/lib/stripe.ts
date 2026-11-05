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

// Spedizione provvisoria, uguale per Italia e UE: da sostituire con le tariffe per zona
export const SHIPPING_CENTS = 2000

export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU',
  'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
] as const
