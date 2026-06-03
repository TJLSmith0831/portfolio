'use client'

import { useEffect, useRef } from 'react'
import { usePostHog } from 'posthog-js/react'

const SECTIONS = ['hero', 'experience', 'projects', 'demos', 'personal']

export function SectionTracker() {
  const posthog = usePostHog()
  const seen = useRef(new Set<string>())

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const id = entry.target.id
          if (entry.isIntersecting && !seen.current.has(id)) {
            seen.current.add(id)
            posthog?.capture('section_view', { section: id })
          }
        }
      },
      { threshold: 0.3 }
    )

    for (const id of SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [posthog])

  return null
}
