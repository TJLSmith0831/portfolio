'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const photos = [
  {
    id: 1,
    src: 'https://picsum.photos/400/300?random=10',
    alt: 'Bernedoodle dad moments',
    description:
      'Life with my Bernedoodle - the best coding companion and walking buddy. Nothing beats those puppy eyes during debugging sessions!',
    size: 'large',
  },
  {
    id: 2,
    src: 'https://picsum.photos/400/300?random=11',
    alt: 'Austin Texas lifestyle',
    description:
      'Born and raised in Austin, TX - exploring the city that shaped me. From food trucks to tech meetups, this city has it all.',
    size: 'medium',
  },
  {
    id: 3,
    src: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Dresden+Files',
    alt: 'Reading Dresden Files',
    description:
      'Deep into another Dresden Files book by Jim Butcher. My favorite series - urban fantasy meets detective noir perfectly.',
    size: 'medium',
  },
  {
    id: 4,
    src: 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Sports+Fan',
    alt: 'Sports fan life',
    description:
      'Game day ready! Cheering for the Texas Longhorns and Atlanta Falcons. Hook em Horns and Rise Up!',
    size: 'square',
  },
  {
    id: 5,
    src: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Trinity+University',
    alt: 'Trinity University graduation',
    description:
      'Trinity University Class of 2022 - Bachelor of Science in Business Analytics & Technology with a Sports Management minor.',
    size: 'wide',
  },
  {
    id: 6,
    src: 'https://via.placeholder.com/400x300/ec4899/ffffff?text=Wedding+2023',
    alt: 'Wedding celebration 2023',
    description:
      'Married in 2023 to my best friend and biggest supporter. The perfect partner for both adventures and quiet coding nights.',
    size: 'tall',
  },
  {
    id: 7,
    src: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Sports+Analytics',
    alt: 'Sports analytics work',
    description:
      'Combining my passion for sports with data science - working on NBA prediction models and sports analytics projects.',
    size: 'medium',
  },
  {
    id: 8,
    src: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Tech+Community',
    alt: 'Austin tech community',
    description:
      'Part of the vibrant Austin tech scene - attending meetups, sharing knowledge, and building connections in the dev community.',
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
          When I&apos;m not building applications, you&apos;ll find me reading Dresden Files, 
          cheering for the Longhorns and Falcons, or spending time with my Bernedoodle 
          exploring Austin, TX.
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
