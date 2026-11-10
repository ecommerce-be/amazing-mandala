'use server'

import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { revalidateSite } from '@/hooks/revalidateSite'
import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

import { coverOf, getArtworksByIds } from './artworks'
import { getCartIds, setCartIds } from './cart'
import { getCurrentCustomer } from './customerAuth'
import { releaseArtworks, RESERVATION_MINUTES, reserveArtwork } from './reservations'
import { DEFAULT_COUNTRY, isCountry, shippingCost } from './shipping'
import { getStripe, SITE_URL } from './stripe'

export async function startCheckout(locale: Locale, formData: FormData) {
  const countryRaw = formData.get('country')
  const country = isCountry(countryRaw) ? countryRaw : DEFAULT_COUNTRY
  const cartPath = getPathname({ locale, href: '/carrello' })
  const customer = await getCurrentCustomer()
  const artworks = (await getArtworksByIds(locale, await getCartIds())).filter((a) => a.status === 'published')
  if (artworks.length === 0) redirect(cartPath)

  // 1. Riserva ogni quadro; se uno nel frattempo è stato preso, annulla tutto
  const until = new Date(Date.now() + RESERVATION_MINUTES * 60_000)
  const reserved: number[] = []
  for (const a of artworks) {
    if (await reserveArtwork(a.id, until)) reserved.push(a.id)
    else {
      await releaseArtworks(reserved)
      redirect(`${cartPath}?unavailable=1`)
    }
  }
  revalidateSite()

  // 2. Sessione Stripe Checkout
  const stripe = getStripe()
  const subtotal = artworks.reduce((sum, a) => sum + a.price * 100, 0)
  const shippingCents = shippingCost(country, artworks) * 100
  const shippingLabel =
    shippingCents === 0
      ? locale === 'it' ? 'Spedizione gratuita con BRT, assicurata e tracciata' : 'Free insured, tracked shipping with BRT'
      : locale === 'it' ? 'Spedizione BRT assicurata e tracciata' : 'Insured, tracked BRT shipping'
  let sessionUrl: string
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ...(customer ? { customer_email: customer.email } : {}),
      locale,
      expires_at: Math.floor(until.getTime() / 1000),
      line_items: artworks.map((a) => {
        const img = coverOf(a, 'card')
        return {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: a.price * 100,
            product_data: {
              name: a.title,
              // Stripe accetta solo immagini su https pubblico (non localhost)
              ...(img && SITE_URL.startsWith('https') ? { images: [SITE_URL + img.url] } : {}),
              metadata: { artworkId: String(a.id) },
            },
          },
        }
      }),
      // il paese è quello scelto nel carrello: la tariffa dipende da lì
      shipping_address_collection: { allowed_countries: [country] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingCents, currency: 'eur' },
            display_name: shippingLabel,
          },
        },
      ],
      phone_number_collection: { enabled: true },
      metadata: { artworkIds: reserved.join(','), locale, country },
      success_url: `${SITE_URL}${getPathname({ locale, href: '/ordine/confermato' })}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/api/checkout/cancel?session_id={CHECKOUT_SESSION_ID}&locale=${locale}`,
    })

    // 3. Ordine in attesa di pagamento
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'orders',
      data: {
        status: 'pending',
        locale,
        customer: customer?.id,
        stripeSessionId: session.id,
        items: artworks.map((a) => ({ artwork: a.id, title: a.title, priceCents: a.price * 100 })),
        country,
        subtotal,
        shipping: shippingCents,
        total: subtotal + shippingCents,
      },
    })
    sessionUrl = session.url!
  } catch (err) {
    await releaseArtworks(reserved)
    revalidateSite()
    throw err
  }

  // Il carrello si svuota: i quadri ora sono riservati per questo pagamento.
  // Se il cliente annulla, /api/checkout/cancel li rimette nel carrello.
  await setCartIds([])
  redirect(sessionUrl)
}
