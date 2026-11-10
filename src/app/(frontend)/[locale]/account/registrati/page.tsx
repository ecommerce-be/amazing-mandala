import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AccountForm } from '@/components/AccountForm'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { register } from '@/lib/accountActions'
import { getCurrentCustomer } from '@/lib/customerAuth'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account' })
  return { title: t('registerTitle'), robots: { index: false } }
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  if (await getCurrentCustomer()) redirect(getPathname({ locale, href: '/account' }))
  const t = await getTranslations('account')

  return (
    <div className="mx-auto max-w-md px-4 pt-14 sm:px-8">
      <h1 className="font-display text-5xl">{t('registerTitle')}</h1>
      <p className="mt-4 text-ink-soft">{t('registerIntro')}</p>
      <div className="mt-10">
        <AccountForm
          action={register.bind(null, locale)}
          submitLabel={t('registerSubmit')}
          fields={[
            { name: 'firstName', label: t('firstName'), autoComplete: 'given-name' },
            { name: 'lastName', label: t('lastName'), autoComplete: 'family-name' },
            { name: 'email', type: 'email', label: t('email'), autoComplete: 'email', required: true },
            {
              name: 'password',
              type: 'password',
              label: t('password'),
              autoComplete: 'new-password',
              required: true,
              hint: t('passwordHint'),
            },
          ]}
        />
      </div>
      <p className="mt-6 text-[15px] text-ink-soft">
        {t('haveAccount')}{' '}
        <Link href="/account/accedi" className="text-ink underline underline-offset-4">
          {t('loginLink')}
        </Link>
      </p>
    </div>
  )
}
