export interface RobotsAnalysis {
  exists: boolean
  content: string
  isValid: boolean
  blocks: string[]
  allows: string[]
  crawlDelay?: number
  userAgents: string[]
  issues: string[]
  sitemapUrls: string[]
}

export interface SitemapAnalysis {
  exists: boolean
  url: string
  isValid: boolean
  urlCount: number
  lastModified?: string
  issues: string[]
  indexSitemaps: string[]
  imageCount?: number
  videoCount?: number
}

export interface CrawlabilityAnalysis {
  score: number
  robots: RobotsAnalysis
  sitemaps: SitemapAnalysis[]
  canonical: {
    exists: boolean
    url?: string
    isSelf: boolean
    isValid: boolean
  }
  langAttribute: {
    exists: boolean
    value?: string
    isValid: boolean
  }
  issues: string[]
  recommendations: string[]
}

export class RobotsSitemapAnalyzer {
  /**
   * Comprehensive crawlability analysis
   * Server-side implementation to avoid CORS issues
   */
  static async analyzeCrawlability(url: string, html: string): Promise<CrawlabilityAnalysis> {
    const domain = new URL(url).origin
    const issues: string[] = []
    const recommendations: string[] = []

    // Analyze robots.txt
    const robots = await this.analyzeRobotsTxt(domain)
    
    // Analyze sitemaps
    const sitemaps: SitemapAnalysis[] = []
    
    // Get sitemaps from robots.txt
    for (const sitemapUrl of robots.sitemapUrls) {
      const sitemapAnalysis = await this.analyzeSitemap(sitemapUrl)
      sitemaps.push(sitemapAnalysis)
    }
    
    // Check for common sitemap locations if none found in robots.txt
    if (sitemaps.length === 0) {
      const commonSitemapPaths = [
        '/sitemap.xml',
        '/sitemap_index.xml',
        '/sitemap-index.xml',
        '/sitemaps.xml'
      ]
      
      for (const path of commonSitemapPaths) {
        const sitemapUrl = domain + path
        const sitemapAnalysis = await this.analyzeSitemap(sitemapUrl)
        if (sitemapAnalysis.exists) {
          sitemaps.push(sitemapAnalysis)
          break // Only add the first found sitemap
        }
      }
    }

    // Analyze page-level crawlability
    const canonical = this.analyzeCanonical(html, url)
    const langAttribute = this.analyzeLangAttribute(html)

    // Collect issues and recommendations
    if (!robots.exists) {
      issues.push('robots.txt not found')
      recommendations.push('Create a robots.txt file to guide search engine crawling')
    } else if (!robots.isValid) {
      issues.push('robots.txt has syntax errors')
      recommendations.push('Fix robots.txt syntax errors')
    }

    if (sitemaps.length === 0) {
      issues.push('No sitemap found')
      recommendations.push('Create and submit an XML sitemap')
    } else {
      const invalidSitemaps = sitemaps.filter(s => !s.isValid)
      if (invalidSitemaps.length > 0) {
        issues.push(`${invalidSitemaps.length} invalid sitemap(s) found`)
        recommendations.push('Fix sitemap XML validation errors')
      }
    }

    if (!canonical.exists) {
      issues.push('Missing canonical URL')
      recommendations.push('Add canonical URL to avoid duplicate content issues')
    } else if (!canonical.isValid) {
      issues.push('Invalid canonical URL')
      recommendations.push('Fix canonical URL to point to the correct page')
    }

    if (!langAttribute.exists) {
      issues.push('Missing lang attribute')
      recommendations.push('Add lang attribute to <html> tag for better accessibility')
    }

    // Calculate score
    const score = this.calculateCrawlabilityScore(robots, sitemaps, canonical, langAttribute)

    return {
      score,
      robots,
      sitemaps,
      canonical,
      langAttribute,
      issues,
      recommendations
    }
  }

  /**
   * Analyze robots.txt file with proper server-side fetching
   */
  private static async analyzeRobotsTxt(domain: string): Promise<RobotsAnalysis> {
    const robotsUrl = `${domain}/robots.txt`
    
    try {
      const response = await fetch(robotsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'SEO-Analyzer-Bot/1.0'
        },
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        return {
          exists: false,
          content: '',
          isValid: false,
          blocks: [],
          allows: [],
          userAgents: [],
          issues: [`robots.txt not accessible (${response.status})`],
          sitemapUrls: []
        }
      }

      const content = await response.text()
      return this.parseRobotsTxt(content)

    } catch (error) {
      return {
        exists: false,
        content: '',
        isValid: false,
        blocks: [],
        allows: [],
        userAgents: [],
        issues: [`Failed to fetch robots.txt: ${error instanceof Error ? error.message : 'Unknown error'}`],
        sitemapUrls: []
      }
    }
  }

  /**
   * Parse robots.txt content
   */
  private static parseRobotsTxt(content: string): RobotsAnalysis {
    const lines = content.split('\n').map(line => line.trim())
    const issues: string[] = []
    const blocks: string[] = []
    const allows: string[] = []
    const userAgents: string[] = []
    const sitemapUrls: string[] = []
    let crawlDelay: number | undefined

    let currentUserAgent = ''
    let lineNumber = 0

    for (const line of lines) {
      lineNumber++
      
      if (line === '' || line.startsWith('#')) {
        continue // Skip empty lines and comments
      }

      const [directive, ...valueParts] = line.split(':')
      const value = valueParts.join(':').trim()

      if (!directive || !value) {
        issues.push(`Invalid syntax on line ${lineNumber}: ${line}`)
        continue
      }

      const directiveLower = directive.toLowerCase().trim()

      switch (directiveLower) {
        case 'user-agent':
          currentUserAgent = value
          if (!userAgents.includes(value)) {
            userAgents.push(value)
          }
          break
          
        case 'disallow':
          if (currentUserAgent) {
            blocks.push(`${currentUserAgent}: ${value}`)
          } else {
            issues.push(`Disallow directive without User-agent on line ${lineNumber}`)
          }
          break
          
        case 'allow':
          if (currentUserAgent) {
            allows.push(`${currentUserAgent}: ${value}`)
          } else {
            issues.push(`Allow directive without User-agent on line ${lineNumber}`)
          }
          break
          
        case 'crawl-delay':
          const delay = parseInt(value)
          if (isNaN(delay)) {
            issues.push(`Invalid crawl-delay value on line ${lineNumber}: ${value}`)
          } else {
            crawlDelay = delay
          }
          break
          
        case 'sitemap':
          if (this.isValidUrl(value)) {
            sitemapUrls.push(value)
          } else {
            issues.push(`Invalid sitemap URL on line ${lineNumber}: ${value}`)
          }
          break
          
        default:
          issues.push(`Unknown directive on line ${lineNumber}: ${directive}`)
      }
    }

    return {
      exists: true,
      content,
      isValid: issues.length === 0,
      blocks,
      allows,
      crawlDelay,
      userAgents,
      issues,
      sitemapUrls
    }
  }

  /**
   * Analyze XML sitemap
   */
  private static async analyzeSitemap(sitemapUrl: string): Promise<SitemapAnalysis> {
    try {
      const response = await fetch(sitemapUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'SEO-Analyzer-Bot/1.0'
        },
        signal: AbortSignal.timeout(15000)
      })

      if (!response.ok) {
        return {
          exists: false,
          url: sitemapUrl,
          isValid: false,
          urlCount: 0,
          issues: [`Sitemap not accessible (${response.status})`],
          indexSitemaps: []
        }
      }

      const content = await response.text()
      const lastModified = response.headers.get('last-modified') || undefined

      return this.parseSitemap(sitemapUrl, content, lastModified)

    } catch (error) {
      return {
        exists: false,
        url: sitemapUrl,
        isValid: false,
        urlCount: 0,
        issues: [`Failed to fetch sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`],
        indexSitemaps: []
      }
    }
  }

  /**
   * Parse XML sitemap content
   */
  private static parseSitemap(url: string, content: string, lastModified?: string): SitemapAnalysis {
    const issues: string[] = []
    let urlCount = 0
    let imageCount = 0
    let videoCount = 0
    const indexSitemaps: string[] = []

    try {
      // Check if it's a sitemap index
      if (content.includes('<sitemapindex')) {
        const sitemapMatches = content.match(/<sitemap>/g)
        const locMatches = content.match(/<loc>(.*?)<\/loc>/g)
        
        if (locMatches) {
          for (const match of locMatches) {
            const sitemapUrl = match.replace(/<\/?loc>/g, '')
            if (this.isValidUrl(sitemapUrl)) {
              indexSitemaps.push(sitemapUrl)
            }
          }
        }
        
        return {
          exists: true,
          url,
          isValid: indexSitemaps.length > 0,
          urlCount: indexSitemaps.length,
          lastModified,
          issues: indexSitemaps.length === 0 ? ['No valid sitemaps found in sitemap index'] : [],
          indexSitemaps
        }
      }

      // Regular sitemap parsing
      const urlMatches = content.match(/<url>/g)
      urlCount = urlMatches ? urlMatches.length : 0

      const imageMatches = content.match(/<image:image>/g)
      imageCount = imageMatches ? imageMatches.length : 0

      const videoMatches = content.match(/<video:video>/g)
      videoCount = videoMatches ? videoMatches.length : 0

      // Validate XML structure
      if (!content.includes('<urlset') && !content.includes('<sitemapindex')) {
        issues.push('Invalid XML sitemap format')
      }

      if (urlCount === 0 && indexSitemaps.length === 0) {
        issues.push('No URLs found in sitemap')
      }

      if (urlCount > 50000) {
        issues.push('Sitemap contains more than 50,000 URLs (recommend splitting)')
      }

    } catch (error) {
      issues.push('Failed to parse sitemap XML')
    }

    return {
      exists: true,
      url,
      isValid: issues.length === 0,
      urlCount,
      lastModified,
      issues,
      indexSitemaps,
      imageCount: imageCount > 0 ? imageCount : undefined,
      videoCount: videoCount > 0 ? videoCount : undefined
    }
  }

  /**
   * Analyze canonical URL from HTML
   */
  private static analyzeCanonical(html: string, currentUrl: string): {
    exists: boolean
    url?: string
    isSelf: boolean
    isValid: boolean
  } {
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)
    
    if (!canonicalMatch) {
      return {
        exists: false,
        isSelf: false,
        isValid: false
      }
    }

    const hrefMatch = canonicalMatch[0].match(/href=["']([^"']+)["']/i)
    if (!hrefMatch) {
      return {
        exists: true,
        isSelf: false,
        isValid: false
      }
    }

    const canonicalUrl = hrefMatch[1]
    const normalizedCurrent = this.normalizeUrl(currentUrl)
    const normalizedCanonical = this.normalizeUrl(canonicalUrl)

    return {
      exists: true,
      url: canonicalUrl,
      isSelf: normalizedCurrent === normalizedCanonical,
      isValid: this.isValidUrl(canonicalUrl)
    }
  }

  /**
   * Analyze lang attribute from HTML
   */
  private static analyzeLangAttribute(html: string): {
    exists: boolean
    value?: string
    isValid: boolean
  } {
    const langMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i)
    
    if (!langMatch) {
      return {
        exists: false,
        isValid: false
      }
    }

    const langValue = langMatch[1]
    const isValid = /^[a-z]{2}(-[A-Z]{2})?$/.test(langValue) // e.g., "en", "en-US"

    return {
      exists: true,
      value: langValue,
      isValid
    }
  }

  /**
   * Calculate overall crawlability score
   */
  private static calculateCrawlabilityScore(
    robots: RobotsAnalysis,
    sitemaps: SitemapAnalysis[],
    canonical: any,
    langAttribute: any
  ): number {
    let score = 0

    // Robots.txt (30 points)
    if (robots.exists) {
      score += 15
      if (robots.isValid) score += 15
    }

    // Sitemap (30 points)
    if (sitemaps.length > 0) {
      score += 15
      const validSitemaps = sitemaps.filter(s => s.isValid)
      if (validSitemaps.length > 0) score += 15
    }

    // Canonical URL (25 points)
    if (canonical.exists) {
      score += 10
      if (canonical.isValid) score += 10
      if (canonical.isSelf) score += 5
    }

    // Lang attribute (15 points)
    if (langAttribute.exists) {
      score += 10
      if (langAttribute.isValid) score += 5
    }

    return Math.min(100, score)
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Normalize URL for comparison
   */
  private static normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url)
      return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, '')
    } catch {
      return url
    }
  }
}
