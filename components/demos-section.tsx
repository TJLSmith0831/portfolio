'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { football } from '@lucide/lab'
import { Icon } from 'lucide-react'
import { useState } from 'react'
import { CfbPlayerFitSummarizerDemo } from './demos/cfb-player-fit-summarizer'

type DemoKey = 'cfb-player-fit-summarizer'

interface DemoConfig {
  key: DemoKey
  label: string
  description: string
  version: string
  icon: React.ReactNode
  component: React.ReactNode
}

const DEMOS: DemoConfig[] = [
  {
    key: 'cfb-player-fit-summarizer',
    label: 'College Football Player Fit Summarizer',
    version: 'v0.2.0',
    description: `
      Full-stack system that scrapes recruiting data and performs model-driven
      player-to-program fit evaluation through an interactive UI.
      (Runs on a 4 GB CPU-only instance; evaluations should take less than 2 minutes)
    `,
    icon: <Icon iconNode={football} />,
    component: <CfbPlayerFitSummarizerDemo />,
  },
]

export function DemosSection() {
  const [activeDemo, setActiveDemo] = useState<DemoKey>(
    'cfb-player-fit-summarizer'
  )

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
                    onClick={() => setActiveDemo(demo.key)}
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
              <Badge variant='outline'>{activeDemoConfig?.version}</Badge>
            </div>

            <p className='text-muted-foreground mb-6 max-w-xl'>
              {DEMOS.find(d => d.key === activeDemo)?.description}
            </p>

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
