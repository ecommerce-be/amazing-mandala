import { test, expect } from '@playwright/test'

test.describe('Vetrina', () => {
  test('la home è il negozio in italiano', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveURL(/\/it$/)
    await expect(page.locator('h1')).toHaveText('Le opere')
  })

  test('/en/works rimanda alla home inglese', async ({ page }) => {
    await page.goto('http://localhost:3000/en/works')
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('h1')).toHaveText('The works')
  })

  test('la pagina descrittiva risponde in entrambe le lingue', async ({ page }) => {
    await page.goto('http://localhost:3000/it/un-mandala-per-sempre')
    await expect(page.locator('h1')).toHaveText('Un Mandala per sempre')
    await page.goto('http://localhost:3000/en/a-mandala-forever')
    await expect(page.locator('h1')).toHaveText('A mandala forever')
  })
})
