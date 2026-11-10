'use client'

// Menu del paese di spedizione: al cambio ricarica il carrello con la nuova tariffa.
// Senza JavaScript resta il pulsante "Aggiorna".
export function CountrySelect({
  name,
  value,
  options,
  label,
  updateLabel,
}: {
  name: string
  value: string
  options: { code: string; label: string }[]
  label: string
  updateLabel: string
}) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-ink-soft">{label}</span>
        <select
          name={name}
          defaultValue={value}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="h-10 rounded-md border border-ink/25 bg-paper px-3 text-[15px] text-ink"
        >
          {options.map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <noscript>
        <button type="submit" className="h-10 rounded-md border border-ink/25 px-4 text-[15px]">
          {updateLabel}
        </button>
      </noscript>
    </form>
  )
}
