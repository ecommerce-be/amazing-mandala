import config from '@payload-config'
import { getPayload, type Where } from 'payload'

import type { Locale } from '@/i18n/routing'
import type { Artwork, Media } from '@/payload-types'

import { type CatalogFilters, filtersToWhere } from './catalogFilters'

// Il sito pubblico mostra solo questi stati (i venduti restano come archivio)
const PUBLIC_STATUSES: Artwork['status'][] = ['published', 'reserved', 'sold']

const publicWhere: Where = { status: { in: PUBLIC_STATUSES } }

export async function listArtworks(
  locale: Locale,
  opts: { limit?: number; filters?: CatalogFilters } = {},
) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'artworks',
    locale,
    where: { and: [publicWhere, ...filtersToWhere(opts.filters ?? {})] },
    sort: '-publishedAt',
    limit: opts.limit ?? 60,
    depth: 1,
    overrideAccess: false,
  })
  return result
}

export async function getArtworkBySlug(locale: Locale, slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'artworks',
    locale,
    where: { and: [publicWhere, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return result.docs[0] ?? null
}

export type ArtworkImage = { url: string; alt: string; width: number; height: number }

type Size = 'thumbnail' | 'card' | 'large' | 'zoom'

// Restituisce la versione ridimensionata se esiste, altrimenti l'originale
export function imageOf(media: number | Media | null | undefined, size: Size): ArtworkImage | null {
  if (!media || typeof media === 'number' || !media.url) return null
  const sized = media.sizes?.[size]
  const url = sized?.url ?? media.url
  return {
    url,
    alt: media.alt ?? '',
    width: sized?.width ?? media.width ?? 1200,
    height: sized?.height ?? media.height ?? 1200,
  }
}

export function coverOf(artwork: Artwork, size: Size) {
  return imageOf(artwork.images?.[0]?.image, size)
}

export function formatPrice(euros: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(euros)
}
