import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrSelf } from '../access'
import { EU_COUNTRIES } from '../lib/shipping'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

// Clienti del negozio. Sono separati dagli amministratori (`users`):
// non possono entrare nel pannello e vedono solo i propri dati.
export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    singular: { it: 'Cliente', en: 'Customer' },
    plural: { it: 'Clienti', en: 'Customers' },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'createdAt'],
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 giorni
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minuti dopo 5 tentativi falliti
    forgotPassword: {
      generateEmailSubject: () => 'Reimposta la password · Amazing Mandala',
      generateEmailHTML: (args) => {
        const url = `${SITE_URL}/it/account/nuova-password?token=${args?.token ?? ''}`
        return `<p>Hai chiesto di reimpostare la password del tuo account Amazing Mandala.</p>
<p><a href="${url}">Scegli una nuova password</a></p>
<p>Il link vale un'ora. Se non sei stato tu, ignora questa email.</p>
<hr><p>You asked to reset your Amazing Mandala password: <a href="${url.replace('/it/account/nuova-password', '/en/account/reset-password')}">choose a new password</a>.</p>`
      },
    },
  },
  access: {
    // registrazione solo dal sito, tramite il nostro codice (Local API)
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: () => false,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', label: { it: 'Nome', en: 'First name' }, type: 'text' },
        { name: 'lastName', label: { it: 'Cognome', en: 'Last name' }, type: 'text' },
        { name: 'phone', label: { it: 'Telefono', en: 'Phone' }, type: 'text' },
      ],
    },
    {
      name: 'locale',
      label: { it: 'Lingua preferita', en: 'Preferred language' },
      type: 'select',
      defaultValue: 'it',
      options: [
        { label: 'Italiano', value: 'it' },
        { label: 'English', value: 'en' },
      ],
    },
    {
      name: 'wishlist',
      label: { it: 'Preferiti', en: 'Wishlist' },
      type: 'relationship',
      relationTo: 'artworks',
      hasMany: true,
    },
    {
      name: 'addresses',
      label: { it: 'Indirizzi', en: 'Addresses' },
      type: 'array',
      labels: {
        singular: { it: 'Indirizzo', en: 'Address' },
        plural: { it: 'Indirizzi', en: 'Addresses' },
      },
      fields: [
        { name: 'name', label: { it: 'Destinatario', en: 'Recipient' }, type: 'text', required: true },
        { name: 'line1', label: { it: 'Indirizzo', en: 'Address' }, type: 'text', required: true },
        { name: 'line2', label: { it: 'Indirizzo (riga 2)', en: 'Address line 2' }, type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'postalCode', label: { it: 'CAP', en: 'Postcode' }, type: 'text', required: true },
            { name: 'city', label: { it: 'Città', en: 'City' }, type: 'text', required: true },
            { name: 'state', label: { it: 'Provincia', en: 'Region' }, type: 'text' },
            {
              name: 'country',
              label: { it: 'Paese', en: 'Country' },
              type: 'select',
              required: true,
              defaultValue: 'IT',
              options: EU_COUNTRIES.map((c) => ({ label: c, value: c })),
            },
          ],
        },
      ],
    },
  ],
}
