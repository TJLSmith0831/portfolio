'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Building, Award, Users, Target } from 'lucide-react'
import experienceData from '../data/experience.json'

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

export function ProfessionalSection() {
  const [activeTab, setActiveTab] = useState<
    'experience' | 'education' | 'skills' | 'certifications'
  >('experience')

  const formatDateRange = (startDate: string, endDate?: string) => {
    if (endDate) {
      return `${startDate} - ${endDate}`
    }
    return `${startDate} - Present`
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
          { key: 'certifications', label: 'Certifications', icon: Award },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
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
                  {category === 'datascience' ? 'Data Science' : category}
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
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto'>
            {experienceData.certifications.map((cert, index) => (
              <Card
                key={index}
                className='p-6 text-center hover:shadow-lg transition-shadow'
              >
                <Award className='h-8 w-8 text-primary mx-auto mb-3' />
                <h3 className='font-semibold text-foreground mb-2'>
                  {cert.name}
                </h3>
                <p className='text-sm text-primary mb-1'>{cert.issuer}</p>
                <p className='text-xs text-muted-foreground'>{cert.year}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
