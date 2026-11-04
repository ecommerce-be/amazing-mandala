import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArtworkCard } from '@/components/ArtworkCard'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { listArtworks } from '@/lib/artworks'

// Rete di sicurezza: oltre alla rigenerazione al salvataggio, aggiorna ogni ora
export const revalidate = 3600

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')
  const { docs } = await listArtworks(locale, { limit: 6 })

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-8 sm:pt-28">
        <h1 className="max-w-[14ch] font-display text-5xl leading-[1.05] sm:text-7xl">{t('title')}</h1>
        <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-ink-soft">{t('intro')}</p>
        <Link
          href="/opere"
          className="mt-10 inline-block rounded-md bg-ink px-6 py-3 text-on-ink hover:bg-ink/90"
        >
          {t('cta')}
        </Link>
      </section>

      {docs.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-8">
          <h2 className="border-t border-ink/15 pt-8 font-display text-2xl">{t('latest')}</h2>
          <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
