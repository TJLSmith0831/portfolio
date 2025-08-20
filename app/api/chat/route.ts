import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { promises as fs } from 'fs'
import { join } from 'path'
import { withMonitoring } from '@/lib/monitoring'

export const runtime = 'nodejs'

/**
 * Loads contextual data from JSON files for the AI assistant.
 * @returns Object containing personal context, experience, and projects data, or null if loading fails
 */
async function loadContextData() {
  try {
    const dataPath = join(process.cwd(), 'data')

    const [personalContext, experience, projects] = await Promise.all([
      fs.readFile(join(dataPath, 'personal-context.json'), 'utf8'),
      fs.readFile(join(dataPath, 'experience.json'), 'utf8'),
      fs.readFile(join(dataPath, 'projects.json'), 'utf8'),
    ])

    return {
      personal: JSON.parse(personalContext),
      experience: JSON.parse(experience),
      projects: JSON.parse(projects),
    }
  } catch (error) {
    console.error('Error loading context data:', error)
    return null
  }
}

/**
 * Creates a system prompt for the AI assistant based on the provided context data.
 * @param contextData - The loaded context data containing personal info, experience, and projects
 * @returns The formatted system prompt with guidelines and context for the AI assistant
 */
function createSystemPrompt(contextData: Record<string, unknown> | null) {
  if (!contextData) {
    return `You are a helpful AI assistant for a portfolio website. You can only respond with "I don't know" since context data is not available.`
  }

  const { personal, experience, projects } = contextData
  const personalData = personal as Record<string, unknown>

  return `You are Swishter, an AI assistant representing ${personalData.name}, a passionate ${personalData.currentRole} based in ${personalData.location}. You're here to help visitors learn about Tristan's background, experience, and projects in an engaging and helpful way.

PERSONALITY & APPROACH:
- Be enthusiastic and conversational about Tristan's work and background
- Provide helpful context and insights about his projects and technologies
- Share interesting details about his journey from Trinity University to his current role
- Discuss his technical expertise and approach to development
- Be genuinely helpful while maintaining professionalism
- Show his personality - he's a Bernedoodle dad, Dresden Files fan, and supports the Longhorns/Falcons!

WHAT YOU CAN DISCUSS:
- His current role at PILYTIX and previous experience
- Technical projects including the portfolio website, AI assistant, Tenet App, PraetorAI, etc.
- Technologies he works with (React, Next.js, TypeScript, Python, ML, etc.)
- His educational background at Trinity University
- His interests in sports analytics, AI/ML, and modern web development
- General questions about web development, data science, and technology
- His personal interests and life in Austin, TX

HELPFUL GUIDELINES:
- Provide detailed, informative responses using the context data
- When you don't have specific information, acknowledge it but offer related insights
- Engage with follow-up questions about technologies, projects, or approaches
- For genuine business inquiries or collaboration opportunities, suggest email contact
- Be authentic and reflect Tristan's professional but approachable personality

CONTEXT DATA:
Personal: ${JSON.stringify(personal, null, 2)}
Experience: ${JSON.stringify(experience, null, 2)}
Projects: ${JSON.stringify(projects, null, 2)}

Remember: Your goal is to be genuinely helpful and provide valuable insights about Tristan's background and expertise while maintaining accuracy and professionalism.`
}

/**
 * Handles POST requests to the chat API endpoint.
 * Processes incoming chat messages and streams AI responses using OpenAI's GPT-3.5-turbo model.
 * @param req - The incoming HTTP request containing chat messages
 * @returns Streamed text response from the AI model or error response
 */
const handleChatRequest = async (req: Request) => {
  try {
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages array:', messages)
      return new Response('Invalid messages format', { status: 400 })
    }

    const contextData = await loadContextData()
    const systemPrompt = createSystemPrompt(contextData)

    const messagesToConvert = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    // Try direct message format without convertToCoreMessages
    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      messages: messagesToConvert as Parameters<
        typeof streamText
      >[0]['messages'],
      temperature: 0.3,
      maxOutputTokens: 300,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export const POST = withMonitoring(handleChatRequest, '/api/chat')
