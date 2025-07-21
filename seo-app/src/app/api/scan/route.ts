import { NextRequest, NextResponse } from 'next/server'
import { SEOAnalyzer } from '@/lib/seo-analyzer'
import { normalizeUrl, validateUrl } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    if (!validateUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const normalizedUrl = normalizeUrl(url)

    // Perform SEO analysis
    const analysis = await SEOAnalyzer.analyze(normalizedUrl)

    return NextResponse.json({
      success: true,
      data: analysis
    })

  } catch (error) {
    console.error('SEO analysis error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'SEO Scanner API - Use POST to analyze a URL' },
    { status: 200 }
  )
}
