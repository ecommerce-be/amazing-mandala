import type { CollectionConfig, Field } from 'payload'

import { shippedNotification } from '../emails/orderEmails'
import { isAdmin } from '../access'

const eur = (cents: unknown) =>
  typeof cents === 'number'
    ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100)
    : ''

// Campo di sola lettura che mostra in euro un importo salvato in centesimi
function euroField(name: string, from: string, label: { it: string; en: string }): Field {
  return {
    name,
    label,
    type: 'text',
    virtual: true,
    admin: { readOnly: true },
    hooks: { afterRead: [({ siblingData }) => eur(siblingData?.[from])] },
  }
}

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'] as const

// Gli ordini vengono creati solo dal checkout (Local API); l'admin li legge e li aggiorna.
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: { it: 'Ordine', en: 'Order' },
    plural: { it: 'Ordini', en: 'Orders' },
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'customerName', 'country', 'totalEur', 'createdAt'],
    listSearchableFields: ['orderNumber', 'email', 'customerName'],
  },
  defaultSort: '-createdAt',
  access: {
    read: isAdmin,
    create: () => false,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    // Quando l'ordine passa a "Spedito" il cliente riceve l'email con il tracking
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update' || doc.status !== 'shipped' || previousDoc?.status === 'shipped' || !doc.email) {
          return doc
        }
        try {
          const mail = shippedNotification(doc)
          await req.payload.sendEmail({ to: doc.email, subject: mail.subject, html: mail.html })
        } catch (err) {
          req.payload.logger.error({ err }, `Email di spedizione non inviata per ${doc.orderNumber}`)
        }
        return doc
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.status === 'shipped' && originalDoc?.status !== 'shipped' && !data.shippedAt) {
          data.shippedAt = new Date().toISOString()
        }
        return data
      },
      ({ data, operation }) => {
        if (operation === 'create' && !data.orderNumber) {
          const d = new Date()
          const ymd = d.toISOString().slice(2, 10).replaceAll('-', '')
          data.orderNumber = `AM-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'orderNumber', label: { it: 'Numero', en: 'Number' }, type: 'text', unique: true, index: true, admin: { readOnly: true } },
        {
          name: 'status',
          label: { it: 'Stato', en: 'Status' },
          type: 'select',
          required: true,
          defaultValue: 'pending',
          index: true,
          options: [
            { label: { it: 'In attesa di pagamento', en: 'Awaiting payment' }, value: 'pending' },
            { label: { it: 'Pagato, da spedire', en: 'Paid, to ship' }, value: 'paid' },
            { label: { it: 'Spedito', en: 'Shipped' }, value: 'shipped' },
            { label: { it: 'Consegnato', en: 'Delivered' }, value: 'delivered' },
            { label: { it: 'Annullato', en: 'Cancelled' }, value: 'cancelled' },
            { label: { it: 'Rimborsato', en: 'Refunded' }, value: 'refunded' },
          ],
        },
      ],
    },
    {
      name: 'customer',
      label: { it: 'Account cliente', en: 'Customer account' },
      type: 'relationship',
      relationTo: 'customers',
      admin: { readOnly: true, description: 'Vuoto se l\'acquisto è stato fatto senza account.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'customerName', label: { it: 'Cliente', en: 'Customer' }, type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: { it: 'Telefono', en: 'Phone' }, type: 'text' },
      ],
    },
    {
      name: 'shippingAddress',
      label: { it: 'Indirizzo di spedizione', en: 'Shipping address' },
      type: 'group',
      fields: [
        { name: 'name', label: { it: 'Destinatario', en: 'Recipient' }, type: 'text' },
        { name: 'line1', label: { it: 'Indirizzo', en: 'Address' }, type: 'text' },
        { name: 'line2', label: { it: 'Indirizzo (riga 2)', en: 'Address line 2' }, type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'postalCode', label: { it: 'CAP', en: 'Postcode' }, type: 'text' },
            { name: 'city', label: { it: 'Città', en: 'City' }, type: 'text' },
            { name: 'state', label: { it: 'Provincia', en: 'Region' }, type: 'text' },
            { name: 'country', label: { it: 'Paese', en: 'Country' }, type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'items',
      label: { it: 'Quadri', en: 'Artworks' },
      type: 'array',
      admin: { readOnly: true },
      fields: [
        { name: 'artwork', label: { it: 'Quadro', en: 'Artwork' }, type: 'relationship', relationTo: 'artworks' },
        { name: 'title', label: { it: 'Titolo', en: 'Title' }, type: 'text', required: true },
        { name: 'priceCents', type: 'number', required: true, admin: { hidden: true } },
        euroField('priceEur', 'priceCents', { it: 'Prezzo', en: 'Price' }),
      ],
    },
    // Importi salvati in centesimi (nascosti) e mostrati in euro
    { name: 'subtotal', type: 'number', admin: { hidden: true } },
    { name: 'shipping', type: 'number', admin: { hidden: true } },
    { name: 'total', type: 'number', admin: { hidden: true } },
    {
      type: 'row',
      fields: [
        euroField('subtotalEur', 'subtotal', { it: 'Quadri', en: 'Artworks' }),
        euroField('shippingEur', 'shipping', { it: 'Spedizione', en: 'Shipping' }),
        euroField('totalEur', 'total', { it: 'Totale', en: 'Total' }),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'trackingNumber',
          label: { it: 'Numero di spedizione BRT', en: 'BRT tracking number' },
          type: 'text',
          // Per mettere l'ordine su "Spedito" serve il numero: finisce nell'email al cliente
          validate: (value: string | null | undefined, { siblingData }: { siblingData: Partial<{ status: string }> }) =>
            siblingData?.status === 'shipped' && !value ? 'Inserisci il numero di spedizione prima di segnare l\'ordine come spedito.' : true,
        },
        {
          name: 'trackingUrl',
          label: { it: 'Link di tracciamento', en: 'Tracking link' },
          type: 'text',
          admin: { description: 'Incolla il link di tracciamento BRT; se vuoto, l\'email rimanda a brt.it.' },
        },
      ],
    },
    { name: 'notes', label: { it: 'Note interne', en: 'Internal notes' }, type: 'textarea' },
    // Barra laterale
    { name: 'country', label: { it: 'Paese', en: 'Country' }, type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'locale', label: { it: 'Lingua', en: 'Language' }, type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'stripeSessionId', label: 'Stripe session', type: 'text', unique: true, index: true, admin: { position: 'sidebar', readOnly: true } },
    { name: 'stripePaymentIntentId', label: 'Stripe payment', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'shippedAt', label: { it: 'Spedito il', en: 'Shipped at' }, type: 'date', admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'paidAt', label: { it: 'Pagato il', en: 'Paid at' }, type: 'date', admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
