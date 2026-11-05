import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidateSite'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { it: 'Immagine', en: 'Media' },
    plural: { it: 'Immagini', en: 'Media' },
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'alt',
      label: { it: 'Testo alternativo', en: 'Alt text' },
      type: 'text',
      required: true,
      admin: { description: 'Descrive la foto per chi usa uno screen reader e per Google.' },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 800 },
      { name: 'large', width: 1600 },
      { name: 'zoom', width: 2560 },
    ],
    adminThumbnail: 'thumbnail',
  },
}
