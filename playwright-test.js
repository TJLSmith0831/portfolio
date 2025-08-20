const { chromium } = require('playwright')

async function testAIAssistant() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🚀 Starting Swishter test...')

    // Navigate to the portfolio page
    await page.goto('http://localhost:3000')
    console.log('✅ Page loaded')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if the chat bubble is visible
    const chatBubble = page.locator('[aria-label="Open chat assistant"]')
    await chatBubble.waitFor({ timeout: 5000 })
    console.log('✅ Chat bubble is visible')

    // Click to open the chat window
    await chatBubble.click()
    console.log('✅ Clicked chat bubble')

    // Check if chat window opens
    await page.waitForSelector('text=Swishter', { timeout: 5000 })
    console.log('✅ Chat window opened')

    // Check if the initial greeting message is present
    await page.waitForSelector("text=Hi! I'm here to help", { timeout: 5000 })
    console.log('✅ Initial greeting message visible')

    // Test message input
    const messageInput = page.locator(
      'textarea[placeholder*="Ask about experience"]'
    )
    await messageInput.waitFor({ timeout: 5000 })
    console.log('✅ Message input field is visible')

    // Type a test message
    await messageInput.fill("What is Tristan's current role?")
    console.log('✅ Typed test message')

    // Send the message
    await page.locator('button[type="submit"]').click()
    console.log('✅ Sent test message')

    // Wait for response (give AI time to respond)
    await page.waitForTimeout(3000)
    console.log('✅ Waited for AI response')

    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 })
    console.log('✅ Switched to mobile viewport')

    // Check if chat bubble is still visible on mobile
    await chatBubble.waitFor({ timeout: 5000 })
    console.log('✅ Chat bubble visible on mobile')

    // Test desktop view
    await page.setViewportSize({ width: 1024, height: 768 })
    console.log('✅ Switched to desktop viewport')

    console.log('🎉 All tests passed! Swishter is working correctly.')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await browser.close()
  }
}

testAIAssistant()
