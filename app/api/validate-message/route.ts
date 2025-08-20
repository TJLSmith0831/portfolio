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
✅ Send email for:
- Genuine business inquiries or collaboration opportunities
- Job/interview opportunities
- Technical questions requiring detailed discussion
- Project partnership proposals
- Speaking engagement invitations
- Consulting inquiries

❌ DO NOT send email for:
- Casual greetings ("Hi", "Hello", "How are you?")
- Test messages or random questions
- Questions already fully answered in the conversation
- Spam or irrelevant content
- Simple informational questions about publicly available info
- Generic compliments without specific business intent

Respond with only "YES" or "NO" followed by a brief reason (max 20 words).

Examples:
- "Hi there!" → NO - casual greeting
- "I'd like to hire you for a project" → YES - business inquiry
- "What technologies do you use?" → NO - general question already answered
- "Can we schedule a call to discuss a collaboration?" → YES - business meeting request`

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
