import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['it', 'en'],
  defaultLocale: 'it',
  // Gli URL sono tradotti: /it/opere e /en/works puntano alla stessa pagina
  pathnames: {
    '/': '/',
    '/opere': { it: '/opere', en: '/works' },
    '/opere/[slug]': { it: '/opere/[slug]', en: '/works/[slug]' },
  },
})

export type Locale = (typeof routing.locales)[number]
