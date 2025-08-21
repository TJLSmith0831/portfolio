'use client'

import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatBubbleProps {
  isOpen: boolean
  onClick: () => void
  hasUnread?: boolean
}

export function ChatBubble({
  isOpen,
  onClick,
  hasUnread = false,
}: ChatBubbleProps) {
  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <Button
        onClick={onClick}
        size='default'
        className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
          isOpen
            ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
      >
        {hasUnread && !isOpen && (
          <div className='absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse' />
        )}

        {isOpen ? <X className='h-6 w-6' /> : <Sparkles className='h-6 w-6' />}
      </Button>

      {!isOpen && (
        <div className='absolute bottom-16 right-0 mb-2 mr-2 opacity-0 animate-fade-in-up pointer-events-none'>
          <div className='bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-md text-sm whitespace-nowrap border'>
            Ask me about my experience!
            <div className='absolute top-full right-4 border-4 border-transparent border-t-popover'></div>
          </div>
        </div>
      )}
    </div>
  )
}
