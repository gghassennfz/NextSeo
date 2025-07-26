import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

// Initialize AI providers
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

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
  return `
You are a senior SEO expert and digital growth strategist hired to assess and optimize the website "${url}". You just completed a full SEO audit and must now share insightful, actionable, and prioritized recommendations to help it perform better in search rankings.

🎯 PRIORITY INSIGHTS (What matters most right now):
- ⚠️ Major SEO issues: ${analysis.issues?.slice(0, 3).map(i => `• ${i}`).join('\n') || 'None detected'}
- 🧠 Most impactful recommendations: ${analysis.recommendations?.slice(0, 3).map(r => `• ${r}`).join('\n') || 'No urgent suggestions'}

📊 TECHNICAL SEO SNAPSHOT:
- Page Load Time: ${analysis.loadTime ? `${analysis.loadTime}ms` : 'Unknown'}
- Canonical URL: ${analysis.canonicalUrl || 'Not set'}
- Robots Meta: ${analysis.robots || 'Not set'}
- Structured Data: ${analysis.structuredData?.length || 0} item(s)
- Open Graph: ${analysis.openGraph?.title ? '✅ Configured' : '❌ Missing'}
- Twitter Cards: ${analysis.twitterCard?.title ? '✅ Configured' : '❌ Missing'}

🔎 CONTENT & ON-PAGE SEO:
- Title: ${analysis.title || '❌ Not found'}
- Meta Description: ${analysis.description || '❌ Not found'}
- Word Count: ${analysis.wordCount || 'Unknown'}
- H1: ${analysis.h1Tags?.join(', ') || '❌ None found'}
- Top H2s: ${analysis.h2Tags?.slice(0, 5).join(', ') || 'None found'}${analysis.h2Tags && analysis.h2Tags.length > 5 ? ` (+${analysis.h2Tags.length - 5} more)` : ''}
- Images: ${analysis.images?.length || 0} total • ${analysis.images?.filter(img => !img.alt).length || 0} missing alt text

🔗 LINK STRUCTURE:
- Internal Links: ${analysis.links?.filter(link => link.type === 'internal').length || 0}
- External Links: ${analysis.links?.filter(link => link.type === 'external').length || 0}

📌 YOUR ROLE:
You are to provide:
1. Smart, prioritized SEO improvements based on the data
2. Explanations that help users understand *why* the change matters
3. Step-by-step instructions if implementation is requested
4. A strong focus on: SEO, performance, user engagement, and digital growth
5. Help with website technology, coding errors, and IT-related questions

🚫 IMPORTANT GUIDELINES:
- Be specific, data-driven, and helpful in all responses
- Avoid suggesting actions not supported by the data
- You can discuss technology, website errors, coding, and IT topics related to web development
- Focus on practical, actionable advice that delivers results

Use your expert judgment to help this site rank better. Be concise, impactful, and insightful. Focus on results.

Begin your analysis now.
`;
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

    // Allow broader topics including technology, website errors, and IT-related questions
    // No topic restrictions - users can discuss SEO, technology, coding, and web development

    // This check is no longer needed - the triple AI provider system handles missing keys gracefully
    // AI providers will try Gemini → OpenAI → Claude automatically

    // Create system prompt with analysis data
    const systemPrompt = createSystemPrompt(analysis, url)

    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}

USER QUESTION: ${message}

Please provide a helpful, specific, and actionable response based on the website analysis data. Focus on SEO improvements and be as specific as possible with your recommendations.`

    // Try to get AI response with fallback system
    let aiResponse: string
    let usedProvider: string

    try {
      // Try Gemini first
      console.log('Attempting Gemini AI...')
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent(fullPrompt)
      const response = result.response
      aiResponse = response.text()
      usedProvider = 'Gemini'
      console.log('✅ Gemini AI responded successfully')
    } catch (geminiError) {
      console.log('❌ Gemini AI failed, trying OpenAI...', geminiError)
      
      try {
        // Fallback to OpenAI
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
        
        aiResponse = openaiResponse.choices[0]?.message?.content || ''
        usedProvider = 'OpenAI'
        console.log('✅ OpenAI responded successfully')
      } catch (openaiError) {
        console.log('❌ OpenAI failed, trying Claude Sonnet...', openaiError)
        
        try {
          // Final fallback to Claude Sonnet
          const claudeResponse = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [
              {
                role: 'user',
                content: fullPrompt
              }
            ]
          })
          
          aiResponse = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : ''
          usedProvider = 'Claude Sonnet'
          console.log('✅ Claude Sonnet responded successfully')
        } catch (claudeError) {
          console.error('❌ All three AI providers failed:', { geminiError, openaiError, claudeError })
          throw new Error('All AI providers are currently unavailable')
        }
      }
    }

    // Ensure the response is focused on SEO
    if (!aiResponse || aiResponse.trim().length === 0) {
      return NextResponse.json({
        response: "I apologize, but I couldn't generate a proper response. Could you please rephrase your SEO question about the analyzed website?"
      })
    }

    return NextResponse.json({
      response: aiResponse.trim(),
      provider: usedProvider // Optional: let client know which AI responded
    })

  } catch (error) {
    console.error('AI Chat Error:', error)

    // Handle specific AI provider errors
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return NextResponse.json(
          { error: 'Invalid or missing AI API keys for both providers' },
          { status: 401 }
        )
      }
      if (error.message.includes('RATE_LIMIT') || error.message.includes('overloaded')) {
        return NextResponse.json(
          { error: 'Both AI services are currently overloaded. Please try again in a few minutes.' },
          { status: 503 }
        )
      }
      if (error.message.includes('SAFETY')) {
        return NextResponse.json({
          response: "I understand you're asking about SEO. Could you please rephrase your question so I can provide the best SEO advice for your website?"
        })
      }
      if (error.message.includes('All AI providers are currently unavailable')) {
        return NextResponse.json(
          { error: 'All AI services (Gemini, OpenAI, and Claude) are currently unavailable. Please try again later.' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate AI response. Please try again.' },
      { status: 500 }
    )
  }
}
