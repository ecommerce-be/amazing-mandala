import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { getCartIds } from '@/lib/cart'
import { addToCart } from '@/lib/cartActions'

export async function AddToCart({ artworkId }: { artworkId: number }) {
  const t = await getTranslations('cart')
  const inCart = (await getCartIds()).includes(artworkId)

  if (inCart) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-[15px]">{t('alreadyInCart')}</p>
        <Link href="/carrello" className="rounded-md bg-ink px-6 py-3 text-on-ink hover:bg-ink/90">
          {t('goToCart')}
        </Link>
      </div>
    )
  }

  return (
    <form action={addToCart.bind(null, artworkId)}>
      <button type="submit" className="rounded-md bg-ink px-6 py-3 text-on-ink hover:bg-ink/90">
        {t('add')}
      </button>
    </form>
  )
}
