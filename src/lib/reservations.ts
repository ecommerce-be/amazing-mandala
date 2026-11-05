import config from '@payload-config'
import { type PostgresAdapter, sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

// Riserva e vendita dei pezzi unici con UPDATE condizionali in SQL:
// il controllo dello stato e la modifica avvengono nella stessa istruzione,
// quindi due clienti che pagano insieme non possono prendere lo stesso quadro.

// Stripe non accetta sessioni di checkout più brevi di 30 minuti: 31 per avere margine
export const RESERVATION_MINUTES = 31

async function db() {
  const payload = await getPayload({ config })
  return (payload.db as unknown as PostgresAdapter).drizzle
}

const idList = (ids: number[]) => sql.join(ids.map((id) => sql`${id}`), sql`, `)

/** Riserva il quadro solo se è ancora in vendita. Restituisce true se ci è riuscito. */
export async function reserveArtwork(id: number, until: Date) {
  const res = await (await db()).execute(sql`
    UPDATE artworks SET status = 'reserved', reserved_until = ${until.toISOString()}, updated_at = now()
    WHERE id = ${id} AND status = 'published'
    RETURNING id`)
  return res.rows.length === 1
}

/** Rimette in vendita i quadri riservati (es. pagamento annullato o scaduto). */
export async function releaseArtworks(ids: number[]) {
  if (ids.length === 0) return
  await (await db()).execute(sql`
    UPDATE artworks SET status = 'published', reserved_until = NULL, updated_at = now()
    WHERE id IN (${idList(ids)}) AND status = 'reserved'`)
}

/** Segna come venduti i quadri pagati. */
export async function markArtworksSold(ids: number[]) {
  if (ids.length === 0) return
  await (await db()).execute(sql`
    UPDATE artworks SET status = 'sold', reserved_until = NULL, updated_at = now()
    WHERE id IN (${idList(ids)}) AND status IN ('reserved', 'published')`)
}

/** Rete di sicurezza: libera le riserve scadute se un webhook non è arrivato. */
export async function releaseExpiredReservations() {
  await (await db()).execute(sql`
    UPDATE artworks SET status = 'published', reserved_until = NULL, updated_at = now()
    WHERE status = 'reserved' AND reserved_until < now() - interval '5 minutes'`)
}
