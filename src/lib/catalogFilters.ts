import type { Where } from 'payload'

import type { Artwork } from '@/payload-types'

export const SHAPES = ['round', 'square', 'rectangular'] as const
export const COLORS = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink',
  'brown', 'black', 'white', 'gold', 'silver', 'natural',
] as const
// Fasce di prezzo in euro: [min, max) — max null = senza limite
export const PRICE_RANGES = {
  'under-250': [0, 250],
  '250-400': [250, 400],
  'over-400': [400, null],
} as const

// Ordinamenti: chiave URL -> campo Payload
export const SORTS = {
  newest: '-publishedAt',
  'price-asc': 'price',
  'price-desc': '-price',
  title: 'title',
} as const
export type SortKey = keyof typeof SORTS
export const DEFAULT_SORT: SortKey = 'newest'

export type CatalogFilters = {
  sort?: SortKey
  shape?: (typeof SHAPES)[number]
  color?: (typeof COLORS)[number]
  price?: keyof typeof PRICE_RANGES
  available?: boolean
}

type RawParams = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const pick = <T extends string>(list: readonly T[], v: string | undefined) =>
  list.includes(v as T) ? (v as T) : undefined

// Legge i filtri dall'URL ignorando valori non validi
export function parseFilters(params: RawParams): CatalogFilters {
  const price = one(params.price)
  const sort = one(params.sort)
  return {
    sort: sort && sort in SORTS && sort !== DEFAULT_SORT ? (sort as SortKey) : undefined,
    shape: pick(SHAPES, one(params.shape)),
    color: pick(COLORS, one(params.color)),
    price: price && price in PRICE_RANGES ? (price as CatalogFilters['price']) : undefined,
    available: one(params.available) === '1',
  }
}

export function hasActiveFilters(f: CatalogFilters) {
  return Boolean(f.shape || f.color || f.price || f.available)
}

export function filtersToWhere(f: CatalogFilters): Where[] {
  const where: Where[] = []
  if (f.shape) where.push({ shape: { equals: f.shape } })
  if (f.color) where.push({ palette: { in: [f.color] } })
  if (f.price) {
    const [min, max] = PRICE_RANGES[f.price]
    where.push({ price: { greater_than_equal: min } })
    if (max !== null) where.push({ price: { less_than: max } })
  }
  if (f.available) where.push({ status: { equals: 'published' satisfies Artwork['status'] } })
  return where
}

// Parametri URL minimi per i filtri attivi (niente chiavi vuote)
export function filtersToQuery(f: CatalogFilters): Record<string, string> {
  const q: Record<string, string> = {}
  if (f.sort) q.sort = f.sort
  if (f.shape) q.shape = f.shape
  if (f.color) q.color = f.color
  if (f.price) q.price = f.price
  if (f.available) q.available = '1'
  return q
}
