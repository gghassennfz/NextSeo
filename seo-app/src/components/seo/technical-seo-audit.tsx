'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Server, 
  Shield, 
  Code, 
  Database, 
  Zap,
  Globe,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Link,
  Image,
  Smartphone,
  Monitor
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface TechnicalSEOAuditProps {
  analysis: any
  url: string
}

interface TechnicalIssue {
  type: 'error' | 'warning' | 'success'
  category: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  howToFix: string
}

export function TechnicalSEOAudit({ analysis, url }: TechnicalSEOAuditProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'errors' | 'warnings' | 'success'>('all')
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set())

  // Mock technical SEO issues (in real app, this would come from comprehensive crawling)
  const technicalIssues: TechnicalIssue[] = [
    {
      type: 'error',
      category: 'Crawlability',
      title: 'Missing XML Sitemap',
      description: 'No XML sitemap found at /sitemap.xml',
      impact: 'high',
      howToFix: 'Create and submit an XML sitemap to help search engines discover your pages'
    },
    {
      type: 'warning',
      category: 'Page Speed',
      title: 'Large Images Not Optimized',
      description: '12 images larger than 100KB found',
      impact: 'medium',
      howToFix: 'Compress images using WebP format and implement lazy loading'
    },
    {
      type: 'error',
      category: 'Mobile',
      title: 'Viewport Meta Tag Missing',
      description: 'Mobile viewport not properly configured',
      impact: 'high',
      howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to head'
    },
    {
      type: 'warning',
      category: 'Security',
      title: 'Mixed Content Issues',
      description: '3 HTTP resources loaded on HTTPS page',
      impact: 'medium',
      howToFix: 'Update all HTTP resources to HTTPS or use protocol-relative URLs'
    },
    {
      type: 'success',
      category: 'Security',
      title: 'SSL Certificate Valid',
      description: 'HTTPS properly configured with valid certificate',
      impact: 'low',
      howToFix: 'No action needed - good job!'
    },
    {
      type: 'error',
      category: 'Content',
      title: 'Duplicate Title Tags',
      description: '5 pages have identical title tags',
      impact: 'high',
      howToFix: 'Create unique, descriptive title tags for each page'
    },
    {
      type: 'warning',
      category: 'Structure',
      title: 'Missing H1 Tags',
      description: '3 pages missing H1 heading tags',
      impact: 'medium',
      howToFix: 'Add descriptive H1 tags to each page for better structure'
    },
    {
      type: 'success',
      category: 'Performance',
      title: 'GZIP Compression Enabled',
      description: 'Server compression properly configured',
      impact: 'low',
      howToFix: 'No action needed - performance optimized'
    }
  ]

  const technicalMetrics = {
    crawlability: {
      robotsTxt: { status: 'found', score: 100 },
      xmlSitemap: { status: 'missing', score: 0 },
      internalLinking: { score: 78 },
      crawlDepth: { avg: 3.2, max: 6 },
      crawlErrors: 5
    },
    indexability: {
      indexablePages: 23,
      nonIndexablePages: 3,
      canonicalIssues: 2,
      metaRobotsIssues: 1
    },
    technicalHealth: {
      httpStatus: { '200': 85, '301': 12, '404': 3 },
      duplicateContent: 15,
      brokenLinks: 7,
      redirectChains: 4
    },
    performance: {
      serverResponse: 0.8,
      pageSize: 2.3,
      requests: 45,
      cacheHeaders: 'partial'
    }
  }

  const toggleIssue = (index: number) => {
    const newExpanded = new Set(expandedIssues)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedIssues(newExpanded)
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      default: return null
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'success': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive">High Impact</Badge>
      case 'medium': return <Badge variant="secondary">Medium Impact</Badge>
      case 'low': return <Badge variant="default">Low Impact</Badge>
      default: return null
    }
  }

  const filteredIssues = activeCategory === 'all' 
    ? technicalIssues 
    : technicalIssues.filter(issue => {
        if (activeCategory === 'errors') return issue.type === 'error'
        if (activeCategory === 'warnings') return issue.type === 'warning'
        if (activeCategory === 'success') return issue.type === 'success'
        return true
      })

  const issueCount = {
    errors: technicalIssues.filter(i => i.type === 'error').length,
    warnings: technicalIssues.filter(i => i.type === 'warning').length,
    success: technicalIssues.filter(i => i.type === 'success').length
  }

  return (
    <div className="space-y-6">
      {/* Technical SEO Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-600" />
            Technical SEO Audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{issueCount.errors}</div>
              <div className="text-sm text-gray-600">Critical Errors</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{issueCount.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{issueCount.success}</div>
              <div className="text-sm text-gray-600">Passed Tests</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((issueCount.success / technicalIssues.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Health Score</div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2 mb-6">
            {(['all', 'errors', 'warnings', 'success'] as const).map((filter) => (
              <Button
                key={filter}
                variant={activeCategory === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(filter)}
                className="capitalize"
              >
                {filter === 'all' && 'All Issues'}
                {filter === 'errors' && `Errors (${issueCount.errors})`}
                {filter === 'warnings' && `Warnings (${issueCount.warnings})`}
                {filter === 'success' && `Passed (${issueCount.success})`}
              </Button>
            ))}
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            {filteredIssues.map((issue, index) => (
              <Collapsible key={index}>
                <div className={`border rounded-lg p-4 ${getIssueColor(issue.type)}`}>
                  <CollapsibleTrigger 
                    className="w-full"
                    onClick={() => toggleIssue(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getIssueIcon(issue.type)}
                        <div className="text-left">
                          <div className="font-medium">{issue.title}</div>
                          <div className="text-sm text-gray-600">{issue.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getImpactBadge(issue.impact)}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-4">
                    <div className="space-y-3 pl-7">
                      <div>
                        <div className="font-medium text-sm">Description:</div>
                        <div className="text-sm text-gray-600">{issue.description}</div>
                      </div>
                      <div>
                        <div className="font-medium text-sm">How to Fix:</div>
                        <div className="text-sm text-gray-600">{issue.howToFix}</div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crawlability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-green-600" />
              Crawlability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Internal Linking</span>
                <span className="text-sm font-medium">{technicalMetrics.crawlability.internalLinking.score}%</span>
              </div>
              <Progress value={technicalMetrics.crawlability.internalLinking.score} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Robots.txt</div>
                <Badge variant={technicalMetrics.crawlability.robotsTxt.status === 'found' ? 'default' : 'destructive'}>
                  {technicalMetrics.crawlability.robotsTxt.status}
                </Badge>
              </div>
              <div>
                <div className="text-gray-600">XML Sitemap</div>
                <Badge variant={technicalMetrics.crawlability.xmlSitemap.status === 'found' ? 'default' : 'destructive'}>
                  {technicalMetrics.crawlability.xmlSitemap.status}
                </Badge>
              </div>
              <div>
                <div className="text-gray-600">Avg Crawl Depth</div>
                <div className="font-semibold">{technicalMetrics.crawlability.crawlDepth.avg}</div>
              </div>
              <div>
                <div className="text-gray-600">Crawl Errors</div>
                <div className="font-semibold text-red-600">{technicalMetrics.crawlability.crawlErrors}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indexability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-blue-600" />
              Indexability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded">
                <div className="text-xl font-bold text-green-600">
                  {technicalMetrics.indexability.indexablePages}
                </div>
                <div className="text-xs text-gray-600">Indexable Pages</div>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <div className="text-xl font-bold text-red-600">
                  {technicalMetrics.indexability.nonIndexablePages}
                </div>
                <div className="text-xs text-gray-600">Non-Indexable</div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Canonical Issues</span>
                <span className="font-semibold text-yellow-600">
                  {technicalMetrics.indexability.canonicalIssues}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meta Robots Issues</span>
                <span className="font-semibold text-yellow-600">
                  {technicalMetrics.indexability.metaRobotsIssues}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-purple-600" />
              Technical Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">HTTP Status Codes</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">200 OK</span>
                  <span>{technicalMetrics.technicalHealth.httpStatus['200']}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-yellow-600">301 Redirects</span>
                  <span>{technicalMetrics.technicalHealth.httpStatus['301']}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-600">404 Errors</span>
                  <span>{technicalMetrics.technicalHealth.httpStatus['404']}%</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Duplicate Content</div>
                <div className="font-semibold text-orange-600">
                  {technicalMetrics.technicalHealth.duplicateContent}%
                </div>
              </div>
              <div>
                <div className="text-gray-600">Broken Links</div>
                <div className="font-semibold text-red-600">
                  {technicalMetrics.technicalHealth.brokenLinks}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-600" />
              Technical Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Server Response Time</span>
                <span className="text-sm font-medium">{technicalMetrics.performance.serverResponse}s</span>
              </div>
              <Progress value={(2 - technicalMetrics.performance.serverResponse) / 2 * 100} />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Page Size</div>
                <div className="font-semibold">{technicalMetrics.performance.pageSize}MB</div>
              </div>
              <div>
                <div className="text-gray-600">HTTP Requests</div>
                <div className="font-semibold">{technicalMetrics.performance.requests}</div>
              </div>
              <div>
                <div className="text-gray-600">Cache Headers</div>
                <Badge variant={technicalMetrics.performance.cacheHeaders === 'optimal' ? 'default' : 'secondary'}>
                  {technicalMetrics.performance.cacheHeaders}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
