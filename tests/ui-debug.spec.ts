import { test, expect } from '@playwright/test'

test.describe('UI Debug', () => {
  test('should capture page state for debugging', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Take a screenshot of the full page
    await page.screenshot({ path: 'debug-full-page.png', fullPage: true })

    // Check if chat bubble exists
    const chatBubbleExists = await page
      .locator('button[aria-label="Open chat assistant"]')
      .isVisible()
      .catch(() => false)
    console.log('Chat bubble exists:', chatBubbleExists)

    if (chatBubbleExists) {
      const chatBubble = page.locator(
        'button[aria-label="Open chat assistant"]'
      )
      await chatBubble.click()

      // Wait and take screenshot after clicking
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'debug-chat-opened.png', fullPage: true })

      // Log all visible text containing "AI"
      const aiTexts = await page.locator('text=AI').allTextContents()
      console.log('All AI-related texts:', aiTexts)

      // Log all visible text containing "Assistant"
      const assistantTexts = await page
        .locator('text=Assistant')
        .allTextContents()
      console.log('All Assistant-related texts:', assistantTexts)

      // Check what's in the messages container
      const messagesContainer = page.locator('.space-y-2')
      const messagesCount = await messagesContainer.count()
      console.log('Messages containers found:', messagesCount)

      if (messagesCount > 0) {
        const messagesText = await messagesContainer.first().allTextContents()
        console.log('Messages content:', messagesText)
      }

      // Check for textarea
      const textareaExists = await page
        .locator('textarea')
        .isVisible()
        .catch(() => false)
      console.log('Textarea exists:', textareaExists)

      if (textareaExists) {
        const textarea = page.locator(
          'textarea[placeholder*="Ask about experience"]'
        )
        await textarea.fill('Test message')
        await page.screenshot({
          path: 'debug-message-typed.png',
          fullPage: true,
        })

        const sendButton = page.locator('button[type="submit"]')
        const sendButtonExists = await sendButton.isVisible().catch(() => false)
        console.log('Send button exists:', sendButtonExists)
      }
    }

    // Final debug info
    const pageTitle = await page.title()
    console.log('Page title:', pageTitle)

    const bodyText = await page.locator('body').textContent()
    const hasAIAssistant = bodyText?.includes('AI Assistant')
    console.log('Page contains "AI Assistant":', hasAIAssistant)

    expect(chatBubbleExists).toBe(true)
  })
})
