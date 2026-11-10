import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AccountForm } from '@/components/AccountForm'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { forgotPassword } from '@/lib/accountActions'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account' })
  return { title: t('forgotTitle'), robots: { index: false } }
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('account')

  return (
    <div className="mx-auto max-w-md px-4 pt-14 sm:px-8">
      <h1 className="font-display text-5xl">{t('forgotTitle')}</h1>
      <p className="mt-4 text-ink-soft">{t('forgotIntro')}</p>
      <div className="mt-10">
        <AccountForm
          action={forgotPassword.bind(null, locale)}
          submitLabel={t('forgotSubmit')}
          fields={[{ name: 'email', type: 'email', label: t('email'), autoComplete: 'email', required: true }]}
        />
      </div>
      <Link href="/account/accedi" className="mt-6 inline-block text-[15px] text-ink-soft underline-offset-4 hover:text-ink hover:underline">
        {t('backToLogin')}
      </Link>
    </div>
  )
}
