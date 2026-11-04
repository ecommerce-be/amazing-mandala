import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArtworkCard } from '@/components/ArtworkCard'
import { CatalogFilters } from '@/components/CatalogFilters'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { listArtworks } from '@/lib/artworks'
import { filtersToQuery, hasActiveFilters, parseFilters } from '@/lib/catalogFilters'

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'catalog' })
  return { title: t('title'), description: t('intro') }
}

export default async function CatalogPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('catalog')
  const raw = await searchParams
  const filters = parseFilters(raw)

  // Il form invia anche i campi lasciati su "Qualsiasi": ripuliamo l'URL
  const query = filtersToQuery(filters)
  if (Object.keys(raw).length !== Object.keys(query).length) {
    redirect(getPathname({ locale, href: { pathname: '/opere', query } }))
  }
  const active = hasActiveFilters(filters)
  const { docs, totalDocs } = await listArtworks(locale, { filters })

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl">{t('title')}</h1>
          <p className="mt-4 max-w-[56ch] text-ink-soft">{t('intro')}</p>
        </div>
        <p className="text-sm text-ink-soft" aria-live="polite">
          {t('count', { count: totalDocs })}
        </p>
      </header>

      <CatalogFilters filters={filters} active={active} />

      {docs.length === 0 ? (
        <div className="mt-16">
          <p className="text-ink-soft">{active ? t('noMatch') : t('empty')}</p>
          {active && (
            <Link href="/opere" className="mt-4 inline-block underline underline-offset-4">
              {t('showAll')}
            </Link>
          )}
        </div>
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
