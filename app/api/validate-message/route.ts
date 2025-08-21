import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { kv } from '@vercel/kv'
import { withMonitoring } from '@/lib/monitoring'

export const runtime = 'nodejs'

const RATE_LIMIT_KEY = 'email_rate_limit'
const MAX_EMAILS_PER_IP = 3
const RATE_LIMIT_WINDOW = 24 * 60 * 60 // 24 hours in seconds

/**
 * Checks if the given IP address has exceeded the rate limit for email notifications.
 * Skips rate limiting for local development when KV environment variables are not properly configured.
 * @param {string} ip - The client IP address to check
 * @returns {Promise<{allowed: boolean; remaining: number}>} Object indicating if the request is allowed and remaining quota
 */
async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  // Skip KV for local development if environment variables are missing or contain placeholders
  const kvUrl = process.env.KV_REST_API_URL
  const kvToken = process.env.KV_REST_API_TOKEN

  if (
    !kvUrl ||
    !kvToken ||
    kvUrl.includes('your-database-name') ||
    kvToken.includes('your-actual-token')
  ) {
    console.log(
      'KV not configured, skipping rate limiting for local development'
    )
    return { allowed: true, remaining: MAX_EMAILS_PER_IP }
  }

  try {
    const key = `${RATE_LIMIT_KEY}:${ip}`
    const current = ((await kv.get(key)) as number) || 0

    if (current >= MAX_EMAILS_PER_IP) {
      return { allowed: false, remaining: 0 }
    }

    return { allowed: true, remaining: MAX_EMAILS_PER_IP - current }
  } catch (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true, remaining: MAX_EMAILS_PER_IP }
  }
}

/**
 * Increments the rate limit counter for the given IP address.
 * Skips increment for local development when KV environment variables are not properly configured.
 * @param {string} ip - The client IP address to increment the counter for
 * @returns {Promise<void>} Promise that resolves when the counter is incremented
 */
async function incrementRateLimit(ip: string): Promise<void> {
  // Skip KV for local development if environment variables are missing or contain placeholders
  const kvUrl = process.env.KV_REST_API_URL
  const kvToken = process.env.KV_REST_API_TOKEN

  if (
    !kvUrl ||
    !kvToken ||
    kvUrl.includes('your-database-name') ||
    kvToken.includes('your-actual-token')
  ) {
    console.log(
      'KV not configured, skipping rate limit increment for local development'
    )
    return
  }

  try {
    const key = `${RATE_LIMIT_KEY}:${ip}`
    const current = ((await kv.get(key)) as number) || 0
    await kv.setex(key, RATE_LIMIT_WINDOW, current + 1)
  } catch (error) {
    console.error('Rate limit increment error:', error)
  }
}

/**
 * Extracts the client IP address from the request headers.
 * Checks x-forwarded-for and x-real-ip headers, fallback to localhost for local development.
 * @param {Request} request - The HTTP request object
 * @returns {string} The client IP address
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return '127.0.0.1'
}

/**
 * Handles POST requests to validate chat messages and determine if they warrant email notifications.
 * Uses AI to analyze conversation context and apply business rules for filtering legitimate inquiries.
 * @param {Request} req - The HTTP request containing chat messages to validate
 * @returns {Promise<Response>} JSON response with validation result and rate limit information
 */
const handleValidationRequest = async (req: Request) => {
  try {
    const { messages } = await req.json()
    const ip = getClientIP(req)

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({
        shouldNotify: false,
        reason: 'No messages provided',
      })
    }

    const rateLimit = await checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return Response.json({
        shouldNotify: false,
        reason: 'Rate limit exceeded',
        rateLimitInfo: {
          remaining: rateLimit.remaining,
          resetTime: RATE_LIMIT_WINDOW,
        },
      })
    }

    const conversationContext = messages
      .map(
        (msg: { role: string; content: string }) =>
          `${msg.role}: ${msg.content}`
      )
      .join('\\n')

    const validationPrompt = `Analyze this conversation and determine if it warrants sending an email notification to the portfolio owner.

CONVERSATION:
${conversationContext}

CRITERIA FOR EMAIL NOTIFICATION:
✅ Send email for EXPLICIT business intent:
- Direct hiring requests: "I want to hire you", "I'd like to hire Tristan"
- Interview opportunities: "I want to interview you for", "interested in interviewing you"
- Specific project proposals: "I have a project for you", "We need someone for"
- Meeting/call requests: "Can we schedule a call", "Let's set up a meeting"
- Consulting inquiries: "We need consulting help", "Can you consult on"
- Speaking invitations: "Would you speak at", "We'd like you to present"
- Collaboration proposals: "Want to collaborate on", "Partnership opportunity"

❌ DO NOT send email for informational questions (even if business-adjacent):
- General background questions: "Tell me about Tristan", "What's your experience?"
- Technology questions: "What technologies do you use?", "How do you approach"
- Portfolio inquiries: "What projects have you worked on?", "Can you explain"
- Casual greetings: "Hi", "Hello", "How are you?"
- Generic compliments: "Nice portfolio", "Great work"
- Educational questions: "How did you learn", "What's the best way to"
- Already answered questions where AI provided complete information

KEY RULE: Look for explicit ACTION requests (hire, interview, schedule, collaborate) vs INFORMATION requests (tell me, what is, how do you).

Respond with only "YES" or "NO" followed by a brief reason (max 20 words).

Examples:
- "Tell me about Tristan" → NO - informational question
- "I want to hire Tristan for a React project" → YES - direct hiring request
- "What technologies does he use?" → NO - general information request
- "Can we schedule a call to discuss a collaboration?" → YES - explicit meeting request
- "How did you learn data science?" → NO - educational question
- "I'm interested in interviewing you for a position at Google" → YES - interview opportunity`

    const result = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: validationPrompt,
      temperature: 0.1,
      maxOutputTokens: 100,
    })

    const response = result.text.trim()
    const shouldNotify = response.toUpperCase().startsWith('YES')
    const reason = response.includes(' - ')
      ? response.split(' - ')[1]
      : response

    if (shouldNotify) {
      await incrementRateLimit(ip)
    }

    return Response.json({
      shouldNotify,
      reason,
      rateLimitInfo: {
        remaining: shouldNotify ? rateLimit.remaining - 1 : rateLimit.remaining,
        resetTime: RATE_LIMIT_WINDOW,
      },
    })
  } catch (error) {
    console.error('Validation error:', error)
    return Response.json(
      {
        shouldNotify: false,
        reason: 'Validation service temporarily unavailable',
      },
      { status: 500 }
    )
  }
}

export const POST = withMonitoring(
  handleValidationRequest,
  '/api/validate-message'
)
