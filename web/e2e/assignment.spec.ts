import { test, expect } from '@playwright/test'

test.describe('Assignment Flow', () => {
  test('upload file submission', async ({ page }) => {
    await page.goto('/learn/test-course/assignment/test-assignment')
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({ name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('test') })
      await page.click('text=Submit')
      await expect(page.locator('text=submitted, uploaded')).toBeVisible()
    }
  })
})
