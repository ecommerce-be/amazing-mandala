import type { Artwork } from '@/payload-types'

/**
 * Spedizioni con BRT.
 *
 * Italia: gratuita per il cliente, perché il costo è già compreso nel prezzo del quadro.
 * Unione Europea: tariffa per zona e peso, presa dal listino BRT per privati
 * (shop to shop, IVA inclusa) + 6,40 € di ritiro e consegna a domicilio, arrotondata all'euro.
 * Con un contratto business le tariffe saranno più basse: aggiornare qui.
 */

export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU',
  'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
] as const
export type Country = (typeof EU_COUNTRIES)[number]

export const DEFAULT_COUNTRY: Country = 'IT'

// Peso usato quando il quadro non ha il peso compilato, e peso dell'imballo per collo
const DEFAULT_ARTWORK_WEIGHT_G = 3000
const PACKAGING_WEIGHT_G = 1000

type Band = { maxKg: number; eur: number }

const ZONES: { countries: Country[]; bands: Band[] }[] = [
  // Francia, Germania
  { countries: ['FR', 'DE'], bands: [{ maxKg: 2, eur: 23 }, { maxKg: 5, eur: 25 }, { maxKg: 10, eur: 28 }, { maxKg: 20, eur: 33 }] },
  // Austria, Spagna
  { countries: ['AT', 'ES'], bands: [{ maxKg: 2, eur: 23 }, { maxKg: 5, eur: 26 }, { maxKg: 10, eur: 30 }, { maxKg: 20, eur: 35 }] },
  // Benelux, Polonia, Portogallo, Romania, Svezia (listino BRT) e, per stima, gli altri Paesi UE
  {
    countries: ['BE', 'LU', 'NL', 'PL', 'PT', 'RO', 'SE', 'BG', 'CY', 'CZ', 'DK', 'EE', 'FI', 'GR', 'HR', 'HU', 'IE', 'LT', 'LV', 'MT', 'SI', 'SK'],
    bands: [{ maxKg: 2, eur: 26 }, { maxKg: 5, eur: 28 }, { maxKg: 10, eur: 32 }, { maxKg: 20, eur: 40 }],
  },
]

export function isCountry(v: unknown): v is Country {
  return typeof v === 'string' && (EU_COUNTRIES as readonly string[]).includes(v)
}

export function parcelWeightKg(artworks: Pick<Artwork, 'weightG'>[]) {
  const grams = artworks.reduce((sum, a) => sum + (a.weightG || DEFAULT_ARTWORK_WEIGHT_G), PACKAGING_WEIGHT_G)
  return grams / 1000
}

/** Costo di spedizione in euro per il paese e i quadri indicati. */
export function shippingCost(country: Country, artworks: Pick<Artwork, 'weightG'>[]): number {
  if (country === 'IT') return 0
  const zone = ZONES.find((z) => z.countries.includes(country))
  if (!zone) return 0
  const kg = parcelWeightKg(artworks)
  const band = zone.bands.find((b) => kg <= b.maxKg) ?? zone.bands.at(-1)!
  return band.eur
}
