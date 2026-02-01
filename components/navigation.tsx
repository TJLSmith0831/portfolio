'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'experience', 'demos', 'projects', 'personal']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className='fixed top-6 left-1/2 transform -translate-x-1/2 z-40 bg-background/80 backdrop-blur-sm border border-border rounded-full px-6 py-3'>
      <div className='flex space-x-1'>
        {[
          { id: 'experience', label: 'Experience' },
          { id: 'projects', label: 'Projects' },
          { id: 'demos', label: 'Demos' },
          { id: 'personal', label: 'Personal' },
        ].map(({ id, label }) => (
          <Button
            key={id}
            variant={activeSection === id ? 'default' : 'ghost'}
            size='sm'
            onClick={() => scrollToSection(id)}
            className='transition-all duration-300'
          >
            {label}
          </Button>
        ))}
      </div>
    </nav>
  )
}
