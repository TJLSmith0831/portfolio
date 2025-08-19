import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

interface NotificationRequest {
  messages: Array<{ role: string; content: string }>
  visitorIP: string
  timestamp: string
  validationReason?: string
}

function createEmailContent(data: NotificationRequest): {
  subject: string
  html: string
  text: string
} {
  const { messages, visitorIP, timestamp, validationReason } = data

  const conversationHtml = messages
    .map(
      msg => `
      <div style="margin-bottom: 16px; padding: 12px; border-left: 3px solid ${msg.role === 'user' ? '#2563eb' : '#10b981'}; background-color: ${msg.role === 'user' ? '#eff6ff' : '#f0fdf4'};">
        <strong>${msg.role === 'user' ? 'Visitor' : 'AI Assistant'}:</strong><br>
        ${msg.content.replace(/\n/g, '<br>')}
      </div>
    `
    )
    .join('')

  const conversationText = messages
    .map(
      msg =>
        `${msg.role === 'user' ? 'Visitor' : 'AI Assistant'}: ${msg.content}`
    )
    .join('\n\n')

  const subject = `Portfolio Inquiry - ${new Date(timestamp).toLocaleDateString()}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
        New Portfolio Inquiry
      </h2>
      
      <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0;">
        <h3 style="margin-top: 0; color: #374151;">Inquiry Details</h3>
        <p><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}</p>
        <p><strong>Visitor IP:</strong> ${visitorIP}</p>
        ${validationReason ? `<p><strong>AI Assessment:</strong> ${validationReason}</p>` : ''}
      </div>

      <div style="margin: 24px 0;">
        <h3 style="color: #374151;">Conversation History</h3>
        ${conversationHtml}
      </div>

      <div style="background-color: #fef3c7; padding: 12px; border-radius: 6px; margin: 16px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>Note:</strong> This message was automatically validated and forwarded by your portfolio AI assistant.
        </p>
      </div>
    </div>
  `

  const text = `
Portfolio Inquiry - ${new Date(timestamp).toLocaleDateString()}

Inquiry Details:
- Timestamp: ${new Date(timestamp).toLocaleString()}
- Visitor IP: ${visitorIP}
${validationReason ? `- AI Assessment: ${validationReason}` : ''}

Conversation History:
${conversationText}

Note: This message was automatically validated and forwarded by your portfolio AI assistant.
  `

  return { subject, html, text }
}

export async function POST(req: Request) {
  try {
    const data: NotificationRequest = await req.json()

    if (!data.messages || !Array.isArray(data.messages)) {
      return Response.json({ error: 'Invalid messages data' }, { status: 400 })
    }

    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_PASS
    const notificationEmail = process.env.NOTIFICATION_EMAIL

    if (!gmailUser || !gmailPass || !notificationEmail) {
      console.error('Missing required environment variables')
      return Response.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })

    const { subject, html, text } = createEmailContent(data)

    const mailOptions = {
      from: gmailUser,
      to: notificationEmail,
      subject,
      html,
      text,
      replyTo: gmailUser,
    }

    await transporter.sendMail(mailOptions)

    return Response.json({
      success: true,
      message: 'Notification sent successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Email sending error:', error)
    return Response.json(
      {
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
