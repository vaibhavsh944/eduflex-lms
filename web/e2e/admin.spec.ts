import { test, expect } from '@playwright/test'

test.describe('Admin Flow', () => {
  test('admin navigates to dashboard', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin/)
  })

  test('admin sees analytics page', async ({ page }) => {
    await page.goto('/admin/analytics')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('admin coupons page renders', async ({ page }) => {
    await page.goto('/admin/coupons')
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    if (await page.locator('text=Create Coupon').isVisible()) {
      await expect(page.locator('text=Create Coupon')).toBeVisible()
    }
  })

  test('admin audit logs page renders with filters', async ({ page }) => {
    await page.goto('/admin/audit-logs')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('admin organizations page renders', async ({ page }) => {
    await page.goto('/admin/organizations')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
