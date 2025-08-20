import { NextRequest } from 'next/server'

// Custom monitoring utilities
export interface PerformanceMetrics {
  endpoint: string
  method: string
  statusCode: number
  duration: number
  timestamp: Date
  userAgent?: string
  ip?: string
}

// In-memory metrics storage for development (replace with real monitoring in production)
const metricsStore: PerformanceMetrics[] = []

export function recordMetric(metric: PerformanceMetrics) {
  metricsStore.push(metric)

  // Keep only the last 1000 metrics to prevent memory leaks
  if (metricsStore.length > 1000) {
    metricsStore.shift()
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[PERF] ${metric.method} ${metric.endpoint} - ${metric.statusCode} - ${metric.duration}ms`
    )
  }
}

export function getMetrics() {
  return metricsStore
}

export function getMetricsSummary() {
  const now = Date.now()
  const lastHour = metricsStore.filter(
    m => now - m.timestamp.getTime() < 3600000
  )

  const summary = {
    total: metricsStore.length,
    lastHour: lastHour.length,
    averageDuration:
      lastHour.reduce((sum, m) => sum + m.duration, 0) / lastHour.length || 0,
    errorRate:
      lastHour.filter(m => m.statusCode >= 400).length / lastHour.length || 0,
    endpoints: [...new Set(lastHour.map(m => `${m.method} ${m.endpoint}`))],
  }

  return summary
}

// Middleware helper for API routes
export function withMonitoring<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>,
  endpoint: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    let statusCode = 200

    try {
      const result = await handler(...args)
      return result
    } catch (error) {
      statusCode = 500
      throw error
    } finally {
      const duration = Date.now() - startTime
      const request = args[0] as NextRequest

      recordMetric({
        endpoint,
        method: request?.method || 'UNKNOWN',
        statusCode,
        duration,
        timestamp: new Date(),
        userAgent: request?.headers?.get('user-agent') || undefined,
        ip:
          request?.headers?.get('x-forwarded-for') ||
          request?.headers?.get('x-real-ip') ||
          undefined,
      })
    }
  }
}
