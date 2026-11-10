import { getLocale, getTranslations } from 'next-intl/server'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getWishlistIds } from '@/lib/customerAuth'
import { toggleWishlist } from '@/lib/wishlistActions'

// Cuore dei preferiti. returnTo = pagina a cui tornare dopo l'accesso (per gli ospiti)
export async function WishlistButton({
  artworkId,
  slug,
  className = '',
}: {
  artworkId: number
  slug: string
  className?: string
}) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('wishlist')
  const saved = (await getWishlistIds()).includes(artworkId)
  const returnTo = getPathname({ locale, href: { pathname: '/opere/[slug]', params: { slug } } })

  return (
    <form action={toggleWishlist.bind(null, locale, artworkId, returnTo)} className={className}>
      <button
        type="submit"
        aria-pressed={saved}
        aria-label={saved ? t('remove') : t('add')}
        title={saved ? t('remove') : t('add')}
        className="flex size-10 items-center justify-center rounded-full bg-paper/85 text-ink shadow-sm transition-transform hover:scale-110"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            d="M12 20.5s-7.5-4.6-9.3-9.1C1.4 8 3.5 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.5 0 5.6 3.5 4.3 6.9-1.8 4.5-9.3 9.1-9.3 9.1z"
            fill={saved ? '#d90f1f' : 'none'}
            stroke={saved ? '#d90f1f' : 'currentColor'}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  )
}
