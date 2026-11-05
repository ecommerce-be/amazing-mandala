import { cookies } from 'next/headers'

// Il carrello è un cookie con gli id dei quadri: ogni quadro è un pezzo unico,
// quindi niente quantità. La disponibilità vera si controlla sempre sul database.
export const CART_COOKIE = 'am_cart'
const MAX_ITEMS = 20

export function parseCart(raw: string | undefined): number[] {
  if (!raw) return []
  try {
    const ids = JSON.parse(raw)
    if (!Array.isArray(ids)) return []
    return [...new Set(ids.filter((n): n is number => Number.isInteger(n) && n > 0))].slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

export async function getCartIds() {
  return parseCart((await cookies()).get(CART_COOKIE)?.value)
}

export const cartCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
}

export async function setCartIds(ids: number[]) {
  ;(await cookies()).set(CART_COOKIE, JSON.stringify(ids.slice(0, MAX_ITEMS)), cartCookieOptions)
}
