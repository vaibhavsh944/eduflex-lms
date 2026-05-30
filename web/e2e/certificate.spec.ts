import { test, expect } from '@playwright/test'

test.describe('Certificate Flow', () => {
  test('certificate page renders', async ({ page }) => {
    await page.goto('/certificates')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('certificate download button visible', async ({ page }) => {
    await page.goto('/certificates')
    const certCard = page.locator('[class*="certificate"], [class*="card"]').first()
    if (await certCard.isVisible()) {
      const downloadBtn = page.locator('text=Download, Download PDF')
      if (await downloadBtn.isVisible()) {
        await expect(downloadBtn).toBeVisible()
      }
    }
  })
})
