'use client'

import { useState } from 'react'
import { Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmailInputProps {
  onSubmit: (email: string) => void
  onSkip: () => void
  isLoading?: boolean
  className?: string
}

export function EmailInput({ onSubmit, onSkip, isLoading = false, className }: EmailInputProps) {
  const [email, setEmail] = useState('')
  const [isValidEmail, setIsValidEmail] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    setIsValidEmail(validateEmail(newEmail))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValidEmail && !isLoading) {
      onSubmit(email.trim())
    }
  }

  const handleSkip = () => {
    if (!isLoading) {
      onSkip()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as React.FormEvent)
    }
  }

  return (
    <div className={cn(
      'p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3',
      className
    )}>
      <div className='flex items-center gap-2 text-blue-700 dark:text-blue-300'>
        <Mail className='h-4 w-4' />
        <span className='text-sm font-medium'>Email Collection</span>
      </div>
      
      <p className='text-xs text-blue-600 dark:text-blue-400'>
        To forward your message, please provide your email address. This helps me send you updates and allows for follow-up discussions.
      </p>

      <form onSubmit={handleSubmit} className='space-y-3'>
        <div>
          <input
            type='email'
            value={email}
            onChange={handleEmailChange}
            onKeyDown={handleKeyDown}
            placeholder='your.email@example.com'
            className={cn(
              'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isValidEmail
                ? 'border-green-300 dark:border-green-600'
                : email.length > 0
                ? 'border-red-300 dark:border-red-600'
                : 'border-gray-300 dark:border-gray-600'
            )}
            disabled={isLoading}
            autoFocus
          />
          {email.length > 0 && !isValidEmail && (
            <p className='text-xs text-red-500 mt-1'>Please enter a valid email address</p>
          )}
        </div>

        <div className='flex gap-2'>
          <Button
            type='submit'
            size='sm'
            disabled={!isValidEmail || isLoading}
            className='flex-1'
          >
            {isLoading ? (
              'Sending...'
            ) : (
              <>
                <Send className='h-3 w-3 mr-1' />
                Send Message
              </>
            )}
          </Button>
          
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip
          </Button>
        </div>
      </form>

      <p className='text-xs text-gray-500 dark:text-gray-400'>
        Your email will only be used to send you a copy of this conversation and any follow-up responses. 
        It will not be shared with third parties.
      </p>
    </div>
  )
}