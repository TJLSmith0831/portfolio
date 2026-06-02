'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  Github,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react'
import projectData from '../data/projects.json'

interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  features?: string[]
  status: string
  repository?: string
  image?: string
  deployed?: boolean
  hasDemo?: boolean
  liveUrl?: string
  publication?: string
  type?: string
  myContribution: string
  date: string
}

export function ProjectsSection() {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 6

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
    const allProjects = [
      ...projectData.featured,
      ...(projectData.openSource || []),
      ...(projectData.sideProjects || []),
    ]
    return allProjects
  }

  const allProjects: Project[] = getAllProjects()
  const totalPages = Math.ceil(allProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const endIndex = startIndex + projectsPerPage
  const currentProjects = allProjects.slice(startIndex, endIndex)
  const expandedProject = expandedCard
    ? (allProjects.find(p => p.id === expandedCard) as Project)
    : null

  const goToPage = (page: number) => {
    setCurrentPage(page)
    setFlippedCards(new Set()) // Reset flipped cards when changing pages
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  return (
    <div className='container mx-auto px-6'>
      <div className='text-center mb-16'>
        <h2 className='text-4xl md:text-5xl font-bold mb-6'>
          Projects & Articles
        </h2>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          A collection of personal projects and technical articles showcasing
          expertise in full-stack development, AI/ML, and data science.
        </p>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-4 mb-8'>
          <Button
            variant='outline'
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className='flex items-center gap-2'
          >
            <ChevronLeft className='h-4 w-4' />
            Previous
          </Button>

          <div className='flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-md'>
            <span className='text-sm font-medium'>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <Button
            variant='outline'
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className='flex items-center gap-2'
          >
            Next
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}

      {/* Projects Grid */}
      <div className='mb-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {currentProjects.map((project: Project, index) => (
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
                      src={
                        project.image ||
                        getProjectImage(project, startIndex + index)
                      }
                      alt={project.name}
                      className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />

                    {/* Status badge */}
                    <div className='absolute top-3 right-3'>
                      <Badge
                        variant={getStatusBadgeVariant(project.status)}
                        className='text-xs'
                      >
                        {project.status}
                      </Badge>
                    </div>

                    {/* Project type indicator */}
                    {'type' in project &&
                      project.type === 'Technical Article' && (
                        <div className='absolute top-3 left-3'>
                          <Badge
                            variant='outline'
                            className='text-xs bg-white/90 text-black'
                          >
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
                        <Badge
                          key={tech}
                          variant='secondary'
                          className='text-xs'
                        >
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
                <Card className='absolute inset-0 backface-hidden rotate-y-180 p-4 flex flex-col'>
                  <div className='flex items-start justify-between mb-3'>
                    <h3 className='font-semibold text-lg leading-tight flex-1'>
                      {project.name}
                    </h3>
                    <Badge
                      variant={getStatusBadgeVariant(project.status)}
                      className='text-xs ml-2'
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <div className='flex-1 overflow-y-auto mb-3 min-h-0'>
                    <p className='text-sm text-muted-foreground mb-3 leading-relaxed'>
                      {project.description}
                    </p>
                    {project.features && (
                      <div className='space-y-1.5'>
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
                  <div className='flex-shrink-0 space-y-2'>
                    <div className='flex gap-2'>
                      {project.liveUrl && (
                        <Button size='sm' className='flex-1' asChild>
                          <a
                            href={project.liveUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {'type' in project &&
                            project.type === 'Technical Article' ? (
                              <>
                                <FileText className='w-3 h-3 mr-1' />
                                Read
                              </>
                            ) : (
                              <>
                                <ExternalLink className='w-3 h-3 mr-1' />
                                Visit Site
                              </>
                            )}
                          </a>
                        </Button>
                      )}
                      {project.hasDemo && (
                        <Button size='sm' className='flex-1' asChild>
                          <a href={'#demos'}>
                            {'hasDemo' in project && project.hasDemo && (
                              <>
                                <Play className='w-3 h-3 mr-1' />
                                See Demo
                              </>
                            )}
                          </a>
                        </Button>
                      )}

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
      </div>

      {/* Page Indicator */}
      {totalPages > 1 && (
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <div
                key={page}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentPage === page ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages} • Showing {startIndex + 1}-
            {Math.min(endIndex, allProjects.length)} of {allProjects.length}{' '}
            projects
          </p>
        </div>
      )}

      {/* Expanded card modal */}
      {expandedCard && expandedProject && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          onClick={closeExpanded}
        >
          <Card
            className='max-w-2xl w-full max-h-[80vh] overflow-y-auto'
            onClick={e => e.stopPropagation()}
          >
            <div className='p-6'>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h3 className='text-2xl font-bold mb-2'>
                    {expandedProject.name}
                  </h3>
                  <div className='flex items-center gap-2 mb-2'>
                    <Badge
                      variant={getStatusBadgeVariant(expandedProject.status)}
                    >
                      {expandedProject.status}
                    </Badge>
                    {expandedProject?.publication &&
                      typeof expandedProject.publication === 'string' && (
                        <Badge variant='outline'>
                          {expandedProject.publication}
                        </Badge>
                      )}
                  </div>
                </div>
                <Button variant='ghost' size='icon' onClick={closeExpanded}>
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <img
                src={
                  'image' in expandedProject &&
                  expandedProject.image &&
                  typeof expandedProject.image === 'string'
                    ? expandedProject.image
                    : getProjectImage(
                        expandedProject,
                        allProjects.indexOf(expandedProject)
                      )
                }
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
                {expandedProject.liveUrl && (
                  <Button className='flex-1' asChild>
                    <a
                      href={expandedProject.liveUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {'type' in expandedProject &&
                      expandedProject.type === 'Technical Article' ? (
                        <>
                          <FileText className='w-4 h-4 mr-2' />
                          Read Article
                        </>
                      ) : (
                        <>
                          <ExternalLink className='w-4 h-4 mr-2' />
                          Visit Site
                        </>
                      )}
                    </a>
                  </Button>
                )}
                {expandedProject.hasDemo && (
                  <Button className='flex-1' asChild onClick={closeExpanded}>
                    <a href={'#demos'}>
                      {'type' in expandedProject &&
                      expandedProject.type === 'Technical Article' ? (
                        <>
                          <FileText className='w-4 h-4 mr-2' />
                          Read Article
                        </>
                      ) : (
                        <>
                          <Play className='w-4 h-4 mr-2' />
                          See Demo
                        </>
                      )}
                    </a>
                  </Button>
                )}
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
