import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AccountForm } from '@/components/AccountForm'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { login } from '@/lib/accountActions'
import { getCurrentCustomer } from '@/lib/customerAuth'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ next?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account' })
  return { title: t('loginTitle'), robots: { index: false } }
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  if (await getCurrentCustomer()) redirect(getPathname({ locale, href: '/account' }))
  const t = await getTranslations('account')
  const { next } = await searchParams

  return (
    <div className="mx-auto max-w-md px-4 pt-14 sm:px-8">
      <h1 className="font-display text-5xl">{t('loginTitle')}</h1>
      <div className="mt-10">
        <AccountForm
          action={login.bind(null, locale)}
          submitLabel={t('loginSubmit')}
          fields={[
            { name: 'email', type: 'email', label: t('email'), autoComplete: 'email', required: true },
            { name: 'password', type: 'password', label: t('password'), autoComplete: 'current-password', required: true },
            { name: 'next', type: 'hidden', defaultValue: next ?? '' },
          ]}
        />
      </div>
      <div className="mt-6 flex flex-col gap-2 text-[15px]">
        <Link href="/account/password-dimenticata" className="text-ink-soft underline-offset-4 hover:text-ink hover:underline">
          {t('forgotLink')}
        </Link>
        <p className="text-ink-soft">
          {t('noAccount')}{' '}
          <Link href="/account/registrati" className="text-ink underline underline-offset-4">
            {t('registerLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
