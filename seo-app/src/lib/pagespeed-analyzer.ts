export interface CoreWebVitals {
  lcp: {
    value: number
    score: number
    displayValue: string
    category: 'good' | 'needs-improvement' | 'poor'
  }
  fid: {
    value: number
    score: number
    displayValue: string
    category: 'good' | 'needs-improvement' | 'poor'
  }
  cls: {
    value: number
    score: number
    displayValue: string
    category: 'good' | 'needs-improvement' | 'poor'
  }
  fcp: {
    value: number
    score: number
    displayValue: string
    category: 'good' | 'needs-improvement' | 'poor'
  }
  speedIndex: {
    value: number
    score: number
    displayValue: string
    category: 'good' | 'needs-improvement' | 'poor'
  }
}

export interface PageSpeedAnalysis {
  performanceScore: number
  coreWebVitals: CoreWebVitals
  opportunities: Array<{
    title: string
    description: string
    potentialSavings: string
    impact: 'high' | 'medium' | 'low'
  }>
  diagnostics: Array<{
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
  }>
  totalPageSize: number
  totalRequestCount: number
  loadTime: number
  isSuccess: boolean
  error?: string
}

export class PageSpeedAnalyzer {
  private static readonly API_BASE = 'https://www.googleapis.com/pagespeed/v5/runPagespeed'
  
  /**
   * Analyze page performance using Google PageSpeed Insights API
   * Free tier: 25,000 requests per day
   */
  static async analyzePerformance(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedAnalysis> {
    try {
      const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
      
      if (!apiKey) {
        console.warn('Google PageSpeed API key not configured, using fallback analysis')
        return this.fallbackPerformanceAnalysis(url)
      }

      const apiUrl = `${this.API_BASE}?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance`
      
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(30000), // 30 second timeout
        headers: {
          'User-Agent': 'SEO-Analyzer/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`PageSpeed API error: ${data.error.message}`)
      }

      return this.parsePageSpeedResults(data)
      
    } catch (error) {
      console.error('PageSpeed analysis failed:', error)
      return {
        ...this.fallbackPerformanceAnalysis(url),
        error: error instanceof Error ? error.message : 'Unknown error',
        isSuccess: false
      }
    }
  }

  /**
   * Parse Google PageSpeed Insights API response
   */
  private static parsePageSpeedResults(data: any): PageSpeedAnalysis {
    const lighthouseResult = data.lighthouseResult
    const audits = lighthouseResult.audits
    const categories = lighthouseResult.categories

    // Core Web Vitals
    const coreWebVitals: CoreWebVitals = {
      lcp: this.parseMetric(audits['largest-contentful-paint']),
      fid: this.parseMetric(audits['max-potential-fid'] || audits['total-blocking-time']),
      cls: this.parseMetric(audits['cumulative-layout-shift']),
      fcp: this.parseMetric(audits['first-contentful-paint']),
      speedIndex: this.parseMetric(audits['speed-index'])
    }

    // Performance opportunities
    const opportunities = this.extractOpportunities(audits)
    
    // Diagnostics
    const diagnostics = this.extractDiagnostics(audits)

    // Resource summary
    const resourceSummary = audits['resource-summary']?.details?.items || []
    const totalSize = resourceSummary.reduce((sum: number, item: any) => sum + (item.size || 0), 0)
    const totalRequests = resourceSummary.reduce((sum: number, item: any) => sum + (item.requestCount || 0), 0)

    return {
      performanceScore: Math.round((categories.performance?.score || 0) * 100),
      coreWebVitals,
      opportunities,
      diagnostics,
      totalPageSize: totalSize,
      totalRequestCount: totalRequests,
      loadTime: audits['speed-index']?.numericValue || 0,
      isSuccess: true
    }
  }

  /**
   * Parse individual metric from audit result
   */
  private static parseMetric(audit: any): any {
    if (!audit) {
      return {
        value: 0,
        score: 0,
        displayValue: 'N/A',
        category: 'poor' as const
      }
    }

    const value = audit.numericValue || 0
    const score = Math.round((audit.score || 0) * 100)
    const displayValue = audit.displayValue || 'N/A'
    
    // Determine category based on score
    let category: 'good' | 'needs-improvement' | 'poor' = 'poor'
    if (score >= 90) category = 'good'
    else if (score >= 50) category = 'needs-improvement'

    return {
      value,
      score,
      displayValue,
      category
    }
  }

  /**
   * Extract performance opportunities from audits
   */
  private static extractOpportunities(audits: any): Array<{
    title: string
    description: string
    potentialSavings: string
    impact: 'high' | 'medium' | 'low'
  }> {
    const opportunityAudits = [
      'unused-javascript',
      'unused-css-rules',
      'server-response-time',
      'render-blocking-resources',
      'unminified-css',
      'unminified-javascript',
      'next-gen-images',
      'offscreen-images',
      'efficiently-encode-images'
    ]

    return opportunityAudits
      .filter(auditId => audits[auditId] && audits[auditId].details)
      .map(auditId => {
        const audit = audits[auditId]
        const savings = audit.details?.overallSavingsMs || 0
        
        return {
          title: audit.title,
          description: audit.description,
          potentialSavings: savings > 1000 ? `${(savings / 1000).toFixed(1)}s` : `${savings}ms`,
          impact: savings > 1000 ? 'high' : savings > 500 ? 'medium' : 'low'
        }
      })
      .sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 }
        return impactOrder[b.impact] - impactOrder[a.impact]
      })
  }

  /**
   * Extract diagnostics from audits
   */
  private static extractDiagnostics(audits: any): Array<{
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
  }> {
    const diagnosticAudits = [
      'dom-size',
      'uses-long-cache-ttl',
      'total-byte-weight',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images'
    ]

    return diagnosticAudits
      .filter(auditId => audits[auditId] && audits[auditId].score < 1)
      .map(auditId => {
        const audit = audits[auditId]
        const score = audit.score || 0
        
        return {
          title: audit.title,
          description: audit.description,
          impact: score < 0.5 ? 'high' : score < 0.8 ? 'medium' : 'low'
        }
      })
  }

  /**
   * Fallback performance analysis when API is unavailable
   */
  private static async fallbackPerformanceAnalysis(url: string): Promise<PageSpeedAnalysis> {
    try {
      const startTime = Date.now()
      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      const responseTime = Date.now() - startTime
      
      const contentLength = parseInt(response.headers.get('content-length') || '0')
      
      // Simple performance estimation
      const estimatedScore = this.estimatePerformanceScore(responseTime, contentLength)
      
      return {
        performanceScore: estimatedScore,
        coreWebVitals: {
          lcp: { value: responseTime * 1.5, score: estimatedScore, displayValue: `~${(responseTime * 1.5 / 1000).toFixed(1)}s`, category: 'needs-improvement' },
          fid: { value: 100, score: 80, displayValue: '~100ms', category: 'good' },
          cls: { value: 0.1, score: 85, displayValue: '~0.1', category: 'good' },
          fcp: { value: responseTime, score: estimatedScore, displayValue: `~${(responseTime / 1000).toFixed(1)}s`, category: 'needs-improvement' },
          speedIndex: { value: responseTime * 1.2, score: estimatedScore, displayValue: `~${(responseTime * 1.2 / 1000).toFixed(1)}s`, category: 'needs-improvement' }
        },
        opportunities: [
          {
            title: 'Enable PageSpeed Insights API',
            description: 'Add GOOGLE_PAGESPEED_API_KEY to get real performance data',
            potentialSavings: 'Real data',
            impact: 'high' as const
          }
        ],
        diagnostics: [
          {
            title: 'Limited Performance Data',
            description: 'Using basic server response time only. Enable PageSpeed API for comprehensive analysis.',
            impact: 'medium' as const
          }
        ],
        totalPageSize: contentLength,
        totalRequestCount: 1,
        loadTime: responseTime,
        isSuccess: true
      }
    } catch (error) {
      return {
        performanceScore: 0,
        coreWebVitals: {
          lcp: { value: 0, score: 0, displayValue: 'Error', category: 'poor' },
          fid: { value: 0, score: 0, displayValue: 'Error', category: 'poor' },
          cls: { value: 0, score: 0, displayValue: 'Error', category: 'poor' },
          fcp: { value: 0, score: 0, displayValue: 'Error', category: 'poor' },
          speedIndex: { value: 0, score: 0, displayValue: 'Error', category: 'poor' }
        },
        opportunities: [],
        diagnostics: [],
        totalPageSize: 0,
        totalRequestCount: 0,
        loadTime: 0,
        isSuccess: false,
        error: 'Failed to fetch URL for performance analysis'
      }
    }
  }

  /**
   * Estimate performance score based on basic metrics
   */
  private static estimatePerformanceScore(responseTime: number, size: number): number {
    let score = 100
    
    // Penalize slow response times
    if (responseTime > 3000) score -= 40
    else if (responseTime > 1000) score -= 20
    else if (responseTime > 500) score -= 10
    
    // Penalize large page sizes
    if (size > 3000000) score -= 20 // > 3MB
    else if (size > 1000000) score -= 10 // > 1MB
    
    return Math.max(0, score)
  }
}
