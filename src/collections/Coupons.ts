import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

// Codici sconto creati a mano dall'amministratore.
// La verifica avviene nel codice del carrello e del checkout (src/lib/coupons.ts).
export const Coupons: CollectionConfig = {
  slug: 'coupons',
  labels: {
    singular: { it: 'Coupon', en: 'Coupon' },
    plural: { it: 'Coupon', en: 'Coupons' },
  },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'active', 'usedCount', 'validUntil'],
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (typeof data.code === 'string') data.code = data.code.trim().toUpperCase().replace(/\s+/g, '')
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'code',
          label: { it: 'Codice', en: 'Code' },
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { description: 'Es. BENVENUTO10. Viene salvato in maiuscolo e senza spazi.' },
        },
        { name: 'active', label: { it: 'Attivo', en: 'Active' }, type: 'checkbox', defaultValue: true },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: { it: 'Tipo di sconto', en: 'Discount type' },
          type: 'select',
          required: true,
          defaultValue: 'percent',
          options: [
            { label: { it: 'Percentuale sui quadri', en: 'Percentage off artworks' }, value: 'percent' },
            { label: { it: 'Importo fisso (€)', en: 'Fixed amount (€)' }, value: 'amount' },
            { label: { it: 'Spedizione gratuita', en: 'Free shipping' }, value: 'free_shipping' },
          ],
        },
        {
          name: 'value',
          label: { it: 'Valore (% o €)', en: 'Value (% or €)' },
          type: 'number',
          min: 1,
          admin: { condition: (data) => data?.type !== 'free_shipping' },
          validate: (value: number | null | undefined, { siblingData }: { siblingData: Partial<{ type: string }> }) => {
            if (siblingData?.type === 'free_shipping') return true
            if (typeof value !== 'number' || value <= 0) return 'Inserisci il valore dello sconto.'
            if (siblingData?.type === 'percent' && value > 90) return 'La percentuale massima è 90%.'
            return true
          },
        },
      ],
    },
    { name: 'description', label: { it: 'Nota interna', en: 'Internal note' }, type: 'text', admin: { description: 'Es. "Promo Natale 2026". Non la vede il cliente.' } },
    {
      type: 'collapsible',
      label: { it: 'Condizioni (facoltative)', en: 'Conditions (optional)' },
      fields: [
        { name: 'minSubtotal', label: { it: 'Spesa minima sui quadri (€)', en: 'Minimum spend on artworks (€)' }, type: 'number', min: 0 },
        {
          type: 'row',
          fields: [
            { name: 'validFrom', label: { it: 'Valido dal', en: 'Valid from' }, type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
            { name: 'validUntil', label: { it: 'Valido fino al', en: 'Valid until' }, type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
          ],
        },
        { name: 'maxUses', label: { it: 'Utilizzi massimi in totale', en: 'Maximum total uses' }, type: 'number', min: 1, admin: { description: 'Vuoto = senza limite.' } },
        {
          name: 'oncePerCustomer',
          label: { it: 'Un solo utilizzo per cliente (richiede l\'account)', en: 'Once per customer (requires an account)' },
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    { name: 'usedCount', label: { it: 'Utilizzi', en: 'Uses' }, type: 'number', defaultValue: 0, admin: { readOnly: true, position: 'sidebar' } },
  ],
}
