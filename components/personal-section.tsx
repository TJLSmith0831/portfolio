"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const photos = [
  {
    id: 1,
    src: "/hiking-mountain-landscape.png",
    alt: "Hiking in the mountains",
    description: "Weekend hiking adventure in the Rocky Mountains. Nothing beats the fresh air and stunning views!",
    size: "large",
  },
  {
    id: 2,
    src: "/coffee-shop-coding.png",
    alt: "Coding at a coffee shop",
    description: "My favorite coding spot - a cozy coffee shop downtown where I work on personal projects.",
    size: "medium",
  },
  {
    id: 3,
    src: "/city-skyline-travel.png",
    alt: "City skyline photography",
    description:
      "Capturing the golden hour skyline during a recent trip to Seattle. Photography is my creative outlet.",
    size: "medium",
  },
  {
    id: 4,
    src: "/homemade-pasta-cooking.png",
    alt: "Cooking homemade pasta",
    description: "Sunday pasta making session. Cooking helps me unwind and experiment with new flavors.",
    size: "square",
  },
  {
    id: 5,
    src: "/tech-conference-presentation.png",
    alt: "Speaking at tech conference",
    description: "Presenting at a local tech meetup about modern web development practices. Love sharing knowledge!",
    size: "wide",
  },
  {
    id: 6,
    src: "/guitar-music-hobby.png",
    alt: "Playing guitar",
    description: "Evening music session. Playing guitar helps me relax and stay creative outside of coding.",
    size: "tall",
  },
  {
    id: 7,
    src: "/placeholder-wwxy3.png",
    alt: "Beach sunset",
    description: "Sunset at the beach during a much-needed vacation. Sometimes you need to disconnect to reconnect.",
    size: "medium",
  },
  {
    id: 8,
    src: "/placeholder-eb2gg.png",
    alt: "Rock climbing",
    description: "Indoor rock climbing session. It's a great way to problem-solve with your body instead of code!",
    size: "square",
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

  const navigatePhoto = (direction: "prev" | "next") => {
    if (!selectedPhoto) return

    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto)
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedPhoto(photos[newIndex].id)
  }

  const getPhotoSize = (size: string) => {
    switch (size) {
      case "large":
        return "md:col-span-2 md:row-span-2"
      case "wide":
        return "md:col-span-2"
      case "tall":
        return "md:row-span-2"
      case "square":
        return ""
      default:
        return ""
    }
  }

  const selectedPhotoData = photos.find((p) => p.id === selectedPhoto)

  return (
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Beyond the Code</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          When I'm not building applications, you'll find me exploring the outdoors, experimenting in the kitchen, or
          capturing moments through photography.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className={`relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-lg ${getPhotoSize(photo.size)}`}
            onClick={() => openPhoto(photo.id)}
            onMouseEnter={() => setHoveredPhoto(photo.id)}
            onMouseLeave={() => setHoveredPhoto(null)}
          >
            <img
              src={photo.src || "/placeholder.svg"}
              alt={photo.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div
              className={`absolute inset-0 bg-black/60 flex items-center justify-center p-4 transition-opacity duration-300 ${
                hoveredPhoto === photo.id ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="text-white text-sm text-center leading-relaxed">{photo.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Photo modal */}
      {selectedPhoto && selectedPhotoData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={closePhoto}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => navigatePhoto("prev")}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => navigatePhoto("next")}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center mb-4">
              <img
                src={selectedPhotoData.src || "/placeholder.svg"}
                alt={selectedPhotoData.alt}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Description */}
            <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 mx-4">
              <p className="text-center text-muted-foreground leading-relaxed">{selectedPhotoData.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
