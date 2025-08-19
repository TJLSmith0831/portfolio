"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

export function HeroSection() {
  const scrollToWork = () => {
    const workSection = document.getElementById("work")
    if (workSection) {
      workSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Tristan Smith
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">Full-Stack Developer and Data Scientist</p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Crafting digital experiences with modern technologies. Passionate about clean code, user experience, and
            innovative solutions.
          </p>
          <Button onClick={scrollToWork} size="lg" className="group transition-all duration-300 hover:scale-105">
            View My Work
            <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}
