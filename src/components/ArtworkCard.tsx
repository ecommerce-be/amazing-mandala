import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { coverOf, formatPrice } from '@/lib/artworks'
import type { Artwork } from '@/payload-types'

export async function ArtworkCard({ artwork, locale }: { artwork: Artwork; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'artwork' })
  const cover = coverOf(artwork, 'card')
  const unavailable = artwork.status === 'sold' || artwork.status === 'reserved'

  return (
    <article>
      <Link href={{ pathname: '/opere/[slug]', params: { slug: artwork.slug } }} className="group block">
        <div className="relative aspect-square overflow-hidden bg-paper-deep">
          {cover && (
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={`object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03] ${unavailable ? 'opacity-60' : ''}`}
            />
          )}
          {unavailable && (
            <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs text-on-ink">
              {artwork.status === 'sold' ? t('sold') : t('reserved')}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl group-hover:underline group-hover:underline-offset-4">
            {artwork.title}
          </h2>
          {artwork.status !== 'sold' && (
            <p className="shrink-0 tabular-nums">{formatPrice(artwork.price, locale)}</p>
          )}
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {t('size', { width: artwork.widthCm, height: artwork.heightCm })}
          {artwork.wood ? `, ${artwork.wood}` : ''}
        </p>
      </Link>
    </article>
  )
}
