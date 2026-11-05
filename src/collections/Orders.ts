import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

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
    defaultColumns: ['orderNumber', 'status', 'email', 'total', 'createdAt'],
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
    beforeChange: [
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
        { name: 'priceCents', label: { it: 'Prezzo (cent)', en: 'Price (cents)' }, type: 'number', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', label: { it: 'Subtotale (cent)', en: 'Subtotal (cents)' }, type: 'number', admin: { readOnly: true } },
        { name: 'shipping', label: { it: 'Spedizione (cent)', en: 'Shipping (cents)' }, type: 'number', admin: { readOnly: true } },
        { name: 'total', label: { it: 'Totale (cent)', en: 'Total (cents)' }, type: 'number', admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'trackingNumber', label: { it: 'Numero di tracking', en: 'Tracking number' }, type: 'text' },
        { name: 'trackingUrl', label: { it: 'Link tracking', en: 'Tracking link' }, type: 'text' },
      ],
    },
    { name: 'notes', label: { it: 'Note interne', en: 'Internal notes' }, type: 'textarea' },
    // Barra laterale
    { name: 'locale', label: { it: 'Lingua', en: 'Language' }, type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'stripeSessionId', label: 'Stripe session', type: 'text', unique: true, index: true, admin: { position: 'sidebar', readOnly: true } },
    { name: 'stripePaymentIntentId', label: 'Stripe payment', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'paidAt', label: { it: 'Pagato il', en: 'Paid at' }, type: 'date', admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
