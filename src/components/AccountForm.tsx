'use client'

import { useTranslations } from 'next-intl'
import { useActionState } from 'react'

import type { FormState } from '@/lib/accountActions'

export type FieldDef = {
  name: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'hidden'
  label?: string
  autoComplete?: string
  required?: boolean
  defaultValue?: string
  hint?: string
}

const input =
  'h-11 w-full rounded-md border border-ink/25 bg-paper/80 px-3 text-[15px] text-ink focus-visible:border-ink'

// Form dell'account: mostra gli errori e i messaggi restituiti dalla server action
export function AccountForm({
  action,
  fields,
  submitLabel,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>
  fields: FieldDef[]
  submitLabel: string
}) {
  const t = useTranslations('account')
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {fields.map((f) =>
        f.type === 'hidden' ? (
          <input key={f.name} type="hidden" name={f.name} value={f.defaultValue ?? ''} />
        ) : (
          <label key={f.name} className="flex flex-col gap-1.5 text-sm">
            <span className="text-ink-soft">{f.label}</span>
            <input
              name={f.name}
              type={f.type ?? 'text'}
              autoComplete={f.autoComplete}
              required={f.required}
              defaultValue={f.defaultValue}
              className={input}
            />
            {f.hint && <span className="text-xs text-ink-soft">{f.hint}</span>}
          </label>
        ),
      )}
      {state?.error && (
        <p role="alert" className="rounded-md bg-paper/80 px-4 py-3 text-[15px] text-[#9b1c1c]">
          {t(`errors.${state.error}`)}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="rounded-md bg-paper/80 px-4 py-3 text-[15px]">
          {t(`messages.${state.ok}`)}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-ink px-6 text-on-ink hover:bg-ink/90 disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  )
}
