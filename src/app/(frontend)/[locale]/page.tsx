import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { Storefront } from '@/components/Storefront'
import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { filtersToQuery, parseFilters } from '@/lib/catalogFilters'

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const raw = await searchParams
  const filters = parseFilters(raw)

  // Il form invia anche i campi lasciati su "Qualsiasi": ripuliamo l'URL
  const query = filtersToQuery(filters)
  if (Object.keys(raw).length !== Object.keys(query).length) {
    redirect(getPathname({ locale, href: { pathname: '/', query } }))
  }

  return <Storefront locale={locale} filters={filters} />
}
