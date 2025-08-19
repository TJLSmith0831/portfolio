'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, MapPin, Phone } from 'lucide-react'

export function ContactSection() {
  const handleEmailClick = () => {
    window.location.href =
      "mailto:tjlsmith0831@gmail.com?subject=Let's connect - Portfolio Inquiry"
  }

  return (
    <div className='container mx-auto px-6'>
      <div className='text-center mb-16'>
        <h2 className='text-4xl md:text-5xl font-bold mb-6'>Let's Connect</h2>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          Ready to bring your ideas to life? I'm always excited to discuss new
          projects and opportunities. Let's create something amazing together.
        </p>
      </div>

      <div className='max-w-4xl mx-auto'>
        <Card className='p-8 md:p-12 text-center bg-gradient-to-br from-background to-muted/20'>
          <div className='mb-8'>
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6'>
              <Mail className='h-8 w-8 text-primary' />
            </div>
            <h3 className='text-2xl font-semibold mb-4'>Get In Touch</h3>
            <p className='text-muted-foreground mb-8 max-w-md mx-auto'>
              Whether you have a project in mind, want to collaborate, or just
              want to say hello, I'd love to hear from you.
            </p>
          </div>

          <Button
            size='lg'
            onClick={handleEmailClick}
            className='mb-8 group transition-all duration-300 hover:scale-105'
          >
            <Mail className='mr-2 h-5 w-5 group-hover:rotate-12 transition-transform' />
            Send me an email
          </Button>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border'>
            <div className='flex flex-col items-center text-center'>
              <Mail className='h-6 w-6 text-muted-foreground mb-2' />
              <p className='text-sm text-muted-foreground'>Email</p>
              <p className='font-medium'>tjlsmith0831@gmail.com</p>
            </div>

            <div className='flex flex-col items-center text-center'>
              <MapPin className='h-6 w-6 text-muted-foreground mb-2' />
              <p className='text-sm text-muted-foreground'>Location</p>
              <p className='font-medium'>Available Remotely</p>
            </div>

            <div className='flex flex-col items-center text-center'>
              <Phone className='h-6 w-6 text-muted-foreground mb-2' />
              <p className='text-sm text-muted-foreground'>Response Time</p>
              <p className='font-medium'>Within 24 hours</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
