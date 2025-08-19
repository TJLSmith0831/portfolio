import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { kv } from '@vercel/kv'

export const runtime = 'nodejs'

const RATE_LIMIT_KEY = 'email_rate_limit'
const MAX_EMAILS_PER_IP = 3
const RATE_LIMIT_WINDOW = 24 * 60 * 60 // 24 hours in seconds

async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
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

async function incrementRateLimit(ip: string): Promise<void> {
  try {
    const key = `${RATE_LIMIT_KEY}:${ip}`
    const current = ((await kv.get(key)) as number) || 0
    await kv.setex(key, RATE_LIMIT_WINDOW, current + 1)
  } catch (error) {
    console.error('Rate limit increment error:', error)
  }
}

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

export async function POST(req: Request) {
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
      maxTokens: 100,
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
