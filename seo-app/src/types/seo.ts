export interface SEOAnalysis {
  url: string
  timestamp: string
  overallScore: number
  sections: {
    meta: MetaAnalysis
    pageQuality: PageQualityAnalysis
    linkStructure: LinkStructureAnalysis
    pageStructure: PageStructureAnalysis
    performance: PerformanceAnalysis
    crawlability: CrawlabilityAnalysis
    externalFactors: ExternalFactorsAnalysis
  }
}

export interface MetaAnalysis {
  score: number
  title: {
    content: string
    length: number
    isOptimal: boolean
    issues: string[]
  }
  description: {
    content: string
    length: number
    isOptimal: boolean
    issues: string[]
  }
  keywords: string
  duplicates: {
    title: boolean
    description: boolean
  }
}

export interface PageQualityAnalysis {
  score: number
  wordCount: number
  imageCount: number
  imagesWithAlt: number
  imagesWithoutAlt: number
  headingsCount: {
    h1: number
    h2: number
    h3: number
    h4: number
    h5: number
    h6: number
  }
  issues: string[]
}

export interface LinkStructureAnalysis {
  score: number
  internalLinks: number
  externalLinks: number
  brokenLinks: string[]
  noFollowLinks: number
  issues: string[]
}

export interface PageStructureAnalysis {
  score: number
  domDepth: number
  headingStructure: {
    h1Count: number
    h1Text: string[]
    missingH1: boolean
    properHierarchy: boolean
  }
  issues: string[]
}

export interface PerformanceAnalysis {
  score: number
  responseTime: number
  pageSize: number
  assetsCount: {
    css: number
    js: number
    images: number
    total: number
  }
  issues: string[]
}

export interface CrawlabilityAnalysis {
  score: number
  robotsTxt: {
    exists: boolean
    content?: string
    blocks: string[]
  }
  sitemap: {
    exists: boolean
    url?: string
  }
  canonical: {
    exists: boolean
    url?: string
    isSelf: boolean
  }
  langAttribute: {
    exists: boolean
    value?: string
  }
  issues: string[]
}

export interface ExternalFactorsAnalysis {
  score: number
  https: boolean
  favicon: {
    exists: boolean
    url?: string
  }
  openGraph: {
    title?: string
    description?: string
    image?: string
    url?: string
    type?: string
  }
  twitterCard: {
    card?: string
    title?: string
    description?: string
    image?: string
  }
  schemaMarkup: {
    exists: boolean
    types: string[]
  }
  issues: string[]
}

export interface User {
  id: string
  email: string
  subscription: 'free' | 'pro'
  dailyScans: number
  lastScanDate: string
  createdAt: string
}

export interface ScanReport {
  id: string
  userId: string
  url: string
  analysis: SEOAnalysis
  createdAt: string
}
