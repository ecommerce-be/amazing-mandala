import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Tutto tranne admin e API di Payload, file interni di Next e file con estensione
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
