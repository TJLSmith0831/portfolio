import { openai } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages } from 'ai'
import { promises as fs } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'

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

function createSystemPrompt(contextData: Record<string, unknown> | null) {
  if (!contextData) {
    return `You are a helpful AI assistant for a portfolio website. You can only respond with "I don't know" since context data is not available.`
  }

  const { personal, experience, projects } = contextData

  return `You are an AI assistant representing ${personal.name}, a ${personal.currentRole} based in ${personal.location}. 

IMPORTANT GUIDELINES:
- You must ONLY provide information that is explicitly available in the context data provided below
- When you don't have specific information, you MUST respond with "I don't know" or "I don't have that information"
- Never make up or speculate about details not provided
- Maintain a ${personal.aiAssistantInstructions.tone} tone
- For complex technical discussions or business inquiries, suggest contacting via email
- Be conversational but stick strictly to factual information from the context

PERSONAL CONTEXT:
${JSON.stringify(personal, null, 2)}

EXPERIENCE AND BACKGROUND:
${JSON.stringify(experience, null, 2)}

PROJECTS:
${JSON.stringify(projects, null, 2)}

Remember: If a question cannot be answered with the information above, respond with "I don't know" or direct them to email for more detailed discussions.`
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const contextData = await loadContextData()
    const systemPrompt = createSystemPrompt(contextData)

    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      messages: convertToCoreMessages([
        { role: 'system', content: systemPrompt },
        ...messages,
      ]),
      temperature: 0.3,
      maxTokens: 500,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
