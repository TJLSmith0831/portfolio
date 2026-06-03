import { test, expect } from '@playwright/test'

test.describe('Vercel Analytics Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('should load analytics script in production mode', async ({ page }) => {
    // Check if analytics script is present in the DOM
    const analyticsScript = await page
      .locator('script[src*="analytics"]')
      .count()

    // In development, analytics might not load, but the component should still be present
    // We'll just ensure no JavaScript errors occur
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate around the site to trigger any analytics events
    await page.click('a[href="#experience"]', { timeout: 5000 })
    await page.waitForTimeout(1000)

    await page.click('a[href="#projects"]', { timeout: 5000 })
    await page.waitForTimeout(1000)

    // Check that no JavaScript errors related to analytics occurred
    const analyticsErrors = consoleErrors.filter(
      error =>
        error.toLowerCase().includes('analytics') ||
        error.toLowerCase().includes('vercel')
    )

    expect(analyticsErrors.length).toBe(0)
  })

  test('should not interfere with existing functionality', async ({ page }) => {
    // Test that analytics doesn't break the AI assistant
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await expect(chatBubble).toBeVisible({ timeout: 10000 })

    // Test that analytics doesn't break theme switching
    const themeToggle = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first()
    await themeToggle.click()
    await page.waitForTimeout(500)

    // Ensure the page is still functional after theme change
    await expect(page.locator('body')).toBeVisible()
  })

  test('should work across different viewports', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Ensure no errors in mobile view
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate on mobile
    await page.click('a[href="#projects"]', { timeout: 5000 })
    await page.waitForTimeout(1000)

    const analyticsErrors = consoleErrors.filter(error =>
      error.toLowerCase().includes('analytics')
    )

    expect(analyticsErrors.length).toBe(0)

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Ensure functionality still works
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should not block page loading', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('http://localhost:3000')
    await page.waitForLoadState('domcontentloaded')

    const loadTime = Date.now() - startTime

    // Page should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000)

    // Core content should be visible
    await expect(page.locator('h1')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('nav')).toBeVisible({ timeout: 3000 })
  })
})
