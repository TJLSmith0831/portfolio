import { NextRequest } from 'next/server'
import { getMetrics, getMetricsSummary } from '@/lib/monitoring'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const format = url.searchParams.get('format')

    if (format === 'summary') {
      const summary = getMetricsSummary()
      return Response.json({
        success: true,
        summary,
        timestamp: new Date().toISOString(),
      })
    }

    const metrics = getMetrics()
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const recentMetrics = metrics.slice(-limit)

    return Response.json({
      success: true,
      metrics: recentMetrics,
      total: metrics.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Monitoring API error:', error)
    return Response.json(
      {
        success: false,
        error: 'Failed to retrieve monitoring data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
