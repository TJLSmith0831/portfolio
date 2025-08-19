import { HeroSection } from '@/components/hero-section'
import { WorkSection } from '@/components/work-section'
import { PersonalSection } from '@/components/personal-section'
import { ContactSection } from '@/components/contact-section'
import { Navigation } from '@/components/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { AnimatedBackground } from '@/components/animated-background'
import { AIAssistant } from '@/components/ai-assistant/ai-assistant'

export default function Home() {
  return (
    <main className='relative min-h-screen'>
      <AnimatedBackground />
      <ThemeToggle />
      <Navigation />

      <section id='hero'>
        <HeroSection />
      </section>

      <section id='work' className='py-20'>
        <WorkSection />
      </section>

      <section id='personal' className='py-20'>
        <PersonalSection />
      </section>

      <section id='contact' className='py-20'>
        <ContactSection />
      </section>

      <AIAssistant />
    </main>
  )
}
