import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access'
import { revalidateGlobal } from '../hooks/revalidateSite'

// Contenuti della pagina "Un Mandala per sempre", modificabili dall'admin.
// I campi vuoti mostrano i testi predefiniti presenti in messages/*.json
export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: { it: 'Pagina "Un Mandala per sempre"', en: '"A mandala forever" page' },
  access: { read: () => true, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'title',
      label: { it: 'Titolo', en: 'Title' },
      type: 'text',
      localized: true,
      admin: { description: 'Vuoto = "Un Mandala per sempre".' },
    },
    {
      name: 'subtitle',
      label: { it: 'Sottotitolo', en: 'Subtitle' },
      type: 'textarea',
      localized: true,
    },
    {
      name: 'sections',
      label: { it: 'Sezioni', en: 'Sections' },
      type: 'array',
      labels: {
        singular: { it: 'Sezione', en: 'Section' },
        plural: { it: 'Sezioni', en: 'Sections' },
      },
      admin: { description: 'Vuoto = testi predefiniti (Le opere, La mia visione, Mandala generativi).' },
      fields: [
        { name: 'heading', label: { it: 'Titolo', en: 'Heading' }, type: 'text', required: true, localized: true },
        { name: 'body', label: { it: 'Testo', en: 'Text' }, type: 'textarea', required: true, localized: true },
      ],
    },
    {
      name: 'generativeGallery',
      label: { it: 'Galleria mandala generativi', en: 'Generative mandala gallery' },
      type: 'array',
      admin: {
        description:
          'Immagini di mandala creati con l\'AI. Se vuota, la pagina mostra mandala generati dal codice.',
      },
      fields: [
        { name: 'image', label: { it: 'Immagine', en: 'Image' }, type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', label: { it: 'Didascalia', en: 'Caption' }, type: 'text', localized: true },
      ],
    },
  ],
}
