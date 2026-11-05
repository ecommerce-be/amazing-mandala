import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { CartLink } from './CartLink'
import { LocaleSwitcher } from './LocaleSwitcher'
import { LogoMark } from './Logo'

export function SiteHeader() {
  const t = useTranslations()

  return (
    <header className="border-b border-ink/15">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-display text-2xl tracking-wide">
          <LogoMark className="size-10" />
          {t('site.name')}
        </Link>
        <nav className="flex items-center gap-6 text-[15px]">
          <Link href="/" className="underline-offset-4 hover:underline">
            {t('nav.shop')}
          </Link>
          <Link href="/un-mandala-per-sempre" className="underline-offset-4 hover:underline">
            {t('nav.about')}
          </Link>
          <CartLink />
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  )
}
