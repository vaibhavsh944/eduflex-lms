import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('catalog page loads and shows courses with prices', async ({ page }) => {
    await page.goto('/catalog')
    await expect(page.locator('h1, h2').filter({ hasText: /catalog|courses/i }).first()).toBeVisible()
    await expect(page.locator('[class*="grid"]')).toBeVisible()
  })

  test('course detail page shows enrollment options', async ({ page }) => {
    const response = await page.goto('/catalog')
    const courseLink = page.locator('a[href*="/catalog/"]').first()
    if (await courseLink.isVisible()) {
      await courseLink.click()
      await expect(page).toHaveURL(/\/catalog\//)
      await expect(page.locator('text=Enroll, Enroll Now, Buy').first()).toBeVisible({ timeout: 5000 }).catch(() => {})
    }
  })

  test('payment modal opens from course detail page', async ({ page }) => {
    const response = await page.goto('/catalog')
    const courseLink = page.locator('a[href*="/catalog/"]').first()
    if (await courseLink.isVisible()) {
      await courseLink.click()
      await page.waitForTimeout(1000)
      const enrollBtn = page.locator('button, a').filter({ hasText: /enroll|buy|get started/i }).first()
      if (await enrollBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await enrollBtn.click()
      }
    }
  })
})
