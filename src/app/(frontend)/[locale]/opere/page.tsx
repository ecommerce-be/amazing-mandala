import { redirect } from 'next/navigation'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { filtersToQuery, parseFilters } from '@/lib/catalogFilters'

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// Il catalogo è la home: /opere resta solo per i link già condivisi
export default async function CatalogRedirect({ params, searchParams }: Props) {
  const { locale } = await params
  const query = filtersToQuery(parseFilters(await searchParams))
  redirect(getPathname({ locale, href: { pathname: '/', query } }))
}
