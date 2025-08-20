import { test, expect } from '@playwright/test'

test.describe('Final Diagnosis Summary', () => {
  test('Complete portfolio diagnosis', async ({ page }) => {
    console.log('=== COMPREHENSIVE PORTFOLIO DIAGNOSIS SUMMARY ===')

    // Enable detailed logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ BROWSER ERROR: ${msg.text()}`)
      }
    })

    const failed404Resources: string[] = []
    page.on('response', response => {
      if (response.status() === 404) {
        failed404Resources.push(response.url())
        console.log(`❌ 404 ERROR: ${response.url()}`)
      }
    })

    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Test 1: Chat Interface
    console.log('\n=== TESTING CHAT INTERFACE ===')

    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await expect(chatBubble).toBeVisible()
    console.log('✅ Chat bubble is visible')

    await chatBubble.click()
    const chatWindow = page.locator('h3:has-text("Swishter")')
    await expect(chatWindow).toBeVisible()
    console.log('✅ Chat window opens successfully')

    const messageInput = page.locator('textarea[placeholder*="Ask about"]')
    await messageInput.fill('Tell me about Tristan')

    const sendButton = page.locator('button[type="submit"]')
    await sendButton.click()
    console.log('✅ Message sent successfully')

    // Wait for loading and response
    await page.waitForTimeout(8000)

    const allMessages = page.locator('[class*="space-y-2"] > *')
    const messageCount = await allMessages.count()
    console.log(`📊 Total UI elements in chat area: ${messageCount}`)

    // Check specifically for AI response content
    const aiResponseContent = page
      .locator('div:has-text("Swishter"):not(:has-text("Hi! I\'m here"))')
      .locator('p, div')
      .filter({ hasText: /[A-Za-z]{10,}/ })
    const hasAiResponse = (await aiResponseContent.count()) > 0

    if (hasAiResponse) {
      const responseText = await aiResponseContent.first().textContent()
      console.log(
        `✅ AI Response found: "${responseText?.substring(0, 100)}..."`
      )
    } else {
      console.log(
        '❌ AI Response is empty or missing - STREAMING ISSUE CONFIRMED'
      )
    }

    // Test 2: Image Loading Analysis
    console.log('\n=== TESTING IMAGE LOADING ===')

    // Scroll to work section
    await page.locator('h2:has-text("Featured Work")').scrollIntoViewIfNeeded()

    const workImages = page.locator(
      'img[alt*="Platform"], img[alt*="App"], img[alt*="Dashboard"], img[alt*="Analytics"], img[alt*="Fitness"]'
    )
    const workImageCount = await workImages.count()
    console.log(`🖼️ Found ${workImageCount} work section images`)

    let loadedWorkImages = 0
    for (let i = 0; i < workImageCount; i++) {
      const img = workImages.nth(i)
      const naturalWidth = await img.evaluate(
        (el: HTMLImageElement) => el.naturalWidth
      )
      const src = await img.getAttribute('src')

      if (naturalWidth > 0) {
        loadedWorkImages++
      } else {
        console.log(`❌ Failed to load work image: ${src}`)
      }
    }
    console.log(`✅ Work images loaded: ${loadedWorkImages}/${workImageCount}`)

    // Scroll to personal section
    await page
      .locator('h2:has-text("Beyond the Code")')
      .scrollIntoViewIfNeeded()

    const personalImages = page.locator(
      'img[alt*="Hiking"], img[alt*="Coding"], img[alt*="City"], img[alt*="Cooking"], img[alt*="Speaking"], img[alt*="Playing"], img[alt*="Beach"], img[alt*="Rock"]'
    )
    const personalImageCount = await personalImages.count()
    console.log(`🖼️ Found ${personalImageCount} personal section images`)

    let loadedPersonalImages = 0
    for (let i = 0; i < personalImageCount; i++) {
      const img = personalImages.nth(i)
      const naturalWidth = await img.evaluate(
        (el: HTMLImageElement) => el.naturalWidth
      )
      const src = await img.getAttribute('src')

      if (naturalWidth > 0) {
        loadedPersonalImages++
      } else {
        console.log(`❌ Failed to load personal image: ${src}`)
      }
    }
    console.log(
      `✅ Personal images loaded: ${loadedPersonalImages}/${personalImageCount}`
    )

    // Test 3: API Direct Test
    console.log('\n=== TESTING API DIRECTLY ===')

    const apiResponse = await page.request.post(
      'http://localhost:3000/api/chat',
      {
        data: { messages: [{ role: 'user', content: 'Test API' }] },
      }
    )

    console.log(`🔌 Chat API Status: ${apiResponse.status()}`)

    if (apiResponse.ok) {
      const responseText = await apiResponse.text()
      const hasContent = responseText.length > 50
      console.log(`📝 API Response Length: ${responseText.length} characters`)
      console.log(`📄 API Returns Data: ${hasContent ? 'YES' : 'NO'}`)
      console.log(
        `🔍 Response Format: ${responseText.includes('0:') ? 'JSON Stream' : 'Plain Text Stream'}`
      )

      if (!responseText.includes('0:')) {
        console.log(
          '❌ ISSUE IDENTIFIED: API returns plain text but client expects JSON stream format'
        )
      }
    } else {
      console.log('❌ API call failed')
    }

    // Summary
    console.log('\n=== DIAGNOSIS SUMMARY ===')
    console.log(`📊 Total 404 errors: ${failed404Resources.length}`)
    console.log(`🖼️ Work images loading: ${loadedWorkImages}/${workImageCount}`)
    console.log(
      `🖼️ Personal images loading: ${loadedPersonalImages}/${personalImageCount}`
    )
    console.log(`💬 Chat API working: ${apiResponse.ok ? 'YES' : 'NO'}`)
    console.log(
      `🔄 Streaming format issue: ${!hasAiResponse ? 'CONFIRMED' : 'NONE'}`
    )

    if (failed404Resources.length > 0) {
      console.log('\n❌ MISSING RESOURCES:')
      failed404Resources.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`)
      })
    }
  })
})
