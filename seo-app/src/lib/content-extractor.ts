import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import * as cheerio from 'cheerio'

export interface ContentAnalysis {
  mainContentWordCount: number
  totalWordCount: number
  contentRatio: number
  readingTime: number
  mainContent: string
  title: string
  byline?: string
  excerpt?: string
}

export class ContentExtractor {
  /**
   * Extract main content using Mozilla Readability algorithm
   * This provides the most accurate content extraction by filtering out
   * navigation, ads, footers, and other boilerplate content
   */
  static extractMainContent(html: string, url: string): ContentAnalysis {
    try {
      // Method 1: Use Mozilla Readability (most accurate)
      const dom = new JSDOM(html, { url })
      const reader = new Readability(dom.window.document, {
        debug: false,
        maxElemsToParse: 0,
        nbTopCandidates: 5,
        charThreshold: 500,
        classesToPreserve: ['caption', 'credit']
      })

      const article = reader.parse()
      
      if (article && article.textContent.trim().length > 200) {
        const mainContentWords = this.countWords(article.textContent)
        const totalWords = this.countWords(this.extractAllText(html))
        
        return {
          mainContentWordCount: mainContentWords,
          totalWordCount: totalWords,
          contentRatio: Math.round((mainContentWords / totalWords) * 100),
          readingTime: Math.ceil(mainContentWords / 200), // Average reading speed: 200 WPM
          mainContent: article.textContent.trim(),
          title: article.title || '',
          byline: article.byline || undefined,
          excerpt: article.excerpt || undefined
        }
      }
    } catch (error) {
      console.warn('Readability extraction failed, falling back to heuristic method:', error)
    }

    // Method 2: Fallback heuristic content extraction
    return this.extractWithHeuristics(html)
  }

  /**
   * Fallback method using content heuristics
   * Attempts to identify main content areas using common selectors
   */
  private static extractWithHeuristics(html: string): ContentAnalysis {
    const $ = cheerio.load(html)
    
    // Remove non-content elements
    $('script, style, nav, header, footer, aside, .sidebar, .navigation, .menu, .ads, .advertisement').remove()
    
    // Common main content selectors (in order of priority)
    const mainContentSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '.content',
      '#content',
      '.post-content',
      '.entry-content',
      '.article-body',
      '.story-body',
      '.post-body'
    ]

    let mainContent = ''
    let mainContentElement = null

    // Try to find main content using selectors
    for (const selector of mainContentSelectors) {
      const element = $(selector).first()
      if (element.length > 0) {
        const text = element.text().trim()
        if (text.length > 200 && text.length > mainContent.length) {
          mainContent = text
          mainContentElement = element
          break
        }
      }
    }

    // If no main content found, use body but filter out common non-content areas
    if (!mainContent) {
      const bodyClone = $('body').clone()
      bodyClone.find('nav, header, footer, aside, .sidebar, .navigation, .menu, .comments, .related, .ads').remove()
      mainContent = bodyClone.text().trim()
    }

    const totalWords = this.countWords($('body').text())
    const mainContentWords = this.countWords(mainContent)

    return {
      mainContentWordCount: mainContentWords,
      totalWordCount: totalWords,
      contentRatio: totalWords > 0 ? Math.round((mainContentWords / totalWords) * 100) : 0,
      readingTime: Math.ceil(mainContentWords / 200),
      mainContent: mainContent,
      title: $('title').text().trim() || '',
      byline: undefined,
      excerpt: mainContent.substring(0, 160) + (mainContent.length > 160 ? '...' : '')
    }
  }

  /**
   * Extract all text from HTML (for total word count)
   */
  private static extractAllText(html: string): string {
    const $ = cheerio.load(html)
    $('script, style').remove() // Remove scripts and styles only
    return $('body').text().trim()
  }

  /**
   * Accurate word counting that handles various languages and punctuation
   */
  private static countWords(text: string): number {
    if (!text || text.trim().length === 0) return 0
    
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .split(' ')
      .filter(word => 
        word.length > 0 && 
        word.match(/[a-zA-Z0-9\u00C0-\u017F\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/) // Include Unicode characters
      ).length
  }

  /**
   * Analyze content quality metrics
   */
  static analyzeContentQuality(content: ContentAnalysis): {
    isHighQuality: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check content length
    if (content.mainContentWordCount < 300) {
      issues.push('Content too short (< 300 words)')
      recommendations.push('Add more comprehensive content (aim for 300+ words)')
    }

    // Check content ratio
    if (content.contentRatio < 30) {
      issues.push('Low content-to-total ratio (too much boilerplate)')
      recommendations.push('Reduce navigation, ads, and sidebar content')
    }

    // Check reading time
    if (content.readingTime < 2) {
      issues.push('Very short reading time')
      recommendations.push('Consider adding more detailed information')
    }

    const isHighQuality = issues.length === 0 && content.mainContentWordCount >= 300 && content.contentRatio >= 30

    return {
      isHighQuality,
      issues,
      recommendations
    }
  }
}
