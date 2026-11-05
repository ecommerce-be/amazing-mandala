import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

// Rigenera le pagine del sito quando un quadro cambia (anche dal checkout).
// Fuori da Next.js (script, test) revalidatePath non è disponibile: lo ignoriamo.
export function revalidateSite() {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // nessun contesto Next.js
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidateSite()
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateSite()
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc }) => {
  revalidateSite()
  return doc
}
