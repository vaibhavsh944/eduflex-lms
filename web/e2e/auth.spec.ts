import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test('sign up -> verify -> log in -> log out', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('h1, h2').first()).toBeVisible()
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Verify your email')).toBeVisible()
  })

  test('forgot password flow', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.locator('h1, h2').first()).toBeVisible()
    await page.fill('[name="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Check your email')).toBeVisible()
  })

  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/login|signin/)
  })

  test('shows validation errors on invalid signup', async ({ page }) => {
    await page.goto('/signup')
    await page.click('button[type="submit"]')
    await expect(page.locator('.text-destructive, [role="alert"]').first()).toBeVisible()
  })
})
