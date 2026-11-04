import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { type CatalogFilters as Filters, COLORS, PRICE_RANGES, SHAPES } from '@/lib/catalogFilters'

const field = 'flex flex-col gap-1.5 text-sm'
const control =
  'h-10 rounded-md border border-ink/25 bg-paper px-3 text-[15px] text-ink focus-visible:border-ink'

// Form GET senza JavaScript: i filtri finiscono nell'URL e si possono condividere
export async function CatalogFilters({ filters, active }: { filters: Filters; active: boolean }) {
  const t = await getTranslations('filters')

  return (
    <form method="get" className="mt-10 flex flex-wrap items-end gap-x-6 gap-y-4 border-y border-ink/15 py-5">
      <label className={field}>
        <span className="text-ink-soft">{t('shape')}</span>
        <select name="shape" defaultValue={filters.shape ?? ''} className={control}>
          <option value="">{t('all')}</option>
          {SHAPES.map((s) => (
            <option key={s} value={s}>
              {t(`shapes.${s}`)}
            </option>
          ))}
        </select>
      </label>

      <label className={field}>
        <span className="text-ink-soft">{t('color')}</span>
        <select name="color" defaultValue={filters.color ?? ''} className={control}>
          <option value="">{t('all')}</option>
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {t(`colors.${c}`)}
            </option>
          ))}
        </select>
      </label>

      <label className={field}>
        <span className="text-ink-soft">{t('price')}</span>
        <select name="price" defaultValue={filters.price ?? ''} className={control}>
          <option value="">{t('all')}</option>
          {Object.keys(PRICE_RANGES).map((p) => (
            <option key={p} value={p}>
              {t(`prices.${p}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex h-10 items-center gap-2 text-[15px]">
        <input
          type="checkbox"
          name="available"
          value="1"
          defaultChecked={filters.available}
          className="size-4 accent-ink"
        />
        {t('available')}
      </label>

      <div className="flex items-center gap-4">
        <button type="submit" className="h-10 rounded-md bg-ink px-5 text-[15px] text-on-ink hover:bg-ink/90">
          {t('apply')}
        </button>
        {active && (
          <Link href="/opere" className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            {t('reset')}
          </Link>
        )}
      </div>
    </form>
  )
}
