import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

// Rigenera le pagine del sito quando un quadro cambia (anche dal checkout).
// Fuori da Next.js (script, test) revalidatePath non è disponibile: lo ignoriamo.
function revalidate() {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // nessun contesto Next.js
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidate()
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidate()
  return doc
}
