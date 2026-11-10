import type { CollectionConfig, Where } from 'payload'
import { slugField } from 'payload'

import { isAdmin } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidateSite'

export const ARTWORK_STATUSES = ['draft', 'published', 'reserved', 'sold', 'archived'] as const
export type ArtworkStatus = (typeof ARTWORK_STATUSES)[number]

// Stati visibili sul sito pubblico (le opere vendute restano online con il badge "venduto")
const PUBLIC_STATUSES: ArtworkStatus[] = ['published', 'reserved', 'sold']

export const Artworks: CollectionConfig = {
  slug: 'artworks',
  labels: {
    singular: { it: 'Quadro', en: 'Artwork' },
    plural: { it: 'Quadri', en: 'Artworks' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'price', 'shape', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      const onlyPublic: Where = { status: { in: PUBLIC_STATUSES } }
      return onlyPublic
    },
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
    beforeChange: [
      ({ data, originalDoc }) => {
        // Data di prima pubblicazione, impostata una sola volta
        if (data.status === 'published' && !originalDoc?.publishedAt && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        // La riserva ha senso solo nello stato "reserved"
        if (data.status && data.status !== 'reserved') {
          data.reservedUntil = null
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { it: 'Contenuto', en: 'Content' },
          fields: [
            {
              name: 'title',
              label: { it: 'Titolo', en: 'Title' },
              type: 'text',
              required: true,
            },
            slugField({ useAsSlug: 'title' }),
            {
              name: 'excerpt',
              label: { it: 'Descrizione breve', en: 'Short description' },
              type: 'textarea',
              maxLength: 300,
              admin: { description: 'Usata nelle card del catalogo e nei risultati di Google.' },
            },
            {
              name: 'description',
              label: { it: 'Descrizione', en: 'Description' },
              type: 'richText',
            },
            {
              name: 'meaning',
              label: { it: 'Significato', en: 'Meaning' },
              type: 'textarea',
              admin: {
                description: 'Cosa rappresenta il mandala e a cosa invita. Mostrato nella pagina del quadro.',
              },
            },
            {
              name: 'images',
              label: { it: 'Foto', en: 'Images' },
              type: 'array',
              labels: {
                singular: { it: 'Foto', en: 'Image' },
                plural: { it: 'Foto', en: 'Images' },
              },
              admin: { description: 'La prima foto è la copertina. Trascina per riordinare.' },
              validate: (value, { siblingData }) => {
                const status = (siblingData as { status?: ArtworkStatus }).status
                const count = Array.isArray(value) ? value.length : 0
                if (status && status !== 'draft' && count === 0) {
                  return 'Serve almeno una foto per pubblicare il quadro.'
                }
                return true
              },
              fields: [
                {
                  name: 'image',
                  label: { it: 'Immagine', en: 'Image' },
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'kind',
                  label: { it: 'Tipo', en: 'Kind' },
                  type: 'select',
                  defaultValue: 'main',
                  options: [
                    { label: { it: 'Principale', en: 'Main' }, value: 'main' },
                    { label: { it: 'Dettaglio', en: 'Detail' }, value: 'detail' },
                    { label: { it: 'In ambiente', en: 'In room' }, value: 'room' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: { it: 'Caratteristiche', en: 'Details' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'widthCm',
                  label: { it: 'Larghezza (cm)', en: 'Width (cm)' },
                  type: 'number',
                  required: true,
                  min: 1,
                },
                {
                  name: 'heightCm',
                  label: { it: 'Altezza (cm)', en: 'Height (cm)' },
                  type: 'number',
                  required: true,
                  min: 1,
                },
                {
                  name: 'depthCm',
                  label: { it: 'Spessore (cm)', en: 'Depth (cm)' },
                  type: 'number',
                  min: 0,
                },
                {
                  name: 'weightG',
                  label: { it: 'Peso (g)', en: 'Weight (g)' },
                  type: 'number',
                  min: 0,
                  admin: { description: 'Serve per calcolare la spedizione.' },
                },
              ],
            },
            {
              name: 'shape',
              label: { it: 'Forma', en: 'Shape' },
              type: 'select',
              required: true,
              defaultValue: 'round',
              options: [
                { label: { it: 'Tondo', en: 'Round' }, value: 'round' },
                { label: { it: 'Quadrato', en: 'Square' }, value: 'square' },
                { label: { it: 'Rettangolare', en: 'Rectangular' }, value: 'rectangular' },
                { label: { it: 'Altro', en: 'Other' }, value: 'other' },
              ],
            },
            {
              name: 'wood',
              label: { it: 'Essenza del legno', en: 'Wood' },
              type: 'text',
              admin: { description: 'Es. betulla, pioppo, noce.' },
            },
            {
              name: 'techniques',
              label: { it: 'Tecniche', en: 'Techniques' },
              type: 'text',
              hasMany: true,
              admin: { description: 'Una per voce, es. incisione, pittura acrilica.' },
            },
            {
              name: 'palette',
              label: { it: 'Colori principali', en: 'Main colours' },
              type: 'select',
              hasMany: true,
              admin: { description: 'Usati per il filtro colori del catalogo.' },
              options: [
                { label: { it: 'Rosso', en: 'Red' }, value: 'red' },
                { label: { it: 'Arancione', en: 'Orange' }, value: 'orange' },
                { label: { it: 'Giallo', en: 'Yellow' }, value: 'yellow' },
                { label: { it: 'Verde', en: 'Green' }, value: 'green' },
                { label: { it: 'Blu', en: 'Blue' }, value: 'blue' },
                { label: { it: 'Viola', en: 'Purple' }, value: 'purple' },
                { label: { it: 'Rosa', en: 'Pink' }, value: 'pink' },
                { label: { it: 'Marrone', en: 'Brown' }, value: 'brown' },
                { label: { it: 'Nero', en: 'Black' }, value: 'black' },
                { label: { it: 'Bianco', en: 'White' }, value: 'white' },
                { label: { it: 'Oro', en: 'Gold' }, value: 'gold' },
                { label: { it: 'Argento', en: 'Silver' }, value: 'silver' },
                { label: { it: 'Legno naturale', en: 'Natural wood' }, value: 'natural' },
              ],
            },
          ],
        },
      ],
    },
    // Sidebar
    {
      name: 'status',
      label: { it: 'Stato', en: 'Status' },
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      admin: { position: 'sidebar' },
      options: [
        { label: { it: 'Bozza', en: 'Draft' }, value: 'draft' },
        { label: { it: 'Pubblicato', en: 'Published' }, value: 'published' },
        { label: { it: 'Riservato', en: 'Reserved' }, value: 'reserved' },
        { label: { it: 'Venduto', en: 'Sold' }, value: 'sold' },
        { label: { it: 'Archiviato', en: 'Archived' }, value: 'archived' },
      ],
    },
    {
      name: 'price',
      label: { it: 'Prezzo (€, IVA inclusa)', en: 'Price (€, VAT incl.)' },
      type: 'number',
      required: true,
      min: 1,
      admin: { position: 'sidebar', step: 1 },
      // Una validazione personalizzata sostituisce quella standard: controlliamo tutto qui
      validate: (value: number | null | undefined) => {
        if (typeof value !== 'number') return 'Il prezzo è obbligatorio.'
        if (!Number.isInteger(value) || value < 1) return 'Usa un prezzo in euro interi, almeno 1 €.'
        return true
      },
    },
    {
      name: 'featured',
      label: { it: 'In evidenza in home', en: 'Featured on home page' },
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: { it: 'Pubblicato il', en: 'Published at' },
      type: 'date',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'reservedUntil',
      label: { it: 'Riservato fino a', en: 'Reserved until' },
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        condition: (data) => data?.status === 'reserved',
        description: 'Impostato dal checkout, non modificare a mano.',
      },
    },
  ],
}
