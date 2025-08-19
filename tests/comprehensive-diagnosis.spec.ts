import { test, expect } from '@playwright/test'

test.describe('Comprehensive Portfolio Diagnosis', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging to capture any JavaScript errors
    page.on('console', (msg) => {
      console.log(`BROWSER LOG [${msg.type()}]:`, msg.text())
    })

    // Log network failures
    page.on('requestfailed', (request) => {
      console.log(`NETWORK FAILURE: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`)
    })

    // Log network responses for API calls
    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        console.log(`API RESPONSE: ${response.status()} ${response.url()}`)
      }
    })
  })

  test('Chat Interface Diagnosis - Port 3001', async ({ page }) => {
    console.log('=== STARTING CHAT INTERFACE DIAGNOSIS ON PORT 3001 ===')
    
    try {
      // Navigate to the correct port (3000)
      await page.goto('http://localhost:3000')
      await page.waitForLoadState('networkidle')
      console.log('✓ Successfully loaded page on port 3001')
    } catch (error) {
      console.log('✗ Failed to load page on port 3001:', error)
      throw error
    }

    // Check for any JavaScript errors
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
      console.log('JAVASCRIPT ERROR:', error.message)
    })

    // 1. Find and verify chat bubble
    console.log('\n--- STEP 1: Locating Chat Bubble ---')
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    
    try {
      await expect(chatBubble).toBeVisible({ timeout: 10000 })
      console.log('✓ Chat bubble found and visible')
    } catch (error) {
      console.log('✗ Chat bubble not found, checking for alternative selectors...')
      
      // Try alternative selectors
      const alternatives = [
        'button:has-text("💬")',
        'button[title*="chat"]',
        'button[class*="chat"]',
        '[data-testid="chat-bubble"]'
      ]
      
      for (const selector of alternatives) {
        const alt = page.locator(selector)
        if (await alt.isVisible()) {
          console.log(`✓ Found chat button with selector: ${selector}`)
          break
        }
      }
    }

    // 2. Open chat interface
    console.log('\n--- STEP 2: Opening Chat Interface ---')
    try {
      await chatBubble.click()
      console.log('✓ Clicked chat bubble')
      
      // Wait for chat window to appear
      const chatWindow = page.locator('text="AI Assistant"')
      await expect(chatWindow).toBeVisible({ timeout: 5000 })
      console.log('✓ Chat window opened successfully')
      
    } catch (error) {
      console.log('✗ Failed to open chat interface:', error)
      // Take screenshot for debugging
      await page.screenshot({ path: 'debug-chat-open-failure.png', fullPage: true })
    }

    // 3. Send test message
    console.log('\n--- STEP 3: Sending Test Message ---')
    try {
      const messageInput = page.locator('textarea[placeholder*="Ask about"]')
      await expect(messageInput).toBeVisible({ timeout: 5000 })
      console.log('✓ Message input found')
      
      const testMessage = "Tell me about Tristan"
      await messageInput.fill(testMessage)
      console.log('✓ Test message typed')
      
      // Find send button
      const sendButton = page.locator('button[type="submit"]')
      await sendButton.click()
      console.log('✓ Send button clicked')
      
      // Verify message appears in chat
      await expect(page.locator(`text="${testMessage}"`)).toBeVisible({ timeout: 5000 })
      console.log('✓ User message appears in chat')
      
    } catch (error) {
      console.log('✗ Failed to send message:', error)
      await page.screenshot({ path: 'debug-message-send-failure.png', fullPage: true })
    }

    // 4. Wait for AI response and analyze
    console.log('\n--- STEP 4: Waiting for AI Response ---')
    try {
      // Look for loading indicator
      const loadingSpinner = page.locator('svg.animate-spin')
      if (await loadingSpinner.isVisible()) {
        console.log('✓ Loading spinner visible - AI is processing')
        await expect(loadingSpinner).not.toBeVisible({ timeout: 30000 })
        console.log('✓ Loading completed')
      }
      
      // Count total messages
      await page.waitForTimeout(2000) // Give time for response to render
      const messages = page.locator('[class*="space-y-2"] > *').filter({ hasNotText: '' })
      const messageCount = await messages.count()
      console.log(`Total messages in chat: ${messageCount}`)
      
      // Check for AI response content
      const aiMessages = page.locator('text="AI Assistant"').locator('..').locator('p')
      const aiMessageCount = await aiMessages.count()
      console.log(`AI messages found: ${aiMessageCount}`)
      
      if (aiMessageCount > 1) {
        // Get the content of the last AI message
        const lastAiMessage = aiMessages.last()
        const content = await lastAiMessage.textContent()
        console.log(`Last AI message content: "${content}"`)
        
        if (!content || content.trim() === '') {
          console.log('⚠️  AI response is empty - this indicates the chat API issue')
        } else {
          console.log('✓ AI response contains content')
        }
      } else {
        console.log('✗ No AI response found')
      }
      
    } catch (error) {
      console.log('✗ Failed to get AI response:', error)
    }

    // 5. Check API network requests
    console.log('\n--- STEP 5: Analyzing Network Requests ---')
    const responses = await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/chat'), { timeout: 5000 }).catch(() => null),
    ])
    
    for (const response of responses) {
      if (response) {
        console.log(`API Response: ${response.status()} ${response.url()}`)
        if (response.status() !== 200) {
          const responseText = await response.text().catch(() => 'Unable to read response')
          console.log(`API Error Response: ${responseText}`)
        }
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'debug-chat-final-state.png', fullPage: true })
    
    if (errors.length > 0) {
      console.log('\n=== JAVASCRIPT ERRORS FOUND ===')
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`)
      })
    }
  })

  test('Image Loading Diagnosis', async ({ page }) => {
    console.log('\n=== STARTING IMAGE LOADING DIAGNOSIS ===')
    
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Check Work section images
    console.log('\n--- CHECKING WORK SECTION IMAGES ---')
    const workImages = page.locator('img[alt*="E-Commerce"], img[alt*="Task Management"], img[alt*="Weather"], img[alt*="Social Media"], img[alt*="AI-Powered"], img[alt*="Fitness"]')
    const workImageCount = await workImages.count()
    console.log(`Found ${workImageCount} work section images`)
    
    for (let i = 0; i < workImageCount; i++) {
      const img = workImages.nth(i)
      const alt = await img.getAttribute('alt')
      const src = await img.getAttribute('src')
      const isVisible = await img.isVisible()
      
      console.log(`Work Image ${i + 1}: Alt="${alt}", Src="${src}", Visible=${isVisible}`)
      
      // Check if image has loaded
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight)
      
      if (naturalWidth === 0 || naturalHeight === 0) {
        console.log(`⚠️  Image ${i + 1} failed to load (dimensions: ${naturalWidth}x${naturalHeight})`)
      } else {
        console.log(`✓ Image ${i + 1} loaded successfully (dimensions: ${naturalWidth}x${naturalHeight})`)
      }
    }

    // Check Personal section images
    console.log('\n--- CHECKING PERSONAL SECTION IMAGES ---')
    const personalImages = page.locator('img[alt*="Hiking"], img[alt*="Coding"], img[alt*="City"], img[alt*="Cooking"], img[alt*="Speaking"], img[alt*="Playing"], img[alt*="Beach"], img[alt*="Rock"]')
    const personalImageCount = await personalImages.count()
    console.log(`Found ${personalImageCount} personal section images`)
    
    for (let i = 0; i < personalImageCount; i++) {
      const img = personalImages.nth(i)
      const alt = await img.getAttribute('alt')
      const src = await img.getAttribute('src')
      const isVisible = await img.isVisible()
      
      console.log(`Personal Image ${i + 1}: Alt="${alt}", Src="${src}", Visible=${isVisible}`)
      
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight)
      
      if (naturalWidth === 0 || naturalHeight === 0) {
        console.log(`⚠️  Image ${i + 1} failed to load (dimensions: ${naturalWidth}x${naturalHeight})`)
      } else {
        console.log(`✓ Image ${i + 1} loaded successfully (dimensions: ${naturalWidth}x${naturalHeight})`)
      }
    }

    // Check for any failed image requests
    console.log('\n--- CHECKING FOR FAILED IMAGE REQUESTS ---')
    page.on('requestfailed', (request) => {
      if (request.url().match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
        console.log(`⚠️  Failed image request: ${request.url()}`)
      }
    })

    await page.screenshot({ path: 'debug-image-loading.png', fullPage: true })
  })

  test('Environment and Dependencies Check', async ({ page }) => {
    console.log('\n=== ENVIRONMENT AND DEPENDENCIES CHECK ===')
    
    await page.goto('http://localhost:3000')
    
    // Check if Next.js is running properly
    const nextjsIndicators = await page.locator('script[src*="next"]').count()
    console.log(`Next.js script tags found: ${nextjsIndicators}`)
    
    // Check for any missing dependencies or build issues
    const errorElements = page.locator('text*="Module not found", text*="Cannot resolve", text*="Failed to compile"')
    const errorCount = await errorElements.count()
    
    if (errorCount > 0) {
      console.log('⚠️  Build/dependency errors detected:')
      for (let i = 0; i < errorCount; i++) {
        const error = await errorElements.nth(i).textContent()
        console.log(`  - ${error}`)
      }
    } else {
      console.log('✓ No obvious build/dependency errors detected')
    }
    
    // Check if API routes are accessible
    console.log('\n--- CHECKING API ROUTES ---')
    try {
      const chatResponse = await page.request.post('http://localhost:3000/api/chat', {
        data: {
          messages: [{ role: 'user', content: 'test' }]
        }
      })
      console.log(`Chat API Response: ${chatResponse.status()}`)
      
      if (chatResponse.status() !== 200) {
        const errorText = await chatResponse.text()
        console.log(`Chat API Error: ${errorText}`)
      }
    } catch (error) {
      console.log(`Chat API Error: ${error}`)
    }
  })
})