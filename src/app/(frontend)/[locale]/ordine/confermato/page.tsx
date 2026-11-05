import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getStripe } from '@/lib/stripe'

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ session_id?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'order' })
  return { title: t('title'), robots: { index: false } }
}

export default async function OrderConfirmedPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('order')
  const { session_id } = await searchParams

  let email: string | null = null
  if (session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id)
      email = session.customer_details?.email ?? null
    } catch {
      // sessione non valida: mostriamo comunque il ringraziamento
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-20 text-center sm:px-8">
      <h1 className="font-display text-5xl">{t('title')}</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-soft">
        {email ? t('bodyWithEmail', { email }) : t('body')}
      </p>
      <Link href="/" className="mt-10 inline-block rounded-md bg-ink px-6 py-3 text-on-ink hover:bg-ink/90">
        {t('backToShop')}
      </Link>
    </div>
  )
}
