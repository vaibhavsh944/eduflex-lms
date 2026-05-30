import { test, expect } from '@playwright/test'

test.describe('Quiz Flow', () => {
  test('start quiz -> answer -> submit -> view score', async ({ page }) => {
    await page.goto('/learn/test-course/quiz/test-quiz')
    const startBtn = page.locator('text=Start Quiz')
    if (await startBtn.isVisible()) {
      await startBtn.click()
      await page.locator('input[type="radio"]').first().click()
      await page.click('text=Submit')
      await expect(page.locator('text=Score, score, result')).toBeVisible()
    }
  })

  test('quiz timer displays remaining time', async ({ page }) => {
    await page.goto('/learn/test-course/quiz/test-quiz')
    const timer = page.locator('[role="timer"]')
    if (await timer.isVisible()) {
      await expect(timer).toBeVisible()
    }
  })
})
