import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { en } from '@payloadcms/translations/languages/en'
import { it } from '@payloadcms/translations/languages/it'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Artworks } from './collections/Artworks'
import { Orders } from './collections/Orders'
import { AboutPage } from './globals/AboutPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Artworks, Orders, Media, Users],
  globals: [AboutPage],
  localization: {
    locales: [
      { label: 'Italiano', code: 'it' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'it',
    fallback: true,
  },
  i18n: {
    supportedLanguages: { it, en },
    fallbackLanguage: 'it',
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
