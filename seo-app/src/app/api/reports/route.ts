import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { SEOAnalysis } from '@/types/seo'

export async function POST(request: NextRequest) {
  try {
    const { analysis, userId } = await request.json()

    if (!analysis || !userId) {
      return NextResponse.json(
        { error: 'Analysis data and user ID are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Check if user exists and get their current usage
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check daily scan limits for free users
    const today = new Date().toISOString().split('T')[0]
    if (profile.subscription_tier === 'free') {
      if (profile.last_scan_date === today && profile.daily_scans_used >= 3) {
        return NextResponse.json(
          { 
            error: 'Daily scan limit reached',
            message: 'Free users are limited to 3 scans per day. Upgrade to Pro for unlimited scans.',
            upgradeRequired: true
          },
          { status: 429 }
        )
      }
    }

    // Save the scan report
    const { data: report, error: reportError } = await supabase
      .from('scan_reports')
      .insert({
        user_id: userId,
        url: analysis.url,
        analysis_data: analysis,
        overall_score: analysis.overallScore
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error saving report:', reportError)
      return NextResponse.json(
        { error: 'Failed to save report' },
        { status: 500 }
      )
    }

    // Update user's scan usage
    const newDailyScanCount = profile.last_scan_date === today 
      ? profile.daily_scans_used + 1 
      : 1

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        daily_scans_used: newDailyScanCount,
        last_scan_date: today
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user usage:', updateError)
    }

    // Log usage analytics
    const { error: logError } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        action: 'scan',
        details: {
          url: analysis.url,
          score: analysis.overallScore,
          report_id: report.id
        }
      })

    if (logError) {
      console.error('Error logging usage:', logError)
    }

    return NextResponse.json({
      success: true,
      report,
      usage: {
        daily_scans_used: newDailyScanCount,
        daily_limit: profile.subscription_tier === 'free' ? 3 : -1,
        subscription_tier: profile.subscription_tier
      }
    })

  } catch (error) {
    console.error('Report saving error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to save report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    const { data: reports, error } = await supabase
      .from('scan_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reports
    })

  } catch (error) {
    console.error('Report fetching error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
