import { test, expect } from '@playwright/test'

test.describe('Vetrina', () => {
  test('la home reindirizza a /it e mostra il nome del sito', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveURL(/\/it$/)
    await expect(page).toHaveTitle(/Amazing Mandala/)
  })

  test('il catalogo inglese risponde su /en/works', async ({ page }) => {
    await page.goto('http://localhost:3000/en/works')
    await expect(page.locator('h1')).toHaveText('Works')
  })
})
