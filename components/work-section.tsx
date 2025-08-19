"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, X } from "lucide-react"

const projects = [
  {
    id: 1,
    name: "E-Commerce Platform",
    image: "/modern-ecommerce-dashboard.png",
    description: "A full-stack e-commerce solution with real-time inventory management and payment processing.",
    technologies: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"],
    features: ["Real-time inventory", "Payment processing", "Admin dashboard", "Mobile responsive"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    details:
      "Built a comprehensive e-commerce platform handling 10k+ products with real-time inventory tracking, secure payment processing via Stripe, and an intuitive admin dashboard. Implemented advanced search and filtering capabilities.",
  },
  {
    id: 2,
    name: "Task Management App",
    image: "/task-management-app.png",
    description: "Collaborative task management tool with real-time updates and team collaboration features.",
    technologies: ["React", "Node.js", "Socket.io", "MongoDB"],
    features: ["Real-time collaboration", "Drag & drop", "Team management", "Progress tracking"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    details:
      "Developed a collaborative task management application supporting real-time updates, drag-and-drop functionality, and team collaboration. Features include project timelines, progress tracking, and notification systems.",
  },
  {
    id: 3,
    name: "Weather Analytics Dashboard",
    image: "/weather-analytics-dashboard.png",
    description: "Interactive weather data visualization with historical trends and forecasting capabilities.",
    technologies: ["Vue.js", "D3.js", "Python", "FastAPI"],
    features: ["Data visualization", "Historical analysis", "API integration", "Responsive charts"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    details:
      "Created an interactive weather analytics dashboard featuring historical data analysis, trend visualization, and forecasting capabilities. Integrated multiple weather APIs and implemented custom data processing algorithms.",
  },
  {
    id: 4,
    name: "Social Media Platform",
    image: "/social-media-interface.png",
    description: "Modern social networking platform with real-time messaging and content sharing.",
    technologies: ["React Native", "GraphQL", "AWS", "Redis"],
    features: ["Real-time messaging", "Content sharing", "User profiles", "Push notifications"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    details:
      "Built a full-featured social media platform with real-time messaging, content sharing, and user interaction features. Implemented scalable architecture using microservices and cloud infrastructure.",
  },
  {
    id: 5,
    name: "AI-Powered Analytics Tool",
    image: "/ai-analytics-dashboard.png",
    description: "Machine learning-powered analytics platform for business intelligence and data insights.",
    technologies: ["Python", "TensorFlow", "React", "Docker"],
    features: ["ML predictions", "Data visualization", "Custom reports", "API integration"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    details:
      "Developed an AI-powered analytics platform leveraging machine learning for predictive insights. Features include custom report generation, automated data processing, and interactive visualizations.",
  },
  {
    id: 6,
    name: "Fitness Tracking App",
    image: "/fitness-tracking-app.png",
    description: "Comprehensive fitness tracking application with workout planning and progress monitoring.",
    technologies: ["Flutter", "Firebase", "Node.js", "PostgreSQL"],
    features: ["Workout tracking", "Progress analytics", "Social features", "Offline support"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    details:
      "Created a comprehensive fitness tracking application with workout planning, progress monitoring, and social features. Implemented offline support and synchronization capabilities for seamless user experience.",
  },
]

export function WorkSection() {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => {
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
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Featured Work</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A collection of projects showcasing my expertise in full-stack development, from concept to deployment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {projects.map((project) => (
          <div key={project.id} className="relative group">
            <div
              className={`relative w-full h-80 cursor-pointer transition-transform duration-600 preserve-3d ${
                flippedCards.has(project.id) ? "rotate-y-180" : ""
              }`}
              onClick={() => toggleFlip(project.id)}
            >
              {/* Front of card */}
              <Card className="absolute inset-0 backface-hidden overflow-hidden group-hover:-translate-y-2 transition-transform duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-white font-semibold text-lg">{project.name}</h3>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>

              {/* Back of card */}
              <Card className="absolute inset-0 backface-hidden rotate-y-180 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-3">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{project.description}</p>
                  <div className="space-y-2 mb-4">
                    {project.features.map((feature) => (
                      <div key={feature} className="text-xs text-muted-foreground flex items-center">
                        <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Live
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-3 h-3 mr-1" />
                        Code
                      </a>
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={(e) => {
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">{projects.find((p) => p.id === expandedCard)?.name}</h3>
                <Button variant="ghost" size="icon" onClick={closeExpanded}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <img
                src={projects.find((p) => p.id === expandedCard)?.image || "/placeholder.svg"}
                alt={projects.find((p) => p.id === expandedCard)?.name}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {projects.find((p) => p.id === expandedCard)?.details}
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {projects
                      .find((p) => p.id === expandedCard)
                      ?.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <ul className="space-y-1">
                    {projects
                      .find((p) => p.id === expandedCard)
                      ?.features.map((feature) => (
                        <li key={feature} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-1 h-1 bg-primary rounded-full mr-3" />
                          {feature}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button className="flex-1" asChild>
                  <a
                    href={projects.find((p) => p.id === expandedCard)?.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live Project
                  </a>
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" asChild>
                  <a
                    href={projects.find((p) => p.id === expandedCard)?.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" />
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
