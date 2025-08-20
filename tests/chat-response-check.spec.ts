import { test } from '@playwright/test'

test('Chat Response Detail Check', async ({ page }) => {
  console.log('=== DETAILED CHAT RESPONSE CHECK ===')
  
  await page.goto('http://localhost:3002')
  await page.waitForLoadState('networkidle')

  // Open chat
  const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
  await chatBubble.click()
  await page.waitForTimeout(1000)

  // Send message
  const messageInput = page.locator('textarea[placeholder*="Ask about"]')
  await messageInput.fill('Tell me about Tristan')
  
  const sendButton = page.locator('button[type="submit"]')
  await sendButton.click()

  // Wait for response
  await page.waitForTimeout(8000)

  // Get all message content
  const messageElements = page.locator('[class*="space-y-2"] [role="paragraph"], [class*="space-y-2"] p, [class*="space-y-2"] div').filter({ hasText: /\w+/ })
  const messageCount = await messageElements.count()
  
  console.log(`Found ${messageCount} message elements with text`)
  
  for (let i = 0; i < Math.min(messageCount, 10); i++) {
    const text = await messageElements.nth(i).textContent()
    const tagName = await messageElements.nth(i).evaluate(el => el.tagName.toLowerCase())
    console.log(`${i + 1}. [${tagName}] "${text?.substring(0, 80)}..."`)
  }

  // Look specifically for AI assistant responses
  const aiResponses = page.locator('div:has(span:text("Swishter")) + div, p:has(span:text("Swishter")) + p')
  const aiResponseCount = await aiResponses.count()
  console.log(`\nAI response containers: ${aiResponseCount}`)
  
  for (let i = 0; i < aiResponseCount; i++) {
    const content = await aiResponses.nth(i).textContent()
    console.log(`AI Response ${i + 1}: "${content}"`)
  }
})