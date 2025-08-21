'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const photos = [
  {
    id: 1,
    src: '/wedding.jpeg',
    alt: 'Wedding celebration 2023',
    description:
      'Best day ever! Marrying Amelia in 2023 was just the beginning of our adventure together. She somehow manages to put up with my coding marathons and still brings me coffee at 2 AM.',
    size: 'large',
  },
  {
    id: 2,
    src: '/swish_pic.jpeg',
    alt: 'Bernedoodle dad moments',
    description:
      'Meet Swish, my Bernedoodle and self-appointed Chief Debugging Officer. He has zero coding skills but somehow always knows when I need a walk break. Those puppy eyes are dangerously effective at ending late-night coding sessions.',
    size: 'large',
  },
  {
    id: 3,
    src: '/austin-skyline.webp',
    alt: 'Austin Texas lifestyle',
    description:
      'Born and raised in Austin, where breakfast tacos are a food group and "Keep Austin Weird" isn\'t just a slogan. This city taught me that the best solutions often come from the most unexpected places.',
    size: 'square',
  },
  {
    id: 4,
    src: '/longhorns.jpeg',
    alt: 'Sports fan life',
    description:
      "Football season is the best season for me - Texas Longhorns for college, Atlanta Falcons for NFL. Yes, I chose pain with the Falcons, but loyalty runs deep. Hook 'em Horns and Rise Up, always!",
    size: 'square',
  },
  {
    id: 5,
    src: '/graduation.jpeg',
    alt: 'Trinity University graduation',
    description:
      'Trinity University, Class of 2022. Four years of discovering that data tells stories, technology solves problems, and sometimes the best insights come from combining business and sports analytics in unexpected ways.',
    size: 'square',
  },
]

export function PersonalSection() {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null)

  const openPhoto = (id: number) => {
    setSelectedPhoto(id)
  }

  const closePhoto = () => {
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return

    const currentIndex = photos.findIndex(p => p.id === selectedPhoto)
    let newIndex

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedPhoto(photos[newIndex].id)
  }

  const getPhotoSize = (size: string) => {
    switch (size) {
      case 'large':
        return 'md:col-span-2 md:row-span-2'
      case 'wide':
        return 'md:col-span-2'
      case 'tall':
        return 'md:row-span-2'
      case 'square':
        return ''
      default:
        return ''
    }
  }

  const selectedPhotoData = photos.find(p => p.id === selectedPhoto)

  return (
    <div className='container mx-auto px-6'>
      <div className='text-center mb-16'>
        <h2 className='text-4xl md:text-5xl font-bold mb-6'>Beyond the Code</h2>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          Life&apos;s best moments happen away from the screen. Here&apos;s a
          glimpse into the people, places, and passions that keep me grounded
          and inspired.
        </p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]'>
        {photos.map(photo => (
          <Card
            key={photo.id}
            className={`relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-lg ${getPhotoSize(photo.size)}`}
            onClick={() => openPhoto(photo.id)}
            onMouseEnter={() => setHoveredPhoto(photo.id)}
            onMouseLeave={() => setHoveredPhoto(null)}
          >
            <img
              src={photo.src || '/placeholder.svg'}
              alt={photo.alt}
              className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
            />
            <div
              className={`absolute inset-0 bg-black/60 flex items-center justify-center p-4 transition-opacity duration-300 ${
                hoveredPhoto === photo.id ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className='text-white text-sm text-center leading-relaxed'>
                {photo.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Photo modal */}
      {selectedPhoto && selectedPhotoData && (
        <div className='fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='relative max-w-4xl w-full max-h-[90vh] flex flex-col'>
            {/* Close button */}
            <Button
              variant='ghost'
              size='icon'
              className='absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70'
              onClick={closePhoto}
            >
              <X className='h-4 w-4' />
            </Button>

            {/* Navigation buttons */}
            <Button
              variant='ghost'
              size='icon'
              className='absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70'
              onClick={() => navigatePhoto('prev')}
            >
              <ChevronLeft className='h-6 w-6' />
            </Button>

            <Button
              variant='ghost'
              size='icon'
              className='absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70'
              onClick={() => navigatePhoto('next')}
            >
              <ChevronRight className='h-6 w-6' />
            </Button>

            {/* Image */}
            <div className='flex-1 flex items-center justify-center mb-4'>
              <img
                src={selectedPhotoData.src || '/placeholder.svg'}
                alt={selectedPhotoData.alt}
                className='max-w-full max-h-full object-contain rounded-lg'
              />
            </div>

            {/* Description */}
            <div className='bg-background/90 backdrop-blur-sm rounded-lg p-6 mx-4'>
              <p className='text-center text-muted-foreground leading-relaxed'>
                {selectedPhotoData.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
