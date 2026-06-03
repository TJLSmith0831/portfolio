'use client'

import { useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon, GraduationCap, Shrink } from 'lucide-react'
import { football } from '@lucide/lab'
import { CfbPlayerFitSummarizerDemo } from './demos/cfb-player-fit-summarizer'
import { SirenSpecGradingFactoryDemo } from './demos/sirenspec-grading-factory'
import { SirenSpecCompressionGauntletDemo } from './demos/sirenspec-compression-gauntlet'
import { SirenSpecAIPokemonBattleDemo } from './demos/sirenspec-ai-pokemon-battle'
import Image from 'next/image'

type DemoKey = 'cfb-player-fit-summarizer' | 'sirenspec-grading-factory' | 'sirenspec-compression-gauntlet' |'sirenspec-ai-pokemon-battle'

interface DemoConfig {
  key: DemoKey
  label: string
  description: string
  version?: string
  icon: React.ReactNode
  component: React.ReactNode
}

const DEMOS: DemoConfig[] = [
  {
    key: 'cfb-player-fit-summarizer',
    label: 'College Football Player Fit Summarizer',
    // version: 'v0.1.0',
    description: `
      Full-stack system that scrapes recruiting data and performs model-driven
      player-to-program fit evaluation through an interactive UI. Requests are 
      sent to a FastAPI backend, player data is scraped from 247Sports using Playwright,
      and the results are summarized and structured via Gemma4:31b on Ollama.
    `,
    icon: <Icon iconNode={football} />,
    component: <CfbPlayerFitSummarizerDemo />,
  },
  {
    key: 'sirenspec-ai-pokemon-battle',
    label: 'AI Pokemon Battle',
    version: 'SirenSpec v0.1.2',
    description: `
      Simulate an AI-powered Pokemon battle. Pick two Pokemon and watch them battle!
      Powered using SirenSpec and OpenAI's gpt-4.1-mini.
    `,
    icon: (
      <Image
        src='/pokeball-icon.png'
        alt='Pokeball'
        width={16}
        height={16}
        style={{ marginLeft: '-3.5px' }}
      />
    ),
    component: <SirenSpecAIPokemonBattleDemo />,
  },
  {
    key: 'sirenspec-grading-factory',
    label: 'Parallel Grading Factory',
    version: 'SirenSpec v0.1.2',
    description: `
      Backed by SirenSpec, this demo grades a batch of papers in parallel.
      One swarm per paper (editor, AI detector, grader) runs in parallel, then
      synthesis into a compiled gradebook.
    `,
    icon: <GraduationCap />,
    component: <SirenSpecGradingFactoryDemo />,
  },
  {
    key: 'sirenspec-compression-gauntlet',
    label: 'Compression Gauntlet',
    version: 'SirenSpec v0.1.2',
    description: `
      Backed by SirenSpec, this demo compresses large documents using multiple
      compression passes through LLMs. The final output is compared to the original
      to measure compression effectiveness. Powered using SirenSpec and Anthropics's 
      haiku-4.5 model.
    `,
    icon: <Shrink />,
    component: <SirenSpecCompressionGauntletDemo />,
  },
]

export function DemosSection() {
  const [activeDemo, setActiveDemo] = useState<DemoKey>(
    'cfb-player-fit-summarizer'
  )
  const posthog = usePostHog()

  const activeDemoConfig = DEMOS.find(d => d.key === activeDemo)

  return (
    <section id='demos' className='container mx-auto px-6 py-20'>
      {/* Header */}
      <div className='text-center mb-16'>
        <h2 className='text-4xl md:text-5xl font-bold mb-6'>
          Interactive Demos
        </h2>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          End-to-end prototypes combining data pipelines, model inference, and
          production-style UIs.
        </p>
      </div>

      {/* Dashboard Shell */}
      <Card className='overflow-hidden'>
        <div className='grid grid-cols-1 md:grid-cols-[260px_1fr] md:min-h-[720px]'>
          {/* Left Navigation */}
          <aside className='border-b md:border-b-0 md:border-r bg-muted/30'>
            <div className='p-2 md:p-4 flex md:block gap-2 overflow-x-auto md:overflow-visible'>
              {DEMOS.map(demo => {
                const isActive = activeDemo === demo.key
                return (
                  <Button
                    key={demo.key}
                    variant={isActive ? 'secondary' : 'ghost'}
                    onClick={() => {
                      posthog?.capture('demo_tab_click', { demo: demo.key, demo_label: demo.label })
                      setActiveDemo(demo.key)
                    }}
                    className='
                      w-full
                      md:w-full
                      h-auto
                      justify-start
                      gap-3
                      items-start
                      py-2 md:py-3
                      text-left
                      whitespace-normal
                    '
                  >
                    {demo.icon}
                    <span className='flex-1 whitespace-normal break-words'>
                      {demo.label}
                    </span>
                  </Button>
                )
              })}
            </div>
          </aside>

          {/* Main Panel */}
          <main className='p-4 md:p-6'>
            <div className='mb-4 flex items-center gap-2'>
              <h3 className='text-2xl font-semibold'>
                {DEMOS.find(d => d.key === activeDemo)?.label}
              </h3>
              {activeDemoConfig?.version && (
                <Badge variant='outline'>{activeDemoConfig?.version}</Badge>
              )}
            </div>

            {activeDemoConfig?.description && (
              <p className='text-muted-foreground mb-6 max-w-xl'>
                {activeDemoConfig?.description}
              </p>
            )}

            {/* Placeholder Content */}
            <Card className='border-dashed py-0'>
              <div className='w-full h-full'>{activeDemoConfig?.component}</div>
            </Card>
          </main>
        </div>
      </Card>
    </section>
  )
}
