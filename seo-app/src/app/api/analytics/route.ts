import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeframe = searchParams.get('timeframe') || '30d'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get scan count for the period
    const { data: scanLogs, error: scanError } = await supabase
      .from('usage_logs')
      .select('created_at, details')
      .eq('user_id', userId)
      .eq('action', 'scan')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (scanError) {
      console.error('Error fetching scan logs:', scanError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }

    // Get all scan reports for score analysis
    const { data: reports, error: reportsError } = await supabase
      .from('scan_reports')
      .select('overall_score, created_at, url')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (reportsError) {
      console.error('Error fetching reports:', reportsError)
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      )
    }

    // Process analytics data
    const dailyScans = scanLogs.reduce((acc: { [key: string]: number }, log) => {
      const date = log.created_at.split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Calculate average score
    const averageScore = reports.length > 0 
      ? Math.round(reports.reduce((sum, report) => sum + report.overall_score, 0) / reports.length)
      : 0

    // Find most scanned domains
    const domainCounts = reports.reduce((acc: { [key: string]: number }, report) => {
      try {
        const domain = new URL(report.url).hostname
        acc[domain] = (acc[domain] || 0) + 1
      } catch {
        // Invalid URL, skip
      }
      return acc
    }, {})

    const topDomains = Object.entries(domainCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }))

    // Score distribution
    const scoreRanges = {
      excellent: reports.filter(r => r.overall_score >= 90).length,
      good: reports.filter(r => r.overall_score >= 70 && r.overall_score < 90).length,
      fair: reports.filter(r => r.overall_score >= 50 && r.overall_score < 70).length,
      poor: reports.filter(r => r.overall_score < 50).length,
    }

    return NextResponse.json({
      success: true,
      analytics: {
        totalScans: scanLogs.length,
        averageScore,
        dailyScans,
        topDomains,
        scoreDistribution: scoreRanges,
        timeframe,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Analytics error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
