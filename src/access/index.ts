import type { Access } from 'payload'

// Per ora la collezione `users` contiene solo amministratori:
// qualsiasi utente autenticato nel pannello è un admin.
export const isAdmin: Access = ({ req }) => Boolean(req.user)
