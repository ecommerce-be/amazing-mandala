'use server'

import { getCartIds, setCartIds } from './cart'

export async function addToCart(artworkId: number) {
  const ids = await getCartIds()
  if (!ids.includes(artworkId)) await setCartIds([...ids, artworkId])
}

export async function removeFromCart(artworkId: number) {
  const ids = await getCartIds()
  await setCartIds(ids.filter((id) => id !== artworkId))
}
