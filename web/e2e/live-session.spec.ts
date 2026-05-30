import { test, expect } from '@playwright/test'

test.describe('Live Session Flow', () => {
  test('live session page renders', async ({ page }) => {
    await page.goto('/learn/test-course/live')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
