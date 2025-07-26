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

function createConversationalPrompt(analysis: SEOAnalysis, url: string, userName?: string): string {
  return `You are an enthusiastic and friendly SEO expert who has just finished analyzing a website. You're excited to share your findings and help improve the website's performance.

WEBSITE ANALYZED: ${url}

ANALYSIS RESULTS:
- Page Title: ${analysis.title || 'Not found'}
- Meta Description: ${analysis.description || 'Not found'}
- H1 Tags Found: ${analysis.h1Tags?.length || 0} (${analysis.h1Tags?.join(', ') || 'None'})
- H2 Tags Found: ${analysis.h2Tags?.length || 0} ${analysis.h2Tags?.length ? `(First few: ${analysis.h2Tags.slice(0, 3).join(', ')})` : ''}
- Total Images: ${analysis.images?.length || 0}
- Images Missing Alt Text: ${analysis.images?.filter(img => !img.alt).length || 0}
- Internal Links: ${analysis.links?.filter(link => link.type === 'internal').length || 0}
- External Links: ${analysis.links?.filter(link => link.type === 'external').length || 0}
- Content Word Count: ${analysis.wordCount || 'Unknown'}
- Page Load Time: ${analysis.loadTime ? `${analysis.loadTime}ms` : 'Not measured'}
- Open Graph Setup: ${analysis.openGraph?.title ? 'Yes' : 'No'}
- Structured Data: ${analysis.structuredData?.length || 0} items

MAIN ISSUES DETECTED:
${analysis.issues?.map(issue => `• ${issue}`).join('\n') || 'No major issues found'}

TOP RECOMMENDATIONS:
${analysis.recommendations?.slice(0, 5).map(rec => `• ${rec}`).join('\n') || 'No specific recommendations'}

YOUR TASK:
Write a friendly, conversational opening message as if you're a real SEO consultant who just finished analyzing their website. Be enthusiastic and helpful. Your message should:

1. Greet them warmly by name ${userName ? `(their name is ${userName})` : ''} and mention you've just analyzed their website
2. Give them a quick overview of what you found (both good and areas for improvement)
3. Highlight 2-3 most important findings in a conversational way
4. Ask an engaging question to continue the conversation
5. Make them feel like they're talking to a knowledgeable friend, not a robot

Keep the tone professional but friendly, like a consultant who's genuinely excited to help improve their website's performance.

Write your response in a natural, conversational style as if you're speaking directly to the website owner. Be specific about their actual website data, not generic advice.`
}

export async function POST(request: NextRequest) {
  let analysis, url, userName
  
  try {
    const requestData = await request.json()
    analysis = requestData.analysis
    url = requestData.url
    userName = requestData.userName

    if (!analysis || !url) {
      return NextResponse.json(
        { error: 'Missing analysis data or URL' },
        { status: 400 }
      )
    }

    // Try to get AI response with fallback system
    let aiResponse: string
    let usedProvider: string

    try {
      // Try Gemini first
      console.log('Attempting Gemini AI for conversation...')
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const prompt = createConversationalPrompt(analysis, url, userName)
      const result = await model.generateContent(prompt)
      const response = result.response
      aiResponse = response.text()
      usedProvider = 'Gemini'
      console.log('✅ Gemini AI conversation successful')
    } catch (geminiError) {
      console.log('❌ Gemini AI failed for conversation, trying OpenAI...', geminiError)
      
      try {
        // Fallback to OpenAI
        const prompt = createConversationalPrompt(analysis, url, userName)
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
        
        aiResponse = openaiResponse.choices[0]?.message?.content || ''
        usedProvider = 'OpenAI'
        console.log('✅ OpenAI conversation successful')
      } catch (openaiError) {
        console.log('❌ OpenAI failed for conversation, trying Claude...', openaiError)
        
        try {
          // Final fallback to Claude Sonnet
          const prompt = createConversationalPrompt(analysis, url, userName)
          const claudeResponse = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          })
          
          aiResponse = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : ''
          usedProvider = 'Claude Sonnet'
          console.log('✅ Claude Sonnet conversation successful')
        } catch (claudeError) {
          console.error('❌ All three AI providers failed for conversation:', { geminiError, openaiError, claudeError })
          // Use fallback response
          return NextResponse.json({
            response: `Hey ${userName || 'there'}! 👋 I've just finished analyzing ${url} and I'm excited to share what I found! 

I discovered ${analysis.issues?.length || 0} areas where we can improve your SEO performance. ${analysis.issues?.length > 0 ? `The main issues I spotted are ${analysis.issues.slice(0, 2).join(' and ')}.` : 'Your site is looking pretty good overall!'}

${analysis.recommendations?.length > 0 ? `I've got ${analysis.recommendations.length} specific recommendations that could really boost your search rankings.` : ''}

What aspect of your website's SEO would you like to dive into first? I'm here to help you improve your search visibility! 🚀`
          })
        }
      }
    }

    // Ensure we have a good response
    if (!aiResponse || aiResponse.trim().length === 0) {
      return NextResponse.json({
        response: `Hi there! 👋 I just finished analyzing ${url} and I have some interesting findings to share with you!

I found ${analysis.issues?.length || 0} SEO issues that we can work on together${analysis.issues?.length > 0 ? `, including ${analysis.issues[0].toLowerCase()}` : ', but overall your site looks good'}. 

${analysis.recommendations?.length > 0 ? `I've prepared ${analysis.recommendations.length} actionable recommendations that could really help improve your search rankings.` : ''}

What would you like to know about your website's SEO performance? I'm here to help you boost your search visibility! 🚀`
      })
    }

    return NextResponse.json({
      response: aiResponse.trim(),
      provider: usedProvider
    })

  } catch (error) {
    console.error('Conversational AI Error:', error)

    // Handle specific Google AI errors
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return NextResponse.json({
          response: `Hey ${userName || 'there'}! 👋 I've analyzed your website and found some great opportunities to improve your SEO! Unfortunately, I'm having a small technical issue right now, but I can tell you that I found ${analysis?.issues?.length || 0} areas for improvement. What specific aspect of your SEO would you like to discuss?`
        })
      }
    }

    // Fallback conversational response
    return NextResponse.json({
      response: `Hello ${userName || 'there'}! 👋 I've just completed analyzing your website and I'm excited to help you improve your SEO performance! 

I discovered several opportunities to boost your search rankings. Would you like to start by discussing your page titles, content optimization, or technical SEO elements? I'm here to guide you through everything! 🚀`
    })
  }
}
