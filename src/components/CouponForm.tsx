'use client'

import { useTranslations } from 'next-intl'
import { useActionState } from 'react'

import type { CouponFormState } from '@/lib/couponActions'

export function CouponForm({ action }: { action: (prev: CouponFormState, form: FormData) => Promise<CouponFormState> }) {
  const t = useTranslations('coupon')
  const [state, formAction, pending] = useActionState(action, null)
  return (
    <form action={formAction} className="mt-6">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-ink-soft">{t('label')}</span>
        <span className="flex gap-2">
          <input
            name="code"
            autoComplete="off"
            className="h-10 min-w-0 flex-1 rounded-md border border-ink/25 bg-paper/80 px-3 text-[15px] uppercase text-ink"
          />
          <button type="submit" disabled={pending} className="h-10 rounded-md border border-ink/40 px-4 text-[15px] hover:bg-paper/60 disabled:opacity-60">
            {t('apply')}
          </button>
        </span>
      </label>
      {state?.error && (
        <p role="alert" className="mt-2 text-sm text-[#9b1c1c]">
          {t(`errors.${state.error}`, { min: state.min ?? 0 })}
        </p>
      )}
    </form>
  )
}
