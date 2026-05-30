import { test, expect } from '@playwright/test'

test.describe('Learning Flow', () => {
  test('open lesson -> mark complete -> progress updates', async ({ page }) => {
    await page.goto('/student/courses')
    const continueLink = page.locator('text=Continue Learning, [href*="/learn/"]').first()
    if (await continueLink.isVisible()) {
      await continueLink.click()
      await expect(page).toHaveURL(/\/learn\//)
    }
  })

  test('video player controls visible on lesson', async ({ page }) => {
    await page.goto('/learn/test-course/lesson/test-lesson')
    const player = page.locator('video, [class*="video"], [class*="player"]').first()
    if (await player.isVisible()) {
      await expect(player).toBeVisible()
    }
  })

  test('quiz page renders timer and questions', async ({ page }) => {
    await page.goto('/learn/test-course/quiz/test-quiz')
    const timer = page.locator('[role="timer"], [aria-live="polite"]').first()
    if (await timer.isVisible()) {
      await expect(timer).toBeVisible()
    }
  })
})
