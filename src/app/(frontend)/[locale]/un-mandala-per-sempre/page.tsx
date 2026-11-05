import config from '@payload-config'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { GenerativeMandala } from '@/components/GenerativeMandala'
import { Logo } from '@/components/Logo'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { imageOf } from '@/lib/artworks'

type Props = { params: Promise<{ locale: Locale }> }

export const revalidate = 3600

async function getAbout(locale: Locale) {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'about-page', locale, depth: 1 })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  const about = await getAbout(locale)
  return { title: about.title || t('title'), description: about.subtitle || t('subtitle') }
}

// Semi scelti per avere sei mandala ben diversi tra loro
const SEEDS = [7, 21, 42, 108, 333, 777]

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')
  const about = await getAbout(locale)

  const title = about.title || t('title')
  const subtitle = about.subtitle || t('subtitle')
  const sections =
    about.sections && about.sections.length > 0
      ? about.sections.map((s) => ({ heading: s.heading, body: s.body }))
      : (t.raw('sections') as { heading: string; body: string }[])
  const gallery = (about.generativeGallery ?? [])
    .map((g) => ({ img: imageOf(g.image, 'card'), caption: g.caption }))
    .filter((g) => g.img !== null)

  return (
    <article className="mx-auto max-w-6xl px-4 pt-14 sm:px-8">
      <header className="grid items-center gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <h1 className="font-display text-5xl leading-[1.05] sm:text-7xl">{title}</h1>
          <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-ink-soft">{subtitle}</p>
        </div>
        <Logo className="mx-auto w-full max-w-sm" />
      </header>

      <div className="mt-20 grid gap-14 md:grid-cols-2">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-3xl">{s.heading}</h2>
            <p className="mt-4 max-w-[60ch] whitespace-pre-line text-[17px] leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-24 border-t border-ink/15 pt-10">
        <h2 className="font-display text-3xl">{t('galleryTitle')}</h2>
        <p className="mt-3 max-w-[60ch] text-ink-soft">{t('galleryIntro')}</p>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {gallery.length > 0
            ? gallery.map((g) => (
                <figure key={g.img!.url}>
                  <div className="relative aspect-square">
                    <Image src={g.img!.url} alt={g.img!.alt} fill sizes="33vw" className="object-contain" />
                  </div>
                  {g.caption && <figcaption className="mt-2 text-sm text-ink-soft">{g.caption}</figcaption>}
                </figure>
              ))
            : SEEDS.map((seed) => <GenerativeMandala key={seed} seed={seed} className="w-full" />)}
        </div>
      </section>

      <p className="mt-20">
        <Link href="/" className="inline-block rounded-md bg-ink px-6 py-3 text-on-ink hover:bg-ink/90">
          {t('cta')}
        </Link>
      </p>
    </article>
  )
}
