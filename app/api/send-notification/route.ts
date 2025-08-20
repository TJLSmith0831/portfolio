import nodemailer from 'nodemailer'
import { withMonitoring } from '@/lib/monitoring'

export const runtime = 'nodejs'

interface NotificationRequest {
  messages: Array<{ role: string; content: string }>
  visitorIP: string
  timestamp: string
  validationReason?: string
  visitorEmail?: string
}

function createEmailContent(data: NotificationRequest): {
  subject: string
  html: string
  text: string
  visitorEmail?: string
} {
  const { messages, visitorIP, timestamp, validationReason, visitorEmail } = data

  const conversationHtml = messages
    .map(
      msg => `
      <div style="margin-bottom: 16px; padding: 12px; border-left: 3px solid ${msg.role === 'user' ? '#2563eb' : '#10b981'}; background-color: ${msg.role === 'user' ? '#eff6ff' : '#f0fdf4'};">
        <strong>${msg.role === 'user' ? 'Visitor' : 'Swishter'}:</strong><br>
        ${msg.content.replace(/\n/g, '<br>')}
      </div>
    `
    )
    .join('')

  const conversationText = messages
    .map(
      msg =>
        `${msg.role === 'user' ? 'Visitor' : 'Swishter'}: ${msg.content}`
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
        ${visitorEmail ? `<p><strong>Visitor Email:</strong> ${visitorEmail}</p>` : ''}
        ${validationReason ? `<p><strong>AI Assessment:</strong> ${validationReason}</p>` : ''}
      </div>

      <div style="margin: 24px 0;">
        <h3 style="color: #374151;">Conversation History</h3>
        ${conversationHtml}
      </div>

      <div style="background-color: #fef3c7; padding: 12px; border-radius: 6px; margin: 16px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>Note:</strong> This message was automatically validated and forwarded by Swishter, your portfolio AI assistant.
        </p>
      </div>
    </div>
  `

  const text = `
Portfolio Inquiry - ${new Date(timestamp).toLocaleDateString()}

Inquiry Details:
- Timestamp: ${new Date(timestamp).toLocaleString()}
- Visitor IP: ${visitorIP}
${visitorEmail ? `- Visitor Email: ${visitorEmail}` : ''}
${validationReason ? `- AI Assessment: ${validationReason}` : ''}

Conversation History:
${conversationText}

Note: This message was automatically validated and forwarded by Swishter, your portfolio AI assistant.
  `

  return { subject, html, text, visitorEmail }
}

const handleNotificationRequest = async (req: Request) => {
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

    const { subject, html, text, visitorEmail } = createEmailContent(data)

    // Send notification to portfolio owner
    const mailOptions = {
      from: gmailUser,
      to: notificationEmail,
      subject,
      html,
      text,
      replyTo: visitorEmail || gmailUser,
    }

    await transporter.sendMail(mailOptions)

    // Send copy to visitor if email provided
    if (visitorEmail) {
      const visitorSubject = `Copy: ${subject}`
      const visitorHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
            Copy of Your Portfolio Inquiry
          </h2>
          
          <p style="color: #374151;">Hi there!</p>
          
          <p style="color: #374151;">
            Thank you for your inquiry through my portfolio website. This is a copy of the conversation 
            that has been forwarded to Tristan. He typically responds within 24-48 hours for business inquiries.
          </p>

          <div style="margin: 24px 0;">
            <h3 style="color: #374151;">Your Conversation with Swishter</h3>
            ${data.messages
              .map(
                msg => `
                <div style="margin-bottom: 16px; padding: 12px; border-left: 3px solid ${msg.role === 'user' ? '#2563eb' : '#10b981'}; background-color: ${msg.role === 'user' ? '#eff6ff' : '#f0fdf4'};">
                  <strong>${msg.role === 'user' ? 'You' : 'Swishter'}:</strong><br>
                  ${msg.content.replace(/\n/g, '<br>')}
                </div>
              `
              )
              .join('')}
          </div>

          <div style="background-color: #f0f9ff; padding: 12px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: #0369a1;">
              <strong>Next Steps:</strong> Tristan will review your message and respond directly to this email address. 
              Feel free to reply to this email if you have any additional information to share.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            Swishter AI Assistant<br>
            Tristan's Portfolio
          </p>
        </div>
      `

      const visitorText = `
Copy of Your Portfolio Inquiry

Hi there!

Thank you for your inquiry through my portfolio website. This is a copy of the conversation that has been forwarded to Tristan. He typically responds within 24-48 hours for business inquiries.

Your Conversation with Swishter:
${data.messages
  .map(msg => `${msg.role === 'user' ? 'You' : 'Swishter'}: ${msg.content}`)
  .join('\n\n')}

Next Steps: Tristan will review your message and respond directly to this email address. Feel free to reply to this email if you have any additional information to share.

Best regards,
Swishter AI Assistant
Tristan's Portfolio
      `

      const visitorMailOptions = {
        from: gmailUser,
        to: visitorEmail,
        subject: visitorSubject,
        html: visitorHtml,
        text: visitorText,
        replyTo: notificationEmail,
      }

      await transporter.sendMail(visitorMailOptions)
    }

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

export const POST = withMonitoring(handleNotificationRequest, '/api/send-notification')
