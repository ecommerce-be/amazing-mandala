import type { Access } from 'payload'

// Gli utenti autenticati possono essere amministratori (collezione `users`)
// o clienti (collezione `customers`): solo i primi sono admin.
export const isAdmin: Access = ({ req }) => req.user?.collection === 'users'

/** Admin: tutto. Cliente: solo il proprio documento. */
export const isAdminOrSelf: Access = ({ req }) => {
  if (req.user?.collection === 'users') return true
  if (req.user?.collection === 'customers') return { id: { equals: req.user.id } }
  return false
}
