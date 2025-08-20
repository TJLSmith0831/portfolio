'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Github, X } from 'lucide-react'

const projects = [
  {
    id: 1,
    name: 'Personal Portfolio Website',
    image: 'https://via.placeholder.com/600x400/3b82f6/ffffff?text=Portfolio+Website',
    description:
      'A modern, responsive portfolio website built with Next.js 15, featuring dark/light mode, smooth animations, and a clean design system.',
    technologies: ['Next.js 15', 'React', 'TypeScript', 'Tailwind CSS'],
    features: [
      'App Router architecture',
      'Dark/light mode toggle',
      'Responsive design',
      'Smooth scrolling navigation',
    ],
    liveUrl: 'https://portfolio.tristansmith.dev',
    githubUrl: '#',
    details:
      'Built a comprehensive portfolio website showcasing professional work and personal projects with optimized performance and accessibility. Features App Router architecture with Next.js 15, dark/light mode with system preference detection, responsive design with mobile-first approach, smooth scrolling navigation, animated background effects, component-based architecture with shadcn/ui, TypeScript for type safety, and performance optimization with Turbopack.',
  },
  {
    id: 2,
    name: 'AI-Powered Portfolio Assistant',
    image: 'https://via.placeholder.com/600x400/10b981/ffffff?text=AI+Assistant',
    description:
      'An intelligent chat interface integrated into portfolio website that provides context-aware responses about professional background.',
    technologies: ['OpenAI GPT-3.5-turbo', 'Vercel AI SDK', 'Nodemailer', 'Next.js'],
    features: [
      'Streaming AI responses',
      'Context-aware answers',
      'Message validation',
      'Rate limiting',
    ],
    liveUrl: 'https://portfolio.tristansmith.dev',
    githubUrl: '#',
    details:
      'Developed an AI-powered chat interface with streaming responses, context-aware answers from personal data files, message validation and email forwarding system, rate limiting with Vercel KV for abuse prevention, professional styling matching portfolio design, mobile-responsive interface, and session-based conversation history. Solo developer - architected AI integration, designed chat interface, implemented email gateway with validation logic.',
  },
  {
    id: 3,
    name: 'Tenet App',
    image: 'https://via.placeholder.com/600x400/f59e0b/ffffff?text=Tenet+App',
    description:
      'A mobile-first social opinion platform for structured, intentional discourse built to facilitate meaningful conversations.',
    technologies: ['React Native', 'Redux', 'Firebase', 'TypeScript'],
    features: [
      'Mobile-first design',
      'Structured debates',
      'Real-time interaction',
      'Cross-platform support',
    ],
    liveUrl: '#',
    githubUrl: 'https://github.com/TJLSmith0831/tenet-app',
    details:
      'Architected and developed a mobile-first social platform with structured debate and discussion format, real-time social interaction, Firebase backend integration, Redux state management, and cross-platform mobile support. Full-stack development - architected mobile-first social platform, implemented Redux state management, integrated Firebase backend.',
  },
  {
    id: 4,
    name: 'PraetorAI',
    image: 'https://via.placeholder.com/600x400/8b5cf6/ffffff?text=PraetorAI',
    description:
      'An AI-first project management and productivity platform designed to enhance team collaboration and project efficiency through intelligent automation.',
    technologies: ['TypeScript', 'Python', 'AI/ML', 'React'],
    features: [
      'AI-powered management',
      'Intelligent automation',
      'Team collaboration',
      'Productivity analytics',
    ],
    liveUrl: '#',
    githubUrl: 'https://github.com/TJLSmith0831/praetor-ai',
    details:
      'Designed and implemented an AI-first project management platform with intelligent task automation, team collaboration tools, productivity analytics, modern responsive UI, and machine learning integration. Lead developer - designed AI-first architecture, implemented ML features, built modern TypeScript/React frontend.',
  },
  {
    id: 5,
    name: 'ParaLlama',
    image: 'https://via.placeholder.com/600x400/06b6d4/ffffff?text=ParaLlama',
    description:
      'A TypeScript framework designed for parallel processing and distributed computing tasks, optimized for performance and scalability.',
    technologies: ['TypeScript', 'Node.js', 'Parallel Processing'],
    features: [
      'Parallel processing',
      'TypeScript-first design',
      'Distributed computing',
      'Performance optimization',
    ],
    liveUrl: 'https://github.com/TJLSmith0831/ParaLlama',
    githubUrl: 'https://github.com/TJLSmith0831/ParaLlama',
    details:
      'Created a comprehensive TypeScript parallel processing framework with distributed computing support, performance optimization, scalable architecture, and developer-friendly API. Solo developer - created TypeScript parallel processing framework, designed scalable distributed computing architecture.',
  },
  {
    id: 6,
    name: 'NBA Prediction Models',
    image: 'https://via.placeholder.com/600x400/ef4444/ffffff?text=NBA+Prediction',
    description:
      'A collection of machine learning projects for NBA analytics including salary valuation, game predictions, and championship forecasting.',
    technologies: ['Python', 'Jupyter Notebook', 'Machine Learning', 'scikit-learn'],
    features: [
      'Salary valuation models',
      'Game predictions',
      'Championship forecasting',
      'Statistical modeling',
    ],
    liveUrl: '#',
    githubUrl: 'https://github.com/TJLSmith0831/NBA2020Prediction',
    details:
      'Developed comprehensive machine learning models for NBA analytics with salary valuation algorithms, game outcome predictions, championship forecasting using statistical modeling, and performance analysis dashboards. Solo developer - designed ML models, performed statistical analysis, created prediction algorithms for NBA outcomes.',
  },
]

export function WorkSection() {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const expandCard = (id: number) => {
    setExpandedCard(id)
  }

  const closeExpanded = () => {
    setExpandedCard(null)
  }

  return (
    <div className='container mx-auto px-6'>
      <div className='text-center mb-16'>
        <h2 className='text-4xl md:text-5xl font-bold mb-6'>Featured Work</h2>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          A collection of projects showcasing my expertise in full-stack
          development, from concept to deployment.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
        {projects.map(project => (
          <div key={project.id} className='relative group'>
            <div
              className={`relative w-full h-80 cursor-pointer transition-transform duration-600 preserve-3d ${
                flippedCards.has(project.id) ? 'rotate-y-180' : ''
              }`}
              onClick={() => toggleFlip(project.id)}
            >
              {/* Front of card */}
              <Card className='absolute inset-0 backface-hidden overflow-hidden group-hover:-translate-y-2 transition-transform duration-300'>
                <div className='relative h-48 overflow-hidden'>
                  <img
                    src={project.image || '/placeholder.svg'}
                    alt={project.name}
                    className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                  <h3 className='absolute bottom-4 left-4 text-white font-semibold text-lg'>
                    {project.name}
                  </h3>
                </div>
                <div className='p-4'>
                  <div className='flex flex-wrap gap-2'>
                    {project.technologies.slice(0, 3).map(tech => (
                      <Badge key={tech} variant='secondary' className='text-xs'>
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant='outline' className='text-xs'>
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>

              {/* Back of card */}
              <Card className='absolute inset-0 backface-hidden rotate-y-180 p-6 flex flex-col justify-between'>
                <div>
                  <h3 className='font-semibold text-lg mb-3'>{project.name}</h3>
                  <p className='text-sm text-muted-foreground mb-4 leading-relaxed'>
                    {project.description}
                  </p>
                  <div className='space-y-2 mb-4'>
                    {project.features.map(feature => (
                      <div
                        key={feature}
                        className='text-xs text-muted-foreground flex items-center'
                      >
                        <div className='w-1 h-1 bg-primary rounded-full mr-2' />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='flex gap-2'>
                    <Button size='sm' className='flex-1' asChild>
                      <a
                        href={project.liveUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <ExternalLink className='w-3 h-3 mr-1' />
                        Live
                      </a>
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1 bg-transparent'
                      asChild
                    >
                      <a
                        href={project.githubUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Github className='w-3 h-3 mr-1' />
                        Code
                      </a>
                    </Button>
                  </div>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='w-full text-xs'
                    onClick={e => {
                      e.stopPropagation()
                      expandCard(project.id)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded card modal */}
      {expandedCard && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <Card className='max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-start mb-4'>
                <h3 className='text-2xl font-bold'>
                  {projects.find(p => p.id === expandedCard)?.name}
                </h3>
                <Button variant='ghost' size='icon' onClick={closeExpanded}>
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <img
                src={
                  projects.find(p => p.id === expandedCard)?.image ||
                  '/placeholder.svg'
                }
                alt={projects.find(p => p.id === expandedCard)?.name}
                className='w-full h-64 object-cover rounded-lg mb-6'
              />

              <p className='text-muted-foreground mb-6 leading-relaxed'>
                {projects.find(p => p.id === expandedCard)?.details}
              </p>

              <div className='space-y-4'>
                <div>
                  <h4 className='font-semibold mb-2'>Technologies Used</h4>
                  <div className='flex flex-wrap gap-2'>
                    {projects
                      .find(p => p.id === expandedCard)
                      ?.technologies.map(tech => (
                        <Badge key={tech} variant='secondary'>
                          {tech}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold mb-2'>Key Features</h4>
                  <ul className='space-y-1'>
                    {projects
                      .find(p => p.id === expandedCard)
                      ?.features.map(feature => (
                        <li
                          key={feature}
                          className='text-sm text-muted-foreground flex items-center'
                        >
                          <div className='w-1 h-1 bg-primary rounded-full mr-3' />
                          {feature}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className='flex gap-4 mt-6'>
                <Button className='flex-1' asChild>
                  <a
                    href={projects.find(p => p.id === expandedCard)?.liveUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <ExternalLink className='w-4 h-4 mr-2' />
                    View Live Project
                  </a>
                </Button>
                <Button
                  variant='outline'
                  className='flex-1 bg-transparent'
                  asChild
                >
                  <a
                    href={projects.find(p => p.id === expandedCard)?.githubUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Github className='w-4 h-4 mr-2' />
                    View Source Code
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
