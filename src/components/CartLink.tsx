import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { getCartIds } from '@/lib/cart'

export async function CartLink() {
  const t = await getTranslations('cart')
  const count = (await getCartIds()).length

  return (
    <Link href="/carrello" className="flex items-center gap-2 underline-offset-4 hover:underline">
      {t('title')}
      {count > 0 && (
        <span className="rounded-full bg-ink px-2 py-0.5 text-xs tabular-nums text-on-ink" aria-label={t('count', { count })}>
          {count}
        </span>
      )}
    </Link>
  )
}
