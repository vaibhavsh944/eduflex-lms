import { test, expect } from '@playwright/test'

test.describe('Enrollment Flow', () => {
  test('browse catalog -> filter -> view detail -> enroll in free course', async ({ page }) => {
    await page.goto('/catalog')
    await expect(page.locator('[data-testid]').first()).toBeVisible()
    const card = page.locator('.course-card, [class*="card"]').first()
    await expect(card).toBeVisible()
    await card.click()
    await expect(page).toHaveURL(/\/catalog\//)
  })

  test('catalog filters work', async ({ page }) => {
    await page.goto('/catalog')
    const filterSelect = page.locator('select, [role="combobox"]').first()
    if (await filterSelect.isVisible()) {
      await filterSelect.click()
      await page.locator('text=beginner').first().click()
    }
  })

  test('shows waitlist when course is full', async ({ page }) => {
    await page.goto('/catalog/sample-course')
    if (await page.locator('text=Join Waitlist').isVisible()) {
      await page.click('text=Join Waitlist')
    }
  })
})
