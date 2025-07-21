import * as cheerio from 'cheerio'
import axios from 'axios'
import { SEOAnalysis, MetaAnalysis, PageQualityAnalysis, LinkStructureAnalysis, PageStructureAnalysis, PerformanceAnalysis, CrawlabilityAnalysis, ExternalFactorsAnalysis } from '@/types/seo'

export class SEOAnalyzer {
  private $: cheerio.CheerioAPI
  private html: string
  private url: string
  private startTime: number

  constructor(html: string, url: string) {
    this.html = html
    this.url = url
    this.$ = cheerio.load(html)
    this.startTime = Date.now()
  }

  static async analyze(url: string): Promise<SEOAnalysis> {
    const startTime = Date.now()
    
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      const analyzer = new SEOAnalyzer(response.data, url)
      const responseTime = Date.now() - startTime
      
      const analysis: SEOAnalysis = {
        url,
        timestamp: new Date().toISOString(),
        overallScore: 0,
        sections: {
          meta: analyzer.analyzeMeta(),
          pageQuality: analyzer.analyzePageQuality(),
          linkStructure: analyzer.analyzeLinkStructure(),
          pageStructure: analyzer.analyzePageStructure(),
          performance: analyzer.analyzePerformance(responseTime, response.data.length),
          crawlability: await analyzer.analyzeCrawlability(),
          externalFactors: analyzer.analyzeExternalFactors()
        }
      }

      // Calculate overall score
      const scores = Object.values(analysis.sections).map(section => section.score)
      analysis.overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

      return analysis
    } catch (error) {
      throw new Error(`Failed to analyze URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private analyzeMeta(): MetaAnalysis {
    const title = this.$('title').text().trim()
    const description = this.$('meta[name="description"]').attr('content') || ''
    const keywords = this.$('meta[name="keywords"]').attr('content') || ''

    const titleIssues: string[] = []
    const descIssues: string[] = []

    if (!title) titleIssues.push('Missing title tag')
    else if (title.length < 30) titleIssues.push('Title too short (< 30 chars)')
    else if (title.length > 60) titleIssues.push('Title too long (> 60 chars)')

    if (!description) descIssues.push('Missing meta description')
    else if (description.length < 120) descIssues.push('Description too short (< 120 chars)')
    else if (description.length > 160) descIssues.push('Description too long (> 160 chars)')

    const score = (
      (title ? (title.length >= 30 && title.length <= 60 ? 30 : 15) : 0) +
      (description ? (description.length >= 120 && description.length <= 160 ? 30 : 15) : 0) +
      (keywords ? 10 : 5) +
      (titleIssues.length === 0 ? 15 : 0) +
      (descIssues.length === 0 ? 15 : 0)
    )

    return {
      score,
      title: {
        content: title,
        length: title.length,
        isOptimal: title.length >= 30 && title.length <= 60,
        issues: titleIssues
      },
      description: {
        content: description,
        length: description.length,
        isOptimal: description.length >= 120 && description.length <= 160,
        issues: descIssues
      },
      keywords,
      duplicates: {
        title: this.$('title').length > 1,
        description: this.$('meta[name="description"]').length > 1
      }
    }
  }

  private analyzePageQuality(): PageQualityAnalysis {
    const text = this.$('body').text()
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
    const images = this.$('img')
    const imageCount = images.length
    const imagesWithAlt = images.filter('[alt]').length
    const imagesWithoutAlt = imageCount - imagesWithAlt

    const headingsCount = {
      h1: this.$('h1').length,
      h2: this.$('h2').length,
      h3: this.$('h3').length,
      h4: this.$('h4').length,
      h5: this.$('h5').length,
      h6: this.$('h6').length
    }

    const issues: string[] = []
    if (wordCount < 300) issues.push('Low word count (< 300 words)')
    if (imagesWithoutAlt > 0) issues.push(`${imagesWithoutAlt} images missing alt text`)
    if (headingsCount.h1 === 0) issues.push('No H1 heading found')
    if (headingsCount.h1 > 1) issues.push('Multiple H1 headings found')

    const score = (
      (wordCount >= 300 ? 25 : Math.round((wordCount / 300) * 25)) +
      (imagesWithoutAlt === 0 ? 25 : Math.max(0, 25 - (imagesWithoutAlt * 5))) +
      (headingsCount.h1 === 1 ? 25 : 0) +
      (issues.length === 0 ? 25 : Math.max(0, 25 - (issues.length * 5)))
    )

    return {
      score: Math.min(100, score),
      wordCount,
      imageCount,
      imagesWithAlt,
      imagesWithoutAlt,
      headingsCount,
      issues
    }
  }

  private analyzeLinkStructure(): LinkStructureAnalysis {
    const links = this.$('a[href]')
    let internalLinks = 0
    let externalLinks = 0
    let noFollowLinks = 0
    const brokenLinks: string[] = []

    links.each((_, element) => {
      const href = this.$(element).attr('href')
      const rel = this.$(element).attr('rel')
      
      if (href) {
        if (href.startsWith('http') && !href.includes(new URL(this.url).hostname)) {
          externalLinks++
        } else if (href.startsWith('/') || href.startsWith('#') || href.includes(new URL(this.url).hostname)) {
          internalLinks++
        }
        
        if (rel && rel.includes('nofollow')) {
          noFollowLinks++
        }
      }
    })

    const issues: string[] = []
    if (internalLinks < 3) issues.push('Few internal links (< 3)')
    if (externalLinks === 0) issues.push('No external links found')

    const score = (
      (internalLinks >= 3 ? 30 : Math.round((internalLinks / 3) * 30)) +
      (externalLinks > 0 ? 20 : 0) +
      (brokenLinks.length === 0 ? 30 : Math.max(0, 30 - (brokenLinks.length * 10))) +
      (issues.length === 0 ? 20 : Math.max(0, 20 - (issues.length * 5)))
    )

    return {
      score: Math.min(100, score),
      internalLinks,
      externalLinks,
      brokenLinks,
      noFollowLinks,
      issues
    }
  }

  private analyzePageStructure(): PageStructureAnalysis {
    const h1Elements = this.$('h1')
    const h1Count = h1Elements.length
    const h1Text: string[] = []
    
    h1Elements.each((_, element) => {
      h1Text.push(this.$(element).text().trim())
    })

    // Calculate DOM depth
    let maxDepth = 0
    const calculateDepth = (element: cheerio.Element, depth: number) => {
      maxDepth = Math.max(maxDepth, depth)
      this.$(element).children().each((_, child) => {
        calculateDepth(child, depth + 1)
      })
    }
    
    this.$('body').children().each((_, element) => {
      calculateDepth(element, 1)
    })

    const issues: string[] = []
    if (h1Count === 0) issues.push('Missing H1 heading')
    if (h1Count > 1) issues.push('Multiple H1 headings')
    if (maxDepth > 15) issues.push('DOM too deep (> 15 levels)')

    // Check heading hierarchy
    const headings = this.$('h1, h2, h3, h4, h5, h6')
    let properHierarchy = true
    let lastLevel = 0
    
    headings.each((_, element) => {
      const level = parseInt(element.tagName.charAt(1))
      if (level > lastLevel + 1) {
        properHierarchy = false
      }
      lastLevel = level
    })

    if (!properHierarchy) issues.push('Improper heading hierarchy')

    const score = (
      (h1Count === 1 ? 30 : 0) +
      (maxDepth <= 15 ? 25 : Math.max(0, 25 - ((maxDepth - 15) * 2))) +
      (properHierarchy ? 25 : 0) +
      (issues.length === 0 ? 20 : Math.max(0, 20 - (issues.length * 5)))
    )

    return {
      score: Math.min(100, score),
      domDepth: maxDepth,
      headingStructure: {
        h1Count,
        h1Text,
        missingH1: h1Count === 0,
        properHierarchy
      },
      issues
    }
  }

  private analyzePerformance(responseTime: number, pageSize: number): PerformanceAnalysis {
    const cssFiles = this.$('link[rel="stylesheet"]').length
    const jsFiles = this.$('script[src]').length
    const images = this.$('img').length

    const issues: string[] = []
    if (responseTime > 3000) issues.push('Slow response time (> 3s)')
    if (pageSize > 1024 * 1024) issues.push('Large page size (> 1MB)')
    if (cssFiles > 5) issues.push('Too many CSS files')
    if (jsFiles > 5) issues.push('Too many JS files')

    const score = (
      (responseTime <= 1000 ? 25 : responseTime <= 3000 ? 15 : 5) +
      (pageSize <= 512 * 1024 ? 25 : pageSize <= 1024 * 1024 ? 15 : 5) +
      (cssFiles <= 3 ? 25 : cssFiles <= 5 ? 15 : 5) +
      (jsFiles <= 3 ? 25 : jsFiles <= 5 ? 15 : 5)
    )

    return {
      score: Math.min(100, score),
      responseTime,
      pageSize,
      assetsCount: {
        css: cssFiles,
        js: jsFiles,
        images,
        total: cssFiles + jsFiles + images
      },
      issues
    }
  }

  private async analyzeCrawlability(): Promise<CrawlabilityAnalysis> {
    const canonical = this.$('link[rel="canonical"]')
    const robotsMeta = this.$('meta[name="robots"]')
    const langAttribute = this.$('html').attr('lang')

    // Check robots.txt
    let robotsTxt = { exists: false, content: '', blocks: [] as string[] }
    try {
      const robotsUrl = new URL('/robots.txt', this.url).href
      const robotsResponse = await axios.get(robotsUrl, { timeout: 5000 })
      robotsTxt.exists = true
      robotsTxt.content = robotsResponse.data
      if (robotsResponse.data.includes('Disallow:')) {
        robotsTxt.blocks = robotsResponse.data.split('\n')
          .filter((line: string) => line.includes('Disallow:'))
          .map((line: string) => line.trim())
      }
    } catch {
      // robots.txt doesn't exist or is inaccessible
    }

    // Check sitemap
    let sitemap = { exists: false, url: '' }
    if (robotsTxt.content.includes('Sitemap:')) {
      const sitemapLine = robotsTxt.content.split('\n').find(line => line.includes('Sitemap:'))
      if (sitemapLine) {
        sitemap.exists = true
        sitemap.url = sitemapLine.split('Sitemap:')[1].trim()
      }
    }

    const issues: string[] = []
    if (!robotsTxt.exists) issues.push('robots.txt not found')
    if (!sitemap.exists) issues.push('Sitemap not found')
    if (!canonical.length) issues.push('Missing canonical URL')
    if (!langAttribute) issues.push('Missing lang attribute')

    const score = (
      (robotsTxt.exists ? 25 : 0) +
      (sitemap.exists ? 25 : 0) +
      (canonical.length > 0 ? 25 : 0) +
      (langAttribute ? 25 : 0)
    )

    return {
      score,
      robotsTxt,
      sitemap,
      canonical: {
        exists: canonical.length > 0,
        url: canonical.attr('href'),
        isSelf: canonical.attr('href') === this.url
      },
      langAttribute: {
        exists: !!langAttribute,
        value: langAttribute
      },
      issues
    }
  }

  private analyzeExternalFactors(): ExternalFactorsAnalysis {
    const isHttps = this.url.startsWith('https://')
    const favicon = this.$('link[rel*="icon"]')
    
    // Open Graph
    const ogTitle = this.$('meta[property="og:title"]').attr('content')
    const ogDescription = this.$('meta[property="og:description"]').attr('content')
    const ogImage = this.$('meta[property="og:image"]').attr('content')
    const ogUrl = this.$('meta[property="og:url"]').attr('content')
    const ogType = this.$('meta[property="og:type"]').attr('content')

    // Twitter Card
    const twitterCard = this.$('meta[name="twitter:card"]').attr('content')
    const twitterTitle = this.$('meta[name="twitter:title"]').attr('content')
    const twitterDescription = this.$('meta[name="twitter:description"]').attr('content')
    const twitterImage = this.$('meta[name="twitter:image"]').attr('content')

    // Schema markup
    const schemaScripts = this.$('script[type="application/ld+json"]')
    const schemaTypes: string[] = []
    schemaScripts.each((_, element) => {
      try {
        const schema = JSON.parse(this.$(element).html() || '{}')
        if (schema['@type']) {
          schemaTypes.push(schema['@type'])
        }
      } catch {
        // Invalid JSON
      }
    })

    const issues: string[] = []
    if (!isHttps) issues.push('Not using HTTPS')
    if (!favicon.length) issues.push('Missing favicon')
    if (!ogTitle) issues.push('Missing Open Graph title')
    if (!ogDescription) issues.push('Missing Open Graph description')
    if (!twitterCard) issues.push('Missing Twitter Card')
    if (schemaTypes.length === 0) issues.push('No structured data found')

    const score = (
      (isHttps ? 20 : 0) +
      (favicon.length > 0 ? 15 : 0) +
      (ogTitle && ogDescription ? 20 : 10) +
      (twitterCard ? 15 : 0) +
      (schemaTypes.length > 0 ? 15 : 0) +
      (issues.length <= 2 ? 15 : 0)
    )

    return {
      score: Math.min(100, score),
      https: isHttps,
      favicon: {
        exists: favicon.length > 0,
        url: favicon.attr('href')
      },
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        image: ogImage,
        url: ogUrl,
        type: ogType
      },
      twitterCard: {
        card: twitterCard,
        title: twitterTitle,
        description: twitterDescription,
        image: twitterImage
      },
      schemaMarkup: {
        exists: schemaTypes.length > 0,
        types: schemaTypes
      },
      issues
    }
  }
}
