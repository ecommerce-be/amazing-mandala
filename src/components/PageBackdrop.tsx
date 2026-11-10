import config from '@payload-config'
import { getPayload } from 'payload'

import { imageOf } from '@/lib/artworks'

import type { Artwork } from '@/payload-types'

// Tra i quadri disponibili più recenti (RECENT) si scelgono i più colorati (CANDIDATES),
// perché un quadro scuro sfocato diventa un beige spento
const RECENT = 6
const CANDIDATES = 3
const NEUTRAL = new Set(['black', 'white', 'silver', 'brown', 'natural'])

const colorfulness = (a: Artwork) => (a.palette ?? []).filter((c) => !NEUTRAL.has(c)).length

async function pickBackdrop() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'artworks',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: RECENT,
      depth: 1,
      overrideAccess: false,
    })
    const withImage = docs
      .map((a, i) => ({ a, i, img: imageOf(a.images?.[0]?.image, 'thumbnail') }))
      .filter((x) => x.img !== null)
      // più colorati prima; a parità, il più recente
      .sort((x, y) => colorfulness(y.a) - colorfulness(x.a) || x.i - y.i)
      .slice(0, CANDIDATES)
      .map((x) => x.img!)
    if (withImage.length === 0) return null
    // Rotazione giornaliera, non casuale: lo sfondo resta uguale durante la visita
    // (anche quando la pagina si aggiorna dopo un'azione) e cambia il giorno dopo
    const day = Math.floor(Date.now() / 86_400_000)
    return withImage[day % withImage.length].url
  } catch {
    return null
  }
}

/**
 * Sfondo fisso di tutta la pagina: un quadro molto sfocato.
 * Usa la miniatura (400 px), che sfocata non perde nulla e pesa pochissimo.
 * Se non ci sono quadri disponibili usa l'immagine di riserva in public/backgrounds.
 */
export async function PageBackdrop() {
  const url = (await pickBackdrop()) ?? '/backgrounds/sfondo.jpg'
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div
        className="absolute -inset-24 bg-cover bg-center blur-[48px] saturate-[1.1]"
        style={{ backgroundImage: `url("${url}")` }}
      />
    </div>
  )
}
