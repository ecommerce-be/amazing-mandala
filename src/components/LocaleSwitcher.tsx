'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

import { Link, usePathname } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const params = useParams()
  const other = locale === 'it' ? 'en' : 'it'

  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      href={{ pathname, params } as any}
      locale={other}
      hrefLang={other}
      translate="no"
      className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
    >
      {t('switchTo')}
    </Link>
  )
}
