import { HeroSection } from '@/components/hero-section'
import { ProfessionalSection } from '@/components/professional-section'
import { ProjectsSection } from '@/components/projects-section'
import { PersonalSection } from '@/components/personal-section'
import { Navigation } from '@/components/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { AnimatedBackground } from '@/components/animated-background'
import { AIAssistant } from '@/components/ai-assistant/ai-assistant'
import { DemosSection } from '@/components/demos-section'
import { SectionTracker } from '@/components/section-tracker'

export default function Home() {
  return (
    <main className='relative min-h-screen'>
      <AnimatedBackground />
      <ThemeToggle />
      <Navigation />

      <section id='hero'>
        <HeroSection />
      </section>

      <section id='experience' className='py-20'>
        <ProfessionalSection />
      </section>

      <section id='projects' className='py-20'>
        <ProjectsSection />
      </section>

      <section id='demos' className='py-20'>
        <DemosSection />
      </section>

      <section id='personal' className='py-20'>
        <PersonalSection />
      </section>

      <AIAssistant />
      <SectionTracker />
    </main>
  )
}
