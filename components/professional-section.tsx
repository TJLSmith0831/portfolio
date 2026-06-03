'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  MapPin,
  Building,
  Award,
  Users,
  Target,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import experienceData from '../data/experience.json'
import Image from 'next/image'
import { usePostHog } from 'posthog-js/react'

interface Experience {
  title: string
  company: string
  startDate: string
  endDate?: string
  location?: string
  description: string
  responsibilities?: string[]
  keyAchievements?: string[]
  technologies?: string[]
}

interface Certification {
  name: string
  issuer: string
  year: string
  month?: string
  logo: string
  credentialId?: string
  skills?: string[]
  description?: string
}

export function ProfessionalSection() {
  const [activeTab, setActiveTab] = useState<
    'experience' | 'education' | 'skills' | 'certifications'
  >('experience')
  const [certificationPage, setCertificationPage] = useState(1)
  const certificationsPerPage = 6
  const posthog = usePostHog()

  const formatDateRange = (startDate: string, endDate?: string) => {
    if (endDate) {
      return `${startDate} - ${endDate}`
    }
    return `${startDate} - Present`
  }

  const getCertificationLogo = (logo: string) => {
    const logoMap: Record<string, string> = {
      mongodb: '/mongodb-icon-1.svg',
      aws: '/aws-logo.png',
      docker: '/docker-logo.png',
      scrimba: '/scrimba-icon.png',
      tableau: '/tableau-logo.svg',
      microsoft: '/microsoft-logo.svg',
      coursera: '/coursera-logo.png',
      udemy: '/udemy-logo.png',
    }

    const logoSrc = logoMap[logo]

    if (logoSrc) {
      return (
        <Image
          src={logoSrc}
          alt={`${logo} logo`}
          width={32}
          height={32}
          className='h-8 w-8 object-contain'
        />
      )
    }

    return <Award className='h-8 w-8 text-primary' />
  }

  const certifications = experienceData.certifications as Certification[]
  const totalCertificationPages = Math.ceil(
    certifications.length / certificationsPerPage
  )
  const certificationStartIndex =
    (certificationPage - 1) * certificationsPerPage
  const certificationEndIndex = certificationStartIndex + certificationsPerPage
  const currentCertifications = certifications.slice(
    certificationStartIndex,
    certificationEndIndex
  )

  const goToCertificationPage = (page: number) => {
    setCertificationPage(page)
  }

  const goToPrevCertificationPage = () => {
    if (certificationPage > 1) {
      goToCertificationPage(certificationPage - 1)
    }
  }

  const goToNextCertificationPage = () => {
    if (certificationPage < totalCertificationPages) {
      goToCertificationPage(certificationPage + 1)
    }
  }

  const ExperienceCard = ({ experience }: { experience: Experience }) => (
    <Card className='p-6 hover:shadow-lg transition-shadow'>
      <div className='flex flex-col md:flex-row md:items-start md:justify-between mb-4'>
        <div>
          <h3 className='text-xl font-semibold text-foreground mb-1'>
            {experience.title}
          </h3>
          <div className='flex items-center gap-2 text-primary mb-2'>
            <Building className='h-4 w-4' />
            <span className='font-medium'>{experience.company}</span>
          </div>
        </div>
        <div className='flex flex-col gap-1 text-sm text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Calendar className='h-4 w-4' />
            <span>
              {formatDateRange(experience.startDate, experience.endDate)}
            </span>
          </div>
          {experience.location && (
            <div className='flex items-center gap-1'>
              <MapPin className='h-4 w-4' />
              <span>{experience.location}</span>
            </div>
          )}
        </div>
      </div>

      <p className='text-muted-foreground mb-4 leading-relaxed'>
        {experience.description}
      </p>

      {experience.responsibilities && (
        <div className='mb-4'>
          <h4 className='text-sm font-semibold mb-2 flex items-center gap-2'>
            <Target className='h-4 w-4 text-primary' />
            Key Responsibilities
          </h4>
          <ul className='space-y-1 text-sm text-muted-foreground'>
            {experience.responsibilities.map((responsibility, index) => (
              <li key={index} className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0' />
                <span>{responsibility}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {experience.keyAchievements && (
        <div className='mb-4'>
          <h4 className='text-sm font-semibold mb-2 flex items-center gap-2'>
            <Award className='h-4 w-4 text-primary' />
            Key Achievements
          </h4>
          <ul className='space-y-1 text-sm text-muted-foreground'>
            {experience.keyAchievements.map((achievement, index) => (
              <li key={index} className='flex items-start gap-2'>
                <div className='w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0' />
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {experience.technologies && (
        <div>
          <h4 className='text-sm font-semibold mb-2'>Technologies Used</h4>
          <div className='flex flex-wrap gap-2'>
            {experience.technologies.map(tech => (
              <Badge key={tech} variant='secondary' className='text-xs'>
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  )

  return (
    <div className='container mx-auto px-6'>
      <div className='text-center mb-16'>
        <h2 className='text-4xl md:text-5xl font-bold mb-6'>
          Professional Experience
        </h2>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          Building data-driven solutions and modern web applications with
          expertise in full-stack development and data science.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className='flex flex-wrap justify-center gap-2 mb-12'>
        {[
          { key: 'experience', label: 'Experience', icon: Building },
          { key: 'education', label: 'Education', icon: Users },
          { key: 'skills', label: 'Skills', icon: Target },
          {
            key: 'certifications',
            label: 'Certifications & Courses',
            icon: Award,
          },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              posthog?.capture('experience_tab_click', { tab: key })
              setActiveTab(key as typeof activeTab)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon className='h-4 w-4' />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='space-y-8'>
        {activeTab === 'experience' && (
          <div className='space-y-8'>
            {/* Current Position */}
            <div>
              <h3 className='text-2xl font-semibold mb-6 text-primary'>
                Current Role
              </h3>
              <ExperienceCard experience={experienceData.currentPosition} />
            </div>

            {/* Previous Experience */}
            {experienceData.previousExperience.length > 0 && (
              <div>
                <h3 className='text-2xl font-semibold mb-6 text-primary'>
                  Previous Experience
                </h3>
                <div className='space-y-6'>
                  {experienceData.previousExperience.map((exp, index) => (
                    <ExperienceCard key={index} experience={exp} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'education' && (
          <Card className='p-8 max-w-3xl mx-auto'>
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-semibold text-foreground mb-2'>
                {experienceData.education.degree}
              </h3>
              <p className='text-lg text-primary mb-1'>
                Minor: {experienceData.education.minor}
              </p>
              <p className='text-muted-foreground'>
                {experienceData.education.institution} • Class of{' '}
                {experienceData.education.graduationYear} •{' '}
                {experienceData.education.gpa} GPA
              </p>
            </div>

            <div>
              <h4 className='font-semibold mb-4'>Relevant Coursework</h4>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                {experienceData.education.relevantCoursework.map(course => (
                  <Badge
                    key={course}
                    variant='outline'
                    className='justify-center py-2'
                  >
                    {course}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'skills' && (
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Object.entries(experienceData.skills).map(([category, skills]) => (
              <Card key={category} className='p-6'>
                <h3 className='text-lg font-semibold mb-4 capitalize text-primary'>
                  {category === 'datascience'
                    ? 'Data Science'
                    : category === 'ai'
                      ? 'AI & Agents'
                      : category}
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {skills.map(skill => (
                    <Badge key={skill} variant='secondary'>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className='space-y-8'>
            {/* Pagination Controls */}
            {totalCertificationPages > 1 && (
              <div className='flex items-center justify-center gap-4 mb-8'>
                <Button
                  variant='outline'
                  onClick={goToPrevCertificationPage}
                  disabled={certificationPage === 1}
                  className='flex items-center gap-2'
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous
                </Button>

                <div className='flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-md'>
                  <span className='text-sm font-medium'>
                    Page {certificationPage} of {totalCertificationPages}
                  </span>
                </div>

                <Button
                  variant='outline'
                  onClick={goToNextCertificationPage}
                  disabled={certificationPage === totalCertificationPages}
                  className='flex items-center gap-2'
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            )}

            {/* Certifications & Courses Grid */}
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto'>
              {currentCertifications.map((cert, index) => (
                <Card
                  key={index}
                  className='p-6 hover:shadow-lg transition-all duration-300 hover:scale-105'
                >
                  <div className='flex flex-col items-center text-center space-y-4'>
                    {/* Logo */}
                    <div className='flex items-center justify-center'>
                      {getCertificationLogo(cert.logo)}
                    </div>

                    {/* Certification Info */}
                    <div className='space-y-2'>
                      <h3 className='font-semibold text-foreground text-sm leading-tight'>
                        {cert.name}
                      </h3>
                      <p className='text-sm text-primary font-medium'>
                        {cert.issuer}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {cert.month ? `${cert.month} ${cert.year}` : cert.year}
                      </p>
                      {cert.credentialId && (
                        <p className='text-xs text-muted-foreground font-mono'>
                          ID: {cert.credentialId}
                        </p>
                      )}
                    </div>

                    {/* Skills */}
                    {cert.skills && cert.skills.length > 0 && (
                      <div className='flex flex-wrap gap-1 justify-center'>
                        {cert.skills.slice(0, 2).map(skill => (
                          <Badge
                            key={skill}
                            variant='secondary'
                            className='text-xs px-2 py-1'
                          >
                            {skill}
                          </Badge>
                        ))}
                        {cert.skills.length > 2 && (
                          <Badge
                            variant='outline'
                            className='text-xs px-2 py-1'
                          >
                            +{cert.skills.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {cert.description && (
                      <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
                        {cert.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Bottom pagination info */}
            {totalCertificationPages > 1 && (
              <div className='text-center'>
                <p className='text-sm text-muted-foreground'>
                  Page {certificationPage} of {totalCertificationPages} •
                  Showing {certificationStartIndex + 1}-
                  {Math.min(certificationEndIndex, certifications.length)} of{' '}
                  {certifications.length} certifications
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
