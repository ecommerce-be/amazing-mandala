import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { LocaleSwitcher } from './LocaleSwitcher'

export function SiteHeader() {
  const t = useTranslations()

  return (
    <header className="border-b border-ink/15">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-5 sm:px-8">
        <Link href="/" className="font-display text-2xl tracking-wide">
          {t('site.name')}
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/opere" className="text-[15px] underline-offset-4 hover:underline">
            {t('nav.works')}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  )
}
