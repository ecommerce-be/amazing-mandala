import { useTranslations } from 'next-intl'

export function SiteFooter() {
  const t = useTranslations()

  return (
    <footer className="mt-24 border-t border-ink/15">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-ink-soft sm:flex-row sm:justify-between sm:px-8">
        <p>{t('site.tagline')}</p>
        <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  )
}
