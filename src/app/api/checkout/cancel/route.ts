import { NextResponse } from 'next/server'

import { getPathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { CART_COOKIE, cartCookieOptions } from '@/lib/cart'
import { artworkIdsFromSession, cancelOrder } from '@/lib/orders'
import { getStripe, SITE_URL } from '@/lib/stripe'

// Il cliente torna indietro da Stripe senza pagare: chiudiamo la sessione,
// liberiamo i quadri e li rimettiamo nel suo carrello.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const locale = (routing.locales as readonly string[]).includes(url.searchParams.get('locale') ?? '')
    ? (url.searchParams.get('locale') as Locale)
    : routing.defaultLocale
  const res = NextResponse.redirect(`${SITE_URL}${getPathname({ locale, href: '/carrello' })}?cancelled=1`)

  const sessionId = url.searchParams.get('session_id')
  if (!sessionId) return res

  const stripe = getStripe()
  let session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.status === 'open') session = await stripe.checkout.sessions.expire(sessionId)
  if (session.status === 'expired') {
    await cancelOrder(session)
    res.cookies.set(CART_COOKIE, JSON.stringify(artworkIdsFromSession(session)), cartCookieOptions)
  }
  return res
}
