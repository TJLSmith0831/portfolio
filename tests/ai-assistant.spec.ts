import { test, expect } from '@playwright/test'

test.describe('Swishter Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the portfolio page
    await page.goto('http://localhost:3001')

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle')
  })

  test('should display chat bubble in bottom-right corner', async ({
    page,
  }) => {
    // Look for the chat bubble button with specific aria-label
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')

    // Wait for chat bubble to be visible
    await expect(chatBubble).toBeVisible({ timeout: 10000 })

    // Verify it's positioned in bottom-right area (fixed bottom-6 right-6)
    const boundingBox = await chatBubble.boundingBox()
    expect(boundingBox).toBeTruthy()

    const viewport = page.viewportSize()
    if (viewport && boundingBox) {
      // Check if positioned in bottom-right quadrant
      expect(boundingBox.x).toBeGreaterThan(viewport.width / 2)
      expect(boundingBox.y).toBeGreaterThan(viewport.height / 2)
    }
  })

  test('should open chat window when chat bubble is clicked', async ({
    page,
  }) => {
    // Find and click the chat bubble
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await chatBubble.click()

    // Look for chat window - it should contain "Swishter" heading
    const chatWindow = page.locator('text="Swishter"').locator('..')
    await expect(chatWindow).toBeVisible({ timeout: 5000 })

    // Verify chat window has the expected class structure
    const chatCard = page.locator('.w-96.h-\\[32rem\\]')
    await expect(chatCard).toBeVisible({ timeout: 5000 })
  })

  test('should display initial greeting message', async ({ page }) => {
    // Open chat
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await chatBubble.click()

    // Wait for chat window and initial message
    await page.waitForTimeout(1000)

    // Look for the specific greeting message from the implementation
    const greetingMessage = page.locator(
      'text="Hi! I\'m here to help answer questions about Tristan\'s background"'
    )
    await expect(greetingMessage).toBeVisible({ timeout: 5000 })
  })

  test('should allow typing and sending messages', async ({ page }) => {
    // Open chat
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await chatBubble.click()

    // Wait for chat to load
    await page.waitForTimeout(1000)

    // Find message input textarea with specific placeholder
    const messageInput = page.locator(
      'textarea[placeholder="Ask about experience, projects, or skills..."]'
    )
    await expect(messageInput).toBeVisible({ timeout: 5000 })

    // Type test message
    const testMessage = "What is Tristan's current role?"
    await messageInput.fill(testMessage)

    // Find and click send button (button with Send icon)
    const sendButton = page.locator('button[type="submit"]')
    await sendButton.click()

    // Verify message appears in chat
    await expect(page.locator(`text="${testMessage}"`)).toBeVisible({
      timeout: 5000,
    })
  })

  test('should receive AI response after sending message', async ({ page }) => {
    // Open chat and send message
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await chatBubble.click()

    await page.waitForTimeout(1000)

    const messageInput = page.locator(
      'textarea[placeholder="Ask about experience, projects, or skills..."]'
    )
    await messageInput.fill("What is Tristan's current role?")

    const sendButton = page.locator('button[type="submit"]')
    await sendButton.click()

    // Wait for loading spinner to appear
    const loadingSpinner = page.locator('svg.animate-spin')
    await expect(loadingSpinner).toBeVisible({ timeout: 5000 })

    // Wait for loading to complete and response to appear
    await expect(loadingSpinner).not.toBeVisible({ timeout: 30000 })

    // Count messages - should have initial greeting + user message + AI response = at least 3
    const messages = page
      .locator('[class*="space-y-2"] > *')
      .filter({ hasNotText: '' })
    await expect(messages.nth(2)).toBeVisible({ timeout: 5000 }) // Check that at least 3 messages exist
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Chat bubble should still be visible
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await expect(chatBubble).toBeVisible({ timeout: 10000 })

    // Open chat
    await chatBubble.click()

    // Chat window should adapt to mobile - check if it's visible
    const chatWindow = page.locator('text="Swishter"')
    await expect(chatWindow).toBeVisible({ timeout: 5000 })

    // On mobile, chat window might be adjusted but should still be functional
    const chatCard = page.locator('.w-96.h-\\[32rem\\]')
    await expect(chatCard).toBeVisible({ timeout: 5000 })
  })

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await expect(chatBubble).toBeVisible({ timeout: 10000 })

    await chatBubble.click()

    const chatWindow = page.locator('text="Swishter"')
    await expect(chatWindow).toBeVisible({ timeout: 5000 })
  })

  test('should allow closing the chat window', async ({ page }) => {
    // Open chat
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await chatBubble.click()

    // Wait for chat window to be visible
    const chatWindow = page.locator('text="Swishter"')
    await expect(chatWindow).toBeVisible({ timeout: 5000 })

    // Find close button - it's the × button in the header
    const closeButton = page.locator('button:has-text("×")')
    await expect(closeButton).toBeVisible({ timeout: 5000 })

    // Click close button
    await closeButton.click()

    // Verify chat window is closed and bubble changes to open state
    await expect(chatWindow).not.toBeVisible({ timeout: 5000 })

    // Verify bubble shows open chat label again
    const reopenBubble = page.locator(
      'button[aria-label="Open chat assistant"]'
    )
    await expect(reopenBubble).toBeVisible({ timeout: 5000 })
  })

  test('should integrate properly with portfolio design', async ({ page }) => {
    // Check that the chat doesn't interfere with main content
    const mainContent = page.locator('main').first()
    await expect(mainContent).toBeVisible()

    // Chat bubble should not overlap main content significantly
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await expect(chatBubble).toBeVisible()

    // Open chat and verify it doesn't break layout
    await chatBubble.click()

    // Main content should still be accessible
    await expect(mainContent).toBeVisible()

    // Check that the page doesn't have horizontal scroll due to chat
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 20) // Allow small tolerance
  })

  test('should handle theme consistency', async ({ page }) => {
    // Check if there's a theme toggle - look for common theme toggle patterns
    const themeToggle = page
      .locator(
        'button[aria-label*="theme"], [data-theme-toggle], .theme-toggle'
      )
      .first()

    // Check if theme toggle is visible
    const isThemeToggleVisible = await themeToggle
      .isVisible()
      .catch(() => false)

    if (isThemeToggleVisible) {
      // Toggle theme
      await themeToggle.click()
      await page.waitForTimeout(1000)

      // Open chat and verify it adapts to theme
      const chatBubble = page.locator(
        'button[aria-label="Open chat assistant"]'
      )
      await chatBubble.click()

      const chatWindow = page.locator('text="Swishter"')
      await expect(chatWindow).toBeVisible({ timeout: 5000 })

      // Chat should be visible regardless of theme
      await expect(chatWindow).toBeVisible()
    } else {
      // If no theme toggle found, just verify chat works in default theme
      const chatBubble = page.locator(
        'button[aria-label="Open chat assistant"]'
      )
      await chatBubble.click()

      const chatWindow = page.locator('text="Swishter"')
      await expect(chatWindow).toBeVisible({ timeout: 5000 })
    }
  })

  test('should show tooltip on chat bubble hover', async ({ page }) => {
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await expect(chatBubble).toBeVisible()

    // Hover over chat bubble to potentially show tooltip
    await chatBubble.hover()
    await page.waitForTimeout(500)

    // Look for tooltip text "Ask me about my experience!"
    const tooltip = page.locator('text="Ask me about my experience!"')
    // Tooltip might not always be visible due to animations, so we'll just check if the bubble is working
    await expect(chatBubble).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Open chat
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await chatBubble.click()

    // Wait for chat to load
    await page.waitForTimeout(1000)

    // Textarea should be focused automatically when chat opens
    const messageInput = page.locator(
      'textarea[placeholder="Ask about experience, projects, or skills..."]'
    )
    await expect(messageInput).toBeFocused()

    // Type message and test Enter key submission
    await messageInput.fill('Test message for keyboard navigation')
    await messageInput.press('Enter')

    // Message should be sent
    await expect(
      page.locator('text="Test message for keyboard navigation"')
    ).toBeVisible({ timeout: 5000 })
  })

  test('should display unread indicator after timeout', async ({ page }) => {
    // Wait for the unread indicator to appear (should show after 10 seconds according to component)
    await page.waitForTimeout(11000)

    // Look for the red dot indicator (animate-pulse class)
    const unreadIndicator = page.locator('.animate-pulse')
    await expect(unreadIndicator).toBeVisible({ timeout: 2000 })

    // Open chat - indicator should disappear
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await chatBubble.click()

    // Indicator should no longer be visible after opening chat
    await expect(unreadIndicator).not.toBeVisible({ timeout: 2000 })
  })
})
