import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { getCurrentCustomer } from '@/lib/customerAuth'

export async function AccountLink() {
  const t = await getTranslations('account')
  const customer = await getCurrentCustomer()
  return (
    <Link href={customer ? '/account' : '/account/accedi'} className="underline-offset-4 hover:underline">
      {customer ? t('navAccount') : t('navLogin')}
    </Link>
  )
}
