'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('system')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className='h-5 w-5 transition-all' />
    } else if (theme === 'light') {
      return <Sun className='h-5 w-5 transition-all' />
    } else {
      return <Moon className='h-5 w-5 transition-all' />
    }
  }

  const getLabel = () => {
    if (theme === 'system') {
      return 'System theme'
    } else if (theme === 'light') {
      return 'Light theme'
    } else {
      return 'Dark theme'
    }
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={cycleTheme}
      className='fixed top-6 right-6 z-50 bg-background/80 backdrop-blur-sm border border-border hover:bg-accent transition-all duration-300'
    >
      {getIcon()}
      <span className='sr-only'>{getLabel()}</span>
    </Button>
  )
}
