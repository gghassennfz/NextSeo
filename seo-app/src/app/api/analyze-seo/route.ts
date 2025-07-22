import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import axios from 'axios'

interface SEOAnalysis {
  url: string
  title?: string
  description?: string
  keywords?: string[]
  h1Tags?: string[]
  h2Tags?: string[]
  h3Tags?: string[]
  images?: { src: string; alt: string }[]
  links?: { href: string; text: string; type: 'internal' | 'external' }[]
  issues?: string[]
  recommendations?: string[]
  metaKeywords?: string
  canonicalUrl?: string
  robots?: string
  openGraph?: {
    title?: string
    description?: string
    image?: string
    type?: string
  }
  twitterCard?: {
    title?: string
    description?: string
    image?: string
  }
  structuredData?: any[]
  loadTime?: number
  wordCount?: number
  readabilityScore?: number
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function analyzeContent($: cheerio.CheerioAPI, url: string): SEOAnalysis {
  const analysis: SEOAnalysis = {
    url,
    issues: [],
    recommendations: [],
    images: [],
    links: [],
    h1Tags: [],
    h2Tags: [],
    h3Tags: [],
    keywords: [],
    structuredData: []
  }

  // Basic meta information
  analysis.title = $('title').text().trim()
  analysis.description = $('meta[name="description"]').attr('content')?.trim()
  analysis.metaKeywords = $('meta[name="keywords"]').attr('content')?.trim()
  analysis.canonicalUrl = $('link[rel="canonical"]').attr('href')
  analysis.robots = $('meta[name="robots"]').attr('content')?.trim()

  // Open Graph data
  analysis.openGraph = {
    title: $('meta[property="og:title"]').attr('content')?.trim(),
    description: $('meta[property="og:description"]').attr('content')?.trim(),
    image: $('meta[property="og:image"]').attr('content')?.trim(),
    type: $('meta[property="og:type"]').attr('content')?.trim()
  }

  // Twitter Card data
  analysis.twitterCard = {
    title: $('meta[name="twitter:title"]').attr('content')?.trim(),
    description: $('meta[name="twitter:description"]').attr('content')?.trim(),
    image: $('meta[name="twitter:image"]').attr('content')?.trim()
  }

  // Heading tags
  $('h1').each((_, el) => {
    const text = $(el).text().trim()
    if (text) analysis.h1Tags?.push(text)
  })

  $('h2').each((_, el) => {
    const text = $(el).text().trim()
    if (text) analysis.h2Tags?.push(text)
  })

  $('h3').each((_, el) => {
    const text = $(el).text().trim()
    if (text) analysis.h3Tags?.push(text)
  })

  // Images analysis
  $('img').each((_, el) => {
    const src = $(el).attr('src')
    const alt = $(el).attr('alt')
    if (src) {
      analysis.images?.push({
        src: src.startsWith('http') ? src : new URL(src, url).href,
        alt: alt || ''
      })
    }
  })

  // Links analysis
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    const text = $(el).text().trim()
    if (href && text) {
      const fullUrl = href.startsWith('http') ? href : new URL(href, url).href
      const isInternal = fullUrl.includes(new URL(url).hostname)
      analysis.links?.push({
        href: fullUrl,
        text,
        type: isInternal ? 'internal' : 'external'
      })
    }
  })

  // Content analysis
  const bodyText = $('body').text().trim()
  analysis.wordCount = bodyText.split(/\s+/).length

  // Structured data analysis
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const jsonData = JSON.parse($(el).html() || '{}')
      analysis.structuredData?.push(jsonData)
    } catch (e) {
      // Invalid JSON, skip
    }
  })

  // SEO Issues Detection
  if (!analysis.title) {
    analysis.issues?.push('Missing page title')
    analysis.recommendations?.push('Add a descriptive page title (50-60 characters)')
  } else if (analysis.title.length > 60) {
    analysis.issues?.push('Title too long')
    analysis.recommendations?.push('Shorten title to 50-60 characters for better display in search results')
  } else if (analysis.title.length < 30) {
    analysis.issues?.push('Title too short')
    analysis.recommendations?.push('Extend title to 30-60 characters for better SEO')
  }

  if (!analysis.description) {
    analysis.issues?.push('Missing meta description')
    analysis.recommendations?.push('Add a compelling meta description (150-160 characters)')
  } else if (analysis.description.length > 160) {
    analysis.issues?.push('Meta description too long')
    analysis.recommendations?.push('Shorten meta description to 150-160 characters')
  } else if (analysis.description.length < 120) {
    analysis.issues?.push('Meta description too short')
    analysis.recommendations?.push('Extend meta description to 120-160 characters')
  }

  if (!analysis.h1Tags?.length) {
    analysis.issues?.push('Missing H1 tag')
    analysis.recommendations?.push('Add exactly one H1 tag that describes the main topic')
  } else if (analysis.h1Tags.length > 1) {
    analysis.issues?.push('Multiple H1 tags')
    analysis.recommendations?.push('Use only one H1 tag per page for better SEO structure')
  }

  if (!analysis.h2Tags?.length) {
    analysis.issues?.push('No H2 tags found')
    analysis.recommendations?.push('Add H2 tags to structure your content and improve readability')
  }

  // Images without alt text
  const imagesWithoutAlt = analysis.images?.filter(img => !img.alt) || []
  if (imagesWithoutAlt.length > 0) {
    analysis.issues?.push(`${imagesWithoutAlt.length} images missing alt text`)
    analysis.recommendations?.push('Add descriptive alt text to all images for accessibility and SEO')
  }

  // Canonical URL check
  if (!analysis.canonicalUrl) {
    analysis.issues?.push('Missing canonical URL')
    analysis.recommendations?.push('Add a canonical URL to prevent duplicate content issues')
  }

  // Open Graph check
  if (!analysis.openGraph?.title || !analysis.openGraph?.description) {
    analysis.issues?.push('Incomplete Open Graph tags')
    analysis.recommendations?.push('Add Open Graph title, description, and image for better social media sharing')
  }

  // Content length check
  if (analysis.wordCount && analysis.wordCount < 300) {
    analysis.issues?.push('Content too short')
    analysis.recommendations?.push('Increase content length to at least 300 words for better SEO value')
  }

  // Structured data check
  if (!analysis.structuredData?.length) {
    analysis.issues?.push('No structured data found')
    analysis.recommendations?.push('Add structured data (Schema.org) to help search engines understand your content')
  }

  return analysis
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    const loadTime = Date.now() - startTime
    
    // Parse HTML with Cheerio
    const $ = cheerio.load(response.data)
    
    // Analyze the content
    const analysis = analyzeContent($, url)
    analysis.loadTime = loadTime

    // Additional performance-based recommendations
    if (loadTime > 3000) {
      analysis.issues?.push('Slow page load time')
      analysis.recommendations?.push('Optimize page load time - currently taking over 3 seconds')
    }

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error) {
    console.error('SEO Analysis Error:', error)
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json(
          { error: 'Request timeout - website took too long to respond' },
          { status: 408 }
        )
      }
      if (error.response?.status === 404) {
        return NextResponse.json(
          { error: 'Website not found (404)' },
          { status: 404 }
        )
      }
      if (error.response?.status && error.response.status >= 500) {
        return NextResponse.json(
          { error: 'Website server error - please try again later' },
          { status: 502 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze website. Please check the URL and try again.' },
      { status: 500 }
    )
  }
}
