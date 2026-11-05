/**
 * Carica i quadri di prova nel database locale, con foto e dati provvisori.
 *
 *   npm run seed            importa (rimuove prima i quadri di prova già presenti)
 *   npm run seed:reset      rimuove soltanto i quadri di prova
 *
 * Cartella delle foto: variabile SEED_PHOTOS_DIR, altrimenti quella predefinita qui sotto.
 * I quadri di prova hanno lo slug che inizia con "seed-": i quadri veri non vengono toccati.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'

import config from '../src/payload.config'
import type { Artwork } from '../src/payload-types'

type SeedItem = {
  file: string
  slug: string
  title: { it: string; en: string }
  shape: Artwork['shape']
  widthCm: number
  heightCm: number
  price: number
  palette: NonNullable<Artwork['palette']>
  featured: boolean
}

const DEFAULT_DIR = 'C:\\Users\\39347\\Pictures\\foto mandala\\ecommerce'
const here = path.dirname(fileURLToPath(import.meta.url))
const items: SeedItem[] = JSON.parse(fs.readFileSync(path.join(here, 'seed-artworks.json'), 'utf8'))
const resetOnly = process.env.SEED_RESET_ONLY === '1'
const photosDir = process.env.SEED_PHOTOS_DIR || DEFAULT_DIR

const payload = await getPayload({ config })

// 1. Rimuove i quadri di prova esistenti e le loro foto
const existing = await payload.find({
  collection: 'artworks',
  where: { slug: { like: 'seed-' } },
  limit: 500,
  depth: 0,
})
for (const doc of existing.docs) {
  const mediaIds = (doc.images ?? []).map((i) => (typeof i.image === 'number' ? i.image : i.image.id))
  await payload.delete({ collection: 'artworks', id: doc.id })
  for (const id of mediaIds) await payload.delete({ collection: 'media', id }).catch(() => undefined)
}
payload.logger.info(`Rimossi ${existing.docs.length} quadri di prova`)

if (resetOnly) process.exit(0)

if (!fs.existsSync(photosDir)) {
  payload.logger.error(`Cartella foto non trovata: ${photosDir}`)
  process.exit(1)
}

// 2. Importa foto e quadri
let created = 0
for (const item of items) {
  const filePath = path.join(photosDir, item.file)
  if (!fs.existsSync(filePath)) {
    payload.logger.warn(`Foto mancante, salto: ${item.file}`)
    continue
  }

  const media = await payload.create({
    collection: 'media',
    data: { alt: `${item.title.it}, mandala inciso e dipinto a mano su legno` },
    filePath,
  })

  await payload.create({
    collection: 'artworks',
    data: {
      title: item.title.it,
      slug: item.slug,
      generateSlug: false,
      excerpt: 'Mandala inciso e dipinto a mano su legno. Testo provvisorio.',
      images: [{ image: media.id, kind: 'main' }],
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      shape: item.shape,
      palette: item.palette,
      price: item.price,
      featured: item.featured,
      status: 'published',
    },
  })
  created++
  payload.logger.info(`${created}/${items.length} ${item.title.it}`)
}

payload.logger.info(`Importati ${created} quadri di prova`)
process.exit(0)
