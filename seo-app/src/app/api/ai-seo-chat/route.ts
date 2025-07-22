import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

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
}

function isOffTopicQuestion(message: string): boolean {
  const offTopicKeywords = [
    'weather', 'cooking', 'sports', 'politics', 'entertainment', 'music', 'movies',
    'games', 'fashion', 'travel', 'dating', 'health', 'fitness', 'food', 'recipe',
    'news', 'celebrity', 'joke', 'funny', 'meme', 'personal', 'relationship',
    'math', 'science', 'history', 'geography', 'literature', 'art', 'philosophy'
  ]

  const seoKeywords = [
    'seo', 'search', 'ranking', 'traffic', 'keyword', 'meta', 'title', 'description',
    'tag', 'content', 'optimization', 'google', 'website', 'page', 'link', 'backlink',
    'crawl', 'index', 'sitemap', 'robots', 'canonical', 'schema', 'structured',
    'performance', 'speed', 'mobile', 'responsive', 'accessibility', 'analytics',
    'conversion', 'ctr', 'bounce', 'engagement', 'visibility', 'serp', 'algorithm',
    'update', 'penalty', 'organic', 'paid', 'ppc', 'sem', 'smm', 'social', 'share'
  ]

  const messageLower = message.toLowerCase()
  
  // Check if it contains any SEO-related keywords
  const hasSeoKeywords = seoKeywords.some(keyword => messageLower.includes(keyword))
  
  // Check if it contains off-topic keywords without SEO context
  const hasOffTopicKeywords = offTopicKeywords.some(keyword => messageLower.includes(keyword))
  
  // If it has SEO keywords, it's likely on-topic
  if (hasSeoKeywords) return false
  
  // If it has off-topic keywords and no SEO context, it's off-topic
  if (hasOffTopicKeywords) return true
  
  // Additional checks for common off-topic patterns
  const offTopicPatterns = [
    /what.*time/i,
    /how.*old/i,
    /where.*live/i,
    /favorite.*color/i,
    /tell.*joke/i,
    /how.*feel/i,
    /personal.*opinion/i
  ]
  
  return offTopicPatterns.some(pattern => pattern.test(messageLower))
}

function createSystemPrompt(analysis: SEOAnalysis, url: string): string {
  return `You are an expert SEO consultant and digital marketing specialist. You have just analyzed the website "${url}" and have comprehensive data about its current SEO performance.

WEBSITE ANALYSIS DATA:
- URL: ${url}
- Title: ${analysis.title || 'Not found'}
- Meta Description: ${analysis.description || 'Not found'}
- H1 Tags: ${analysis.h1Tags?.join(', ') || 'None found'}
- H2 Tags: ${analysis.h2Tags?.slice(0, 5).join(', ') || 'None found'}${analysis.h2Tags && analysis.h2Tags.length > 5 ? ` (and ${analysis.h2Tags.length - 5} more)` : ''}
- Images: ${analysis.images?.length || 0} total (${analysis.images?.filter(img => !img.alt).length || 0} without alt text)
- Internal Links: ${analysis.links?.filter(link => link.type === 'internal').length || 0}
- External Links: ${analysis.links?.filter(link => link.type === 'external').length || 0}
- Word Count: ${analysis.wordCount || 'Unknown'}
- Page Load Time: ${analysis.loadTime ? `${analysis.loadTime}ms` : 'Unknown'}
- Canonical URL: ${analysis.canonicalUrl || 'Not set'}
- Robots Meta: ${analysis.robots || 'Not set'}
- Open Graph: ${analysis.openGraph?.title ? 'Configured' : 'Missing or incomplete'}
- Twitter Cards: ${analysis.twitterCard?.title ? 'Configured' : 'Missing or incomplete'}
- Structured Data: ${analysis.structuredData?.length || 0} items found

IDENTIFIED ISSUES:
${analysis.issues?.map(issue => `- ${issue}`).join('\n') || 'No major issues detected'}

RECOMMENDATIONS PREPARED:
${analysis.recommendations?.map(rec => `- ${rec}`).join('\n') || 'No specific recommendations at this time'}

YOUR ROLE:
You are a dedicated SEO consultant focused ONLY on helping improve this specific website's search engine optimization and performance. You should:

1. Provide actionable, specific advice based on the analyzed data
2. Explain SEO concepts in clear, understandable terms
3. Prioritize recommendations based on potential impact
4. Give step-by-step implementation guidance when asked
5. Stay focused on SEO, website performance, content optimization, and digital marketing topics

IMPORTANT RESTRICTIONS:
- ONLY answer questions related to SEO, website optimization, digital marketing, and web performance
- If asked about topics unrelated to SEO or this website analysis, respond with: "I'm here to help you improve your website's SEO and performance. Please ask SEO-related questions about your scanned website."
- Base your advice on the actual data from the analyzed website
- Be specific and actionable in your recommendations
- Always explain the "why" behind your suggestions

Remember: You are a professional SEO consultant helping to improve this specific website's search rankings and performance.`
}

export async function POST(request: NextRequest) {
  try {
    const { message, analysis, url } = await request.json()

    if (!message || !analysis || !url) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Check if the question is off-topic
    if (isOffTopicQuestion(message)) {
      return NextResponse.json({
        response: "I'm here to help you improve your website's SEO and performance. Please ask SEO-related questions about your scanned website."
      })
    }

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set up Google Gemini API key.' },
        { status: 500 }
      )
    }

    // Get generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Create system prompt with analysis data
    const systemPrompt = createSystemPrompt(analysis, url)

    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}

USER QUESTION: ${message}

Please provide a helpful, specific, and actionable response based on the website analysis data. Focus on SEO improvements and be as specific as possible with your recommendations.`

    // Generate AI response
    const result = await model.generateContent(fullPrompt)
    const response = result.response
    const aiResponse = response.text()

    // Ensure the response is focused on SEO
    if (!aiResponse || aiResponse.trim().length === 0) {
      return NextResponse.json({
        response: "I apologize, but I couldn't generate a proper response. Could you please rephrase your SEO question about the analyzed website?"
      })
    }

    return NextResponse.json({
      response: aiResponse.trim()
    })

  } catch (error) {
    console.error('AI Chat Error:', error)

    // Handle specific Google AI errors
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return NextResponse.json(
          { error: 'Invalid or missing Google Gemini API key' },
          { status: 401 }
        )
      }
      if (error.message.includes('RATE_LIMIT')) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }
      if (error.message.includes('SAFETY')) {
        return NextResponse.json({
          response: "I understand you're asking about SEO. Could you please rephrase your question so I can provide the best SEO advice for your website?"
        })
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate AI response. Please try again.' },
      { status: 500 }
    )
  }
}
