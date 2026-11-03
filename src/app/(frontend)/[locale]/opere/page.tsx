import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArtworkCard } from '@/components/ArtworkCard'
import type { Locale } from '@/i18n/routing'
import { listArtworks } from '@/lib/artworks'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'catalog' })
  return { title: t('title'), description: t('intro') }
}

export default async function CatalogPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('catalog')
  const { docs, totalDocs } = await listArtworks(locale)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl">{t('title')}</h1>
          <p className="mt-4 max-w-[56ch] text-ink-soft">{t('intro')}</p>
        </div>
        <p className="text-sm text-ink-soft">{t('count', { count: totalDocs })}</p>
      </header>

      {docs.length === 0 ? (
        <p className="mt-16 text-ink-soft">{t('empty')}</p>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
