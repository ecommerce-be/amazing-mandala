import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['it', 'en'],
  defaultLocale: 'it',
  // Gli URL sono tradotti: /it/opere e /en/works puntano alla stessa pagina
  pathnames: {
    '/': '/',
    '/opere': { it: '/opere', en: '/works' },
    '/opere/[slug]': { it: '/opere/[slug]', en: '/works/[slug]' },
    '/un-mandala-per-sempre': { it: '/un-mandala-per-sempre', en: '/a-mandala-forever' },
    '/carrello': { it: '/carrello', en: '/cart' },
    '/ordine/confermato': { it: '/ordine/confermato', en: '/order/confirmed' },
  },
})

export type Locale = (typeof routing.locales)[number]
