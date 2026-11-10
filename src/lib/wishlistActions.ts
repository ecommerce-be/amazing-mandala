'use server'

import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

import { getCurrentCustomer, getWishlistIds } from './customerAuth'

/** Aggiunge o toglie un quadro dai preferiti. Gli ospiti vengono mandati ad accedere. */
export async function toggleWishlist(locale: Locale, artworkId: number, returnTo: string) {
  const customer = await getCurrentCustomer()
  if (!customer) {
    const next = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/'
    redirect(`${getPathname({ locale, href: '/account/accedi' })}?next=${encodeURIComponent(next)}`)
  }
  const ids = await getWishlistIds()
  const wishlist = ids.includes(artworkId) ? ids.filter((id) => id !== artworkId) : [...ids, artworkId]
  const payload = await getPayload({ config })
  await payload.update({ collection: 'customers', id: customer.id, data: { wishlist } })
  revalidatePath('/', 'layout')
}
