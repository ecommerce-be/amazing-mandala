import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Figtree, Great_Vibes, Marcellus } from 'next/font/google'
import { notFound } from 'next/navigation'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { routing } from '@/i18n/routing'
import { ACTIVE_PALETTE } from '@/lib/theme'

import '../globals.css'

const marcellus = Marcellus({ weight: '400', subsets: ['latin'], variable: '--font-marcellus' })
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree' })
// Corsivo usato solo nel logo
const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'], variable: '--font-script' })

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'site' })
  return {
    title: { default: t('name'), template: `%s · ${t('name')}` },
    description: t('description'),
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html lang={locale} data-palette={ACTIVE_PALETTE} className={`${marcellus.variable} ${figtree.variable} ${greatVibes.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
