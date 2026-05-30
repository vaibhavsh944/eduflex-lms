import { test, expect } from '@playwright/test'

test.describe('Offline / Mobile Flow', () => {
  test('downloaded lessons page renders', async ({ page }) => {
    await page.goto('/downloads')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('offline indicator placeholder', async ({ page }) => {
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { get: () => false })
    })
  })
})
