import { getTranslations } from 'next-intl/server'

import { ArtworkCard } from '@/components/ArtworkCard'
import { CatalogFilters } from '@/components/CatalogFilters'
import { Logo } from '@/components/Logo'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { listArtworks } from '@/lib/artworks'
import { type CatalogFilters as Filters, hasActiveFilters } from '@/lib/catalogFilters'

export async function Storefront({ locale, filters }: { locale: Locale; filters: Filters }) {
  const t = await getTranslations({ locale, namespace: 'catalog' })
  const active = hasActiveFilters(filters)
  const { docs, totalDocs } = await listArtworks(locale, { filters })

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
      <header className="flex items-center gap-6 sm:gap-10">
        <Logo className="size-28 shrink-0 sm:size-40" />
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">{t('title')}</h1>
          <p className="mt-3 max-w-[60ch] leading-relaxed text-ink-soft">{t('intro')}</p>
        </div>
      </header>

      <CatalogFilters filters={filters} active={active} />

      <p className="mt-6 text-sm text-ink-soft" aria-live="polite">
        {t('count', { count: totalDocs })}
      </p>

      {docs.length === 0 ? (
        <div className="mt-10">
          <p className="text-ink-soft">{active ? t('noMatch') : t('empty')}</p>
          {active && (
            <Link href="/" className="mt-4 inline-block underline underline-offset-4">
              {t('showAll')}
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
