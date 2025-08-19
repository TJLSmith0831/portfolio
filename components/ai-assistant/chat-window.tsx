'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Message } from './message'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi! I'm here to help answer questions about Tristan's background, experience, and projects. Feel free to ask about his skills, work history, or anything else you'd like to know!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInput('')
    setIsLoading(true)
    setStreamingMessageId(assistantMessageId)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const jsonStr = line.slice(2)
              const data = JSON.parse(jsonStr)
              if (data.content) {
                accumulatedContent += data.content
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }
            } catch {}
          }
        }
      }

      await handleMessageValidation([
        ...messages,
        userMessage,
        { ...assistantMessage, content: accumulatedContent },
      ])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'Sorry, I encountered an error. Please try again.',
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
      setStreamingMessageId(null)
    }
  }

  const handleMessageValidation = async (
    conversationMessages: ChatMessage[]
  ) => {
    try {
      const validationResponse = await fetch('/api/validate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      })

      const validation = await validationResponse.json()

      if (validation.shouldNotify) {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationMessages.map(({ role, content }) => ({
              role,
              content,
            })),
            visitorIP: 'Unknown',
            timestamp: new Date().toISOString(),
            validationReason: validation.reason,
          }),
        })
      }
    } catch (error) {
      console.error('Message validation error:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as React.FormEvent)
    }
  }

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-40 transition-all duration-300 ease-in-out',
        isOpen
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-95 pointer-events-none'
      )}
    >
      <Card className='w-96 h-[32rem] flex flex-col shadow-2xl border'>
        <div className='p-4 border-b'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold text-foreground'>AI Assistant</h3>
              <p className='text-xs text-muted-foreground'>
                Ask me about Tristan&apos;s experience
              </p>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='text-muted-foreground hover:text-foreground'
            >
              ×
            </Button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-2 space-y-2'>
          {messages.map(message => (
            <Message
              key={message.id}
              role={message.role}
              content={message.content}
              isStreaming={streamingMessageId === message.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className='p-4 border-t'>
          <form onSubmit={handleSubmit} className='flex gap-2'>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Ask about experience, projects, or skills...'
              className='flex-1 min-h-[40px] max-h-[100px] px-3 py-2 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring'
              disabled={isLoading}
            />
            <Button
              type='submit'
              size='sm'
              disabled={!input.trim() || isLoading}
              className='px-3'
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
            </Button>
          </form>
          <p className='text-xs text-muted-foreground mt-2 text-center'>
            Important messages are automatically forwarded via email
          </p>
        </div>
      </Card>
    </div>
  )
}
