import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatPrice, getArtworkBySlug, imageOf } from '@/lib/artworks'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const artwork = await getArtworkBySlug(locale, slug)
  if (!artwork) return {}
  return { title: artwork.title, description: artwork.excerpt ?? undefined }
}

export default async function ArtworkPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const artwork = await getArtworkBySlug(locale, slug)
  if (!artwork) notFound()

  const t = await getTranslations('artwork')
  const images = (artwork.images ?? [])
    .map((item) => imageOf(item.image, 'large'))
    .filter((img): img is NonNullable<typeof img> => img !== null)
  const [main, ...rest] = images

  const details: { label: string; value: string }[] = [
    { label: t('dimensions'), value: t('size', { width: artwork.widthCm, height: artwork.heightCm }) },
  ]
  if (artwork.depthCm) details.push({ label: t('depth'), value: `${artwork.depthCm} cm` })
  if (artwork.wood) details.push({ label: t('wood'), value: artwork.wood })
  if (artwork.techniques?.length) details.push({ label: t('techniques'), value: artwork.techniques.join(', ') })

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
      <Link href="/opere" className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline">
        {t('back')}
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-4">
          {main && (
            <div className="relative aspect-square bg-paper-deep">
              <Image
                src={main.url}
                alt={main.alt}
                fill
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-contain p-8"
              />
            </div>
          )}
          {rest.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {rest.map((img) => (
                <div key={img.url} className="relative aspect-square bg-paper-deep">
                  <Image src={img.url} alt={img.alt} fill sizes="20vw" className="object-contain p-3" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{artwork.title}</h1>
          {artwork.excerpt && <p className="mt-5 text-lg leading-relaxed text-ink-soft">{artwork.excerpt}</p>}

          <div className="mt-8 border-t border-ink/15 pt-6">
            {artwork.status === 'sold' ? (
              <p className="font-display text-2xl">{t('soldNote')}</p>
            ) : (
              <>
                <p className="text-3xl tabular-nums">{formatPrice(artwork.price, locale)}</p>
                <p className="mt-1 text-sm text-ink-soft">{t('vatIncluded')}</p>
                <p className="mt-6 text-sm text-ink-soft">
                  {artwork.status === 'reserved' ? t('reservedNote') : t('comingSoon')}
                </p>
              </>
            )}
          </div>

          {artwork.meaning && (
            <>
              <h2 className="mt-10 font-display text-xl">{t('meaning')}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed">{artwork.meaning}</p>
            </>
          )}

          <h2 className="mt-10 font-display text-xl">{t('details')}</h2>
          <dl className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {details.map((d) => (
              <div key={d.label} className="flex justify-between gap-6 py-3 text-[15px]">
                <dt className="text-ink-soft">{d.label}</dt>
                <dd className="text-right">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
