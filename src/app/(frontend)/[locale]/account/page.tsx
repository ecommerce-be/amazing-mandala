import config from '@payload-config'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { AccountForm } from '@/components/AccountForm'
import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { logout, updateProfile } from '@/lib/accountActions'
import { getCurrentCustomer } from '@/lib/customerAuth'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account' })
  return { title: t('title'), robots: { index: false } }
}

const VISIBLE_STATUSES = ['paid', 'shipped', 'delivered', 'refunded']

export default async function AccountPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const customer = await getCurrentCustomer()
  if (!customer) {
    const here = getPathname({ locale, href: '/account' })
    redirect(`${getPathname({ locale, href: '/account/accedi' })}?next=${encodeURIComponent(here)}`)
  }
  const t = await getTranslations('account')
  const format = await getFormatter()

  // Ordini collegati all'account, più quelli fatti senza account con la stessa email
  const payload = await getPayload({ config })
  const { docs: orders } = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { status: { in: VISIBLE_STATUSES } },
        { or: [{ customer: { equals: customer.id } }, { email: { equals: customer.email } }] },
      ],
    },
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  })
  const eur = (cents?: number | null) => format.number((cents ?? 0) / 100, { style: 'currency', currency: 'EUR' })

  return (
    <div className="mx-auto max-w-4xl px-4 pt-14 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">{t('title')}</h1>
          <p className="mt-3 text-ink-soft">
            {customer.firstName ? t('hello', { name: customer.firstName }) : customer.email}
          </p>
        </div>
        <form action={logout.bind(null, locale)}>
          <button type="submit" className="text-[15px] text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            {t('logout')}
          </button>
        </form>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-3xl">{t('ordersTitle')}</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-ink-soft">{t('noOrders')}</p>
        ) : (
          <ul className="mt-6 divide-y divide-ink/15 border-y border-ink/15">
            {orders.map((o) => (
              <li key={o.id} className="py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-lg font-medium tracking-wide tabular-nums">{o.orderNumber}</p>
                  <p className="tabular-nums">{eur(o.total)}</p>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {format.dateTime(new Date(o.createdAt), { dateStyle: 'long' })} · {t(`status.${o.status}`)}
                </p>
                <p className="mt-2 text-[15px]">{(o.items ?? []).map((i) => i.title).join(', ')}</p>
                {o.status === 'shipped' && o.trackingNumber && (
                  <p className="mt-2 text-[15px]">
                    {t('tracking')}: <span className="tabular-nums">{o.trackingNumber}</span>
                    {o.trackingUrl && (
                      <>
                        {' · '}
                        <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                          {t('trackParcel')}
                        </a>
                      </>
                    )}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16 max-w-md">
        <h2 className="font-display text-3xl">{t('profileTitle')}</h2>
        <p className="mt-2 text-sm text-ink-soft">{customer.email}</p>
        <div className="mt-6">
          <AccountForm
            action={updateProfile.bind(null, locale)}
            submitLabel={t('save')}
            fields={[
              { name: 'firstName', label: t('firstName'), autoComplete: 'given-name', defaultValue: customer.firstName ?? '' },
              { name: 'lastName', label: t('lastName'), autoComplete: 'family-name', defaultValue: customer.lastName ?? '' },
              { name: 'phone', type: 'tel', label: t('phone'), autoComplete: 'tel', defaultValue: customer.phone ?? '' },
            ]}
          />
        </div>
      </section>
    </div>
  )
}
