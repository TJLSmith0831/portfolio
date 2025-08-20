'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Github, X, FileText } from 'lucide-react'
import projectData from '../data/projects.json'

interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  features?: string[]
  status: string
  repository: string
  deployed?: boolean
  liveUrl?: string
  publication?: string
  type?: string
  myContribution: string
}


export function ProjectsSection() {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const toggleFlip = (id: string) => {
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

  const expandCard = (id: string) => {
    setExpandedCard(id)
  }

  const closeExpanded = () => {
    setExpandedCard(null)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'published':
        return 'default'
      case 'in progress':
        return 'secondary'
      case 'archived':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getProjectImage = (project: Project, index: number) => {
    if ('type' in project && project.type === 'Technical Article') {
      return `https://via.placeholder.com/600x400/059669/ffffff?text=${encodeURIComponent('Medium Article')}`
    }
    return `https://picsum.photos/600/400?random=${index + 10}`
  }

  const getAllProjects = () => {
    return [
      ...projectData.featured,
      ...(projectData.sideProjects || []),
      ...(projectData.openSource || [])
    ]
  }

  const allProjects = getAllProjects()
  const expandedProject = expandedCard ? allProjects.find(p => p.id === expandedCard) : null

  return (
    <div className='container mx-auto px-6'>
      <div className='text-center mb-16'>
        <h2 className='text-4xl md:text-5xl font-bold mb-6'>Projects & Articles</h2>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          A collection of personal projects and technical articles showcasing expertise in full-stack development, AI/ML, and data science.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
        {allProjects.map((project, index) => (
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
                    src={getProjectImage(project, index)}
                    alt={project.name}
                    className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                  
                  {/* Status badge */}
                  <div className='absolute top-3 right-3'>
                    <Badge variant={getStatusBadgeVariant(project.status)} className='text-xs'>
                      {project.status}
                    </Badge>
                  </div>

                  {/* Project type indicator */}
                  {'type' in project && project.type === 'Technical Article' && (
                    <div className='absolute top-3 left-3'>
                      <Badge variant='outline' className='text-xs bg-white/90 text-black'>
                        <FileText className='w-3 h-3 mr-1' />
                        Article
                      </Badge>
                    </div>
                  )}

                  <h3 className='absolute bottom-4 left-4 right-4 text-white font-semibold text-lg leading-tight'>
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
              <Card className='absolute inset-0 backface-hidden rotate-y-180 p-6 flex flex-col'>
                <div className='flex items-start justify-between mb-3'>
                  <h3 className='font-semibold text-lg leading-tight flex-1'>{project.name}</h3>
                  <Badge variant={getStatusBadgeVariant(project.status)} className='text-xs ml-2'>
                    {project.status}
                  </Badge>
                </div>
                
                {'publication' in project && (project as any).publication && (
                  <p className='text-xs text-primary mb-2 font-medium'>{(project as any).publication}</p>
                )}
                
                <div className='flex-1 overflow-y-auto mb-4'>
                  <p className='text-sm text-muted-foreground mb-4 leading-relaxed'>
                    {project.description}
                  </p>
                  {project.features && (
                    <div className='space-y-2'>
                      {project.features.map(feature => (
                        <div
                          key={feature}
                          className='text-xs text-muted-foreground flex items-start'
                        >
                          <div className='w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0 mt-1.5' />
                          <span className='leading-relaxed'>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className='space-y-2'>
                  <div className='flex gap-2'>
                    <Button size='sm' className='flex-1' asChild>
                      <a
                        href={project.liveUrl || project.repository}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {'type' in project && project.type === 'Technical Article' ? (
                          <>
                            <FileText className='w-3 h-3 mr-1' />
                            Read
                          </>
                        ) : (
                          <>
                            <ExternalLink className='w-3 h-3 mr-1' />
                            Live
                          </>
                        )}
                      </a>
                    </Button>
                    {project.repository !== 'Private' && (
                      <Button
                        size='sm'
                        variant='outline'
                        className='flex-1 bg-transparent'
                        asChild
                      >
                        <a
                          href={project.repository}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <Github className='w-3 h-3 mr-1' />
                          Code
                        </a>
                      </Button>
                    )}
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
      {expandedCard && expandedProject && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <Card className='max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h3 className='text-2xl font-bold mb-2'>{expandedProject.name}</h3>
                  <div className='flex items-center gap-2 mb-2'>
                    <Badge variant={getStatusBadgeVariant(expandedProject.status)}>
                      {expandedProject.status}
                    </Badge>
                    {'publication' in expandedProject && (expandedProject as any).publication && (
                      <Badge variant='outline'>{(expandedProject as any).publication}</Badge>
                    )}
                  </div>
                </div>
                <Button variant='ghost' size='icon' onClick={closeExpanded}>
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <img
                src={getProjectImage(expandedProject, allProjects.indexOf(expandedProject))}
                alt={expandedProject.name}
                className='w-full h-64 object-cover rounded-lg mb-6'
              />

              <p className='text-muted-foreground mb-6 leading-relaxed'>
                {expandedProject.myContribution}
              </p>

              <div className='space-y-4'>
                <div>
                  <h4 className='font-semibold mb-2'>Technologies Used</h4>
                  <div className='flex flex-wrap gap-2'>
                    {expandedProject.technologies.map(tech => (
                      <Badge key={tech} variant='secondary'>
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {expandedProject.features && (
                  <div>
                    <h4 className='font-semibold mb-2'>Key Features</h4>
                    <ul className='space-y-1'>
                      {expandedProject.features.map(feature => (
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
                )}
              </div>

              <div className='flex gap-4 mt-6'>
                <Button className='flex-1' asChild>
                  <a
                    href={expandedProject.liveUrl || expandedProject.repository}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {'type' in expandedProject && expandedProject.type === 'Technical Article' ? (
                      <>
                        <FileText className='w-4 h-4 mr-2' />
                        Read Article
                      </>
                    ) : (
                      <>
                        <ExternalLink className='w-4 h-4 mr-2' />
                        View Live Project
                      </>
                    )}
                  </a>
                </Button>
                {expandedProject.repository !== 'Private' && (
                  <Button
                    variant='outline'
                    className='flex-1 bg-transparent'
                    asChild
                  >
                    <a
                      href={expandedProject.repository}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Github className='w-4 h-4 mr-2' />
                      View Source Code
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}