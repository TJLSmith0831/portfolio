'use client'

import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

interface MessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export function Message({ role, content, isStreaming = false }: MessageProps) {
  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        isUser ? 'bg-primary/5 ml-8' : 'bg-muted/50 mr-8'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? <User className='h-4 w-4' /> : <Bot className='h-4 w-4' />}
      </div>

      <div className='flex-1 space-y-2'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-muted-foreground'>
            {isUser ? 'You' : 'AI Assistant'}
          </span>
        </div>

        <div
          className={cn(
            'prose prose-sm max-w-none',
            'prose-p:leading-relaxed prose-p:my-2',
            'prose-headings:my-2',
            'prose-ul:my-2 prose-ol:my-2',
            'prose-li:my-0',
            'dark:prose-invert'
          )}
        >
          <p className='whitespace-pre-wrap text-sm text-foreground'>
            {content}
            {isStreaming && (
              <span className='inline-block w-2 h-4 bg-primary/60 ml-1 animate-pulse' />
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
