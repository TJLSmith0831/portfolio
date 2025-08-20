import { test, expect } from '@playwright/test'

test.describe('API Direct Testing', () => {
  test('Direct API chat test', async ({ page }) => {
    console.log('=== TESTING CHAT API DIRECTLY ===')

    // Navigate to the page first to have the same context
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Test API directly
    const response = await page.request.post('http://localhost:3000/api/chat', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        messages: [{ role: 'user', content: 'Tell me about Tristan' }],
      },
    })

    console.log(`API Status: ${response.status()}`)
    console.log(`API Headers:`, await response.headersArray())

    if (response.ok) {
      // Try to read the streaming response
      const responseText = await response.text()
      console.log(`Response length: ${responseText.length}`)
      console.log(`First 500 characters: ${responseText.substring(0, 500)}`)

      // Check if it's the expected streaming format
      const lines = responseText.split('\n')
      console.log(`Number of lines in response: ${lines.length}`)

      let contentFound = false
      for (const line of lines) {
        if (line.startsWith('0:')) {
          console.log(`Found streaming line: ${line}`)
          try {
            const jsonStr = line.slice(2)
            const data = JSON.parse(jsonStr)
            if (data.content) {
              console.log(`Content found: ${data.content}`)
              contentFound = true
            }
          } catch (e) {
            console.log(`Failed to parse line: ${line}`)
          }
        }
      }

      if (!contentFound) {
        console.log('⚠️ No content found in streaming response!')
      }
    } else {
      const errorText = await response.text()
      console.log(`API Error: ${errorText}`)
    }
  })

  test('Test browser streaming', async ({ page }) => {
    console.log('=== TESTING BROWSER STREAMING ===')

    // Enable console logging
    page.on('console', msg => {
      console.log(`BROWSER [${msg.type()}]:`, msg.text())
    })

    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Open chat
    const chatBubble = page.locator('button[aria-label="Open chat assistant"]')
    await chatBubble.click()

    // Wait for chat window
    await page.waitForTimeout(1000)

    // Inject JavaScript to monitor the fetch response
    await page.addScriptTag({
      content: `
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          console.log('FETCH INTERCEPTED:', args[0]);
          const result = originalFetch.apply(this, args);
          
          if (args[0] === '/api/chat') {
            result.then(async (response) => {
              console.log('CHAT API Response status:', response.status);
              console.log('CHAT API Response headers:', [...response.headers.entries()]);
              
              // Clone the response to read it without consuming the original
              const clonedResponse = response.clone();
              const reader = clonedResponse.body?.getReader();
              if (reader) {
                console.log('STREAMING RESPONSE DETECTED');
                const decoder = new TextDecoder();
                let chunks = [];
                
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  const chunk = decoder.decode(value);
                  chunks.push(chunk);
                  console.log('STREAM CHUNK:', chunk);
                }
                
                console.log('TOTAL CHUNKS:', chunks.length);
                console.log('COMBINED RESPONSE:', chunks.join(''));
              }
            }).catch(e => {
              console.log('FETCH ERROR:', e);
            });
          }
          
          return result;
        };
      `,
    })

    // Send message
    const messageInput = page.locator('textarea[placeholder*="Ask about"]')
    await messageInput.fill('Tell me about Tristan')

    const sendButton = page.locator('button[type="submit"]')
    await sendButton.click()

    // Wait for response
    await page.waitForTimeout(10000)

    // Check final state
    const messages = page
      .locator('[class*="space-y-2"] > *')
      .filter({ hasNotText: '' })
    const messageCount = await messages.count()
    console.log(`Final message count: ${messageCount}`)

    // Get the content of all messages
    for (let i = 0; i < messageCount; i++) {
      const message = messages.nth(i)
      const text = await message.textContent()
      console.log(`Message ${i + 1}: "${text}"`)
    }
  })
})
