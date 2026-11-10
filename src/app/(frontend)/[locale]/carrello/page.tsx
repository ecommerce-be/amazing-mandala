import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CountrySelect } from '@/components/CountrySelect'
import { CouponForm } from '@/components/CouponForm'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { coverOf, formatPrice, getArtworksByIds } from '@/lib/artworks'
import { getCartIds } from '@/lib/cart'
import { removeFromCart } from '@/lib/cartActions'
import { startCheckout } from '@/lib/checkout'
import { applyCouponCode, removeCouponCode } from '@/lib/couponActions'
import { applyCoupon, checkCoupon, getCouponCode } from '@/lib/coupons'
import { getCurrentCustomer } from '@/lib/customerAuth'
import { DEFAULT_COUNTRY, EU_COUNTRIES, isCountry, shippingCost } from '@/lib/shipping'

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cart' })
  return { title: t('title'), robots: { index: false } }
}

export default async function CartPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('cart')
  const query = await searchParams
  const ids = await getCartIds()
  const artworks = await getArtworksByIds(locale, ids)
  const available = artworks.filter((a) => a.status === 'published')
  const unavailable = artworks.filter((a) => a.status !== 'published')
  const subtotal = available.reduce((sum, a) => sum + a.price, 0)
  const country = isCountry(query.country) ? query.country : DEFAULT_COUNTRY
  const code = await getCouponCode()
  const check = code && available.length > 0 ? await checkCoupon(code, subtotal, await getCurrentCustomer()) : null
  const coupon = check?.ok ? check.coupon : null
  const applied = applyCoupon(coupon, subtotal * 100, shippingCost(country, available) * 100)
  const discount = applied.discountCents / 100
  const shipping = applied.shippingCents / 100
  const regionName = new Intl.DisplayNames([locale], { type: 'region' })
  const countryOptions = EU_COUNTRIES.map((code) => ({ code, label: regionName.of(code) ?? code })).sort((a, b) =>
    a.label.localeCompare(b.label, locale),
  )

  return (
    <div className="mx-auto max-w-4xl px-4 pt-14 sm:px-8">
      <h1 className="font-display text-5xl">{t('title')}</h1>

      {query.cancelled && <p className="mt-6 rounded-md bg-paper/70 px-4 py-3">{t('cancelled')}</p>}
      {query.unavailable && <p className="mt-6 rounded-md bg-paper/70 px-4 py-3">{t('justSold')}</p>}

      {artworks.length === 0 ? (
        <div className="mt-10">
          <p className="text-ink-soft">{t('empty')}</p>
          <Link href="/" className="mt-6 inline-block rounded-md bg-ink px-6 py-3 text-on-ink hover:bg-ink/90">
            {t('browse')}
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
            {artworks.map((a) => {
              const img = coverOf(a, 'thumbnail')
              const ok = a.status === 'published'
              return (
                <li key={a.id} className="flex items-center gap-5 py-5">
                  <Link
                    href={{ pathname: '/opere/[slug]', params: { slug: a.slug } }}
                    className="relative size-24 shrink-0"
                  >
                    {img && <Image src={img.url} alt={img.alt} fill sizes="96px" className="object-contain p-2" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl">{a.title}</p>
                    <p className="text-sm text-ink-soft">
                      {ok ? `${a.widthCm} × ${a.heightCm} cm` : a.status === 'sold' ? t('soldMeanwhile') : t('reservedMeanwhile')}
                    </p>
                  </div>
                  <p className={`tabular-nums ${ok ? '' : 'text-ink-soft line-through'}`}>{formatPrice(a.price, locale)}</p>
                  <form action={removeFromCart.bind(null, a.id)}>
                    <button type="submit" className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline">
                      {t('remove')}
                    </button>
                  </form>
                </li>
              )
            })}
          </ul>

          {available.length > 0 && (
            <div className="mt-8 ml-auto max-w-sm">
              <CountrySelect
                name="country"
                value={country}
                options={countryOptions}
                label={t('country')}
                updateLabel={t('update')}
              />
              <dl className="mt-6 space-y-2 text-[15px]">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">{t('subtotal')}</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal, locale)}</dd>
                </div>
                {coupon && (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-ink-soft">
                      {t('discount', { code: coupon.code })}{' '}
                      <form action={removeCouponCode} className="inline">
                        <button type="submit" className="text-sm underline underline-offset-4 hover:text-ink">
                          {t('removeCoupon')}
                        </button>
                      </form>
                    </dt>
                    <dd className="tabular-nums">
                      {coupon.type === 'free_shipping' ? t('freeShippingCoupon') : `−${formatPrice(discount, locale)}`}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-soft">{t('shipping')}</dt>
                  <dd className="tabular-nums">{shipping === 0 ? t('free') : formatPrice(shipping, locale)}</dd>
                </div>
                <div className="flex justify-between border-t border-ink/15 pt-3 text-lg">
                  <dt>{t('total')}</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal - discount + shipping, locale)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-sm text-ink-soft">{t('vatIncluded')}</p>
              {!coupon && <CouponForm action={applyCouponCode.bind(null, locale)} />}
              {code && check && !check.ok && <p className="mt-2 text-sm text-[#9b1c1c]">{t('couponNoLonger')}</p>}
              <form action={startCheckout.bind(null, locale)} className="mt-6">
                <input type="hidden" name="country" value={country} />
                <button type="submit" className="w-full rounded-md bg-ink px-6 py-3 text-on-ink hover:bg-ink/90">
                  {t('checkout')}
                </button>
              </form>
              <p className="mt-3 text-sm text-ink-soft">{t('reservationNote')}</p>
            </div>
          )}
          {unavailable.length > 0 && available.length === 0 && (
            <Link href="/" className="mt-8 inline-block underline underline-offset-4">
              {t('browse')}
            </Link>
          )}
        </>
      )}
    </div>
  )
}
