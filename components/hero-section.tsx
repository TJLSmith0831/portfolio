'use client'

import { Button } from '@/components/ui/button'
import { ArrowDown, Github, Linkedin } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

export function HeroSection() {
  const { theme } = useTheme()

  const scrollToWork = () => {
    const experienceSection = document.getElementById('experience')
    if (experienceSection) {
      experienceSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-6 relative'>
      {/* Social Media Icons - Top Left */}
      <div className='fixed top-8 left-8 z-30 flex gap-3'>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full bg-background/80 backdrop-blur-sm hover:bg-background border'
          asChild
        >
          <a
            href='https://github.com/TJLSmith0831'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='GitHub Profile'
          >
            <Github className='h-5 w-5' />
          </a>
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full bg-background/80 backdrop-blur-sm hover:bg-background border'
          asChild
        >
          <a
            href='https://www.linkedin.com/in/tjlsmith0831/'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='LinkedIn Profile'
          >
            <Linkedin className='h-5 w-5' />
          </a>
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full bg-background/80 backdrop-blur-sm hover:bg-background border'
          asChild
        >
          <a
            href='https://medium.com/@tjlsmith0831'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Medium Profile'
          >
            <Image
              src={
                theme === 'light'
                  ? '/medium-logo-black.png'
                  : '/medium-logo-white.png'
              }
              alt='Medium Icon'
              width={24}
              height={24}
            />
          </a>
        </Button>
      </div>

      <div className='text-center max-w-4xl mx-auto'>
        <div className='animate-fade-in-up'>
          <h1 className='text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent'>
            Tristan Smith
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground mb-4'>
            Full-Stack Developer and Data Scientist
          </p>
          <p className='text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed'>
            Crafting digital experiences with modern technologies. Passionate
            about clean code, user experience, and innovative solutions.
          </p>
          <Button
            onClick={scrollToWork}
            size='lg'
            className='group transition-all duration-300 hover:scale-105'
          >
            View My Work
            <ArrowDown className='ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform' />
          </Button>
        </div>
      </div>
    </div>
  )
}
