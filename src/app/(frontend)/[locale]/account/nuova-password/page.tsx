import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AccountForm } from '@/components/AccountForm'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { resetPassword } from '@/lib/accountActions'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ token?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account' })
  return { title: t('resetTitle'), robots: { index: false } }
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('account')
  const { token } = await searchParams

  return (
    <div className="mx-auto max-w-md px-4 pt-14 sm:px-8">
      <h1 className="font-display text-5xl">{t('resetTitle')}</h1>
      {token ? (
        <div className="mt-10">
          <AccountForm
            action={resetPassword.bind(null, locale)}
            submitLabel={t('resetSubmit')}
            fields={[
              { name: 'password', type: 'password', label: t('newPassword'), autoComplete: 'new-password', required: true, hint: t('passwordHint') },
              { name: 'token', type: 'hidden', defaultValue: token },
            ]}
          />
        </div>
      ) : (
        <p className="mt-6 text-ink-soft">
          {t('errors.invalidResetLink')}{' '}
          <Link href="/account/password-dimenticata" className="text-ink underline underline-offset-4">
            {t('forgotLink')}
          </Link>
        </p>
      )}
    </div>
  )
}
