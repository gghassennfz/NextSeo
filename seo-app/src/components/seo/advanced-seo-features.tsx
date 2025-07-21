'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Search, 
  Zap, 
  Smartphone, 
  Eye, 
  Target,
  BarChart3,
  Clock,
  Globe,
  Shield,
  Accessibility,
  Share2,
  Code,
  Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface AdvancedSEOFeaturesProps {
  analysis: any
  url: string
}

export function AdvancedSEOFeatures({ analysis, url }: AdvancedSEOFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'mobile' | 'accessibility' | 'social'>('performance')

  // Mock advanced analysis data (in real app, this would come from APIs)
  const advancedMetrics = {
    performance: {
      coreWebVitals: {
        lcp: { value: 2.1, threshold: 2.5, status: 'good' }, // Largest Contentful Paint
        fid: { value: 85, threshold: 100, status: 'good' }, // First Input Delay
        cls: { value: 0.08, threshold: 0.1, status: 'good' }, // Cumulative Layout Shift
      },
      speedIndex: 3.2,
      ttfb: 0.8, // Time to First Byte
      totalBlockingTime: 150,
    },
    mobile: {
      responsiveDesign: 92,
      touchTargets: 88,
      textSize: 95,
      viewportConfig: true,
      mobileUsability: 89,
    },
    accessibility: {
      colorContrast: 94,
      altText: analysis?.sections?.pageQuality?.imagesWithAlt || 0,
      headingStructure: 87,
      keyboardNavigation: 91,
      ariaLabels: 73,
      wcagCompliance: 'AA',
    },
    social: {
      openGraph: analysis?.sections?.externalFactors?.openGraphTags || 0,
      twitterCard: analysis?.sections?.externalFactors?.twitterCard || false,
      socialSharing: 85,
      brandMentions: 12,
    },
    seo: {
      keywordDensity: [
        { keyword: 'SEO', density: 2.3, count: 15 },
        { keyword: 'website', density: 1.8, count: 12 },
        { keyword: 'analysis', density: 1.5, count: 10 },
      ],
      competitorGap: 23,
      backlinksEstimate: 156,
      domainAuthority: 45,
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 70) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Advanced Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Advanced SEO Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Core Web Vitals */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Core Web Vitals</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">LCP</span>
                  <Badge variant={advancedMetrics.performance.coreWebVitals.lcp.status === 'good' ? 'default' : 'destructive'}>
                    {advancedMetrics.performance.coreWebVitals.lcp.value}s
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">FID</span>
                  <Badge variant={advancedMetrics.performance.coreWebVitals.fid.status === 'good' ? 'default' : 'destructive'}>
                    {advancedMetrics.performance.coreWebVitals.fid.value}ms
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">CLS</span>
                  <Badge variant={advancedMetrics.performance.coreWebVitals.cls.status === 'good' ? 'default' : 'destructive'}>
                    {advancedMetrics.performance.coreWebVitals.cls.value}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Mobile Performance */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-1">
                <Smartphone className="h-4 w-4" />
                Mobile Score
              </h4>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(advancedMetrics.mobile.mobileUsability)}`}>
                  {advancedMetrics.mobile.mobileUsability}
                </div>
                <Progress value={advancedMetrics.mobile.mobileUsability} className="mt-2" />
                <p className="text-xs text-gray-600 mt-1">Mobile Usability</p>
              </div>
            </div>

            {/* Accessibility */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-1">
                <Accessibility className="h-4 w-4" />
                Accessibility
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">WCAG</span>
                  <Badge variant="default">{advancedMetrics.accessibility.wcagCompliance}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Color Contrast</span>
                  <span className={`text-xs font-semibold ${getScoreColor(advancedMetrics.accessibility.colorContrast)}`}>
                    {advancedMetrics.accessibility.colorContrast}%
                  </span>
                </div>
              </div>
            </div>

            {/* SEO Authority */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-1">
                <Target className="h-4 w-4" />
                SEO Authority
              </h4>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(advancedMetrics.seo.domainAuthority)}`}>
                  {advancedMetrics.seo.domainAuthority}
                </div>
                <Progress value={advancedMetrics.seo.domainAuthority} className="mt-2" />
                <p className="text-xs text-gray-600 mt-1">Domain Authority</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['performance', 'mobile', 'accessibility', 'social'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="flex-1 capitalize"
              >
                {tab === 'performance' && <Zap className="h-4 w-4 mr-1" />}
                {tab === 'mobile' && <Smartphone className="h-4 w-4 mr-1" />}
                {tab === 'accessibility' && <Accessibility className="h-4 w-4 mr-1" />}
                {tab === 'social' && <Share2 className="h-4 w-4 mr-1" />}
                {tab}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h3 className="font-semibold">Performance Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Load Time Metrics
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Speed Index</span>
                          <span className="text-sm font-medium">{advancedMetrics.performance.speedIndex}s</span>
                        </div>
                        <Progress value={(4 - advancedMetrics.performance.speedIndex) / 4 * 100} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Time to First Byte</span>
                          <span className="text-sm font-medium">{advancedMetrics.performance.ttfb}s</span>
                        </div>
                        <Progress value={(2 - advancedMetrics.performance.ttfb) / 2 * 100} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Total Blocking Time</span>
                          <span className="text-sm font-medium">{advancedMetrics.performance.totalBlockingTime}ms</span>
                        </div>
                        <Progress value={(300 - advancedMetrics.performance.totalBlockingTime) / 300 * 100} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Optimization Recommendations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span>Image optimization implemented</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                        <span>Consider lazy loading for images</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span>Minify CSS and JavaScript files</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mobile' && (
              <div className="space-y-6">
                <h3 className="font-semibold">Mobile-First Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Mobile Usability</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Responsive Design</span>
                          <span className={`text-sm font-medium ${getScoreColor(advancedMetrics.mobile.responsiveDesign)}`}>
                            {advancedMetrics.mobile.responsiveDesign}%
                          </span>
                        </div>
                        <Progress value={advancedMetrics.mobile.responsiveDesign} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Touch Targets</span>
                          <span className={`text-sm font-medium ${getScoreColor(advancedMetrics.mobile.touchTargets)}`}>
                            {advancedMetrics.mobile.touchTargets}%
                          </span>
                        </div>
                        <Progress value={advancedMetrics.mobile.touchTargets} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Text Readability</span>
                          <span className={`text-sm font-medium ${getScoreColor(advancedMetrics.mobile.textSize)}`}>
                            {advancedMetrics.mobile.textSize}%
                          </span>
                        </div>
                        <Progress value={advancedMetrics.mobile.textSize} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Mobile SEO Factors</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Viewport Meta Tag</span>
                        <Badge variant={advancedMetrics.mobile.viewportConfig ? 'default' : 'destructive'}>
                          {advancedMetrics.mobile.viewportConfig ? 'Present' : 'Missing'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mobile-Friendly Test</span>
                        <Badge variant="default">Passed</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Page Load Speed (Mobile)</span>
                        <Badge variant="secondary">Good</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <h3 className="font-semibold">Accessibility Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">WCAG Compliance</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Color Contrast</span>
                          <span className={`text-sm font-medium ${getScoreColor(advancedMetrics.accessibility.colorContrast)}`}>
                            {advancedMetrics.accessibility.colorContrast}%
                          </span>
                        </div>
                        <Progress value={advancedMetrics.accessibility.colorContrast} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Heading Structure</span>
                          <span className={`text-sm font-medium ${getScoreColor(advancedMetrics.accessibility.headingStructure)}`}>
                            {advancedMetrics.accessibility.headingStructure}%
                          </span>
                        </div>
                        <Progress value={advancedMetrics.accessibility.headingStructure} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Keyboard Navigation</span>
                          <span className={`text-sm font-medium ${getScoreColor(advancedMetrics.accessibility.keyboardNavigation)}`}>
                            {advancedMetrics.accessibility.keyboardNavigation}%
                          </span>
                        </div>
                        <Progress value={advancedMetrics.accessibility.keyboardNavigation} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Accessibility Features</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Alt Text Coverage</span>
                        <Badge variant={advancedMetrics.accessibility.altText > 80 ? 'default' : 'secondary'}>
                          {advancedMetrics.accessibility.altText}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ARIA Labels</span>
                        <Badge variant={advancedMetrics.accessibility.ariaLabels > 80 ? 'default' : 'secondary'}>
                          {advancedMetrics.accessibility.ariaLabels}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>WCAG Level</span>
                        <Badge variant="default">{advancedMetrics.accessibility.wcagCompliance}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <h3 className="font-semibold">Social Media & Sharing Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Social Meta Tags</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Open Graph Tags</span>
                        <Badge variant={advancedMetrics.social.openGraph > 3 ? 'default' : 'secondary'}>
                          {advancedMetrics.social.openGraph} tags
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Twitter Card</span>
                        <Badge variant={advancedMetrics.social.twitterCard ? 'default' : 'destructive'}>
                          {advancedMetrics.social.twitterCard ? 'Present' : 'Missing'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Social Sharing Score</span>
                        <span className={`font-medium ${getScoreColor(advancedMetrics.social.socialSharing)}`}>
                          {advancedMetrics.social.socialSharing}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Social Presence</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Brand Mentions</span>
                        <Badge variant="secondary">{advancedMetrics.social.brandMentions}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Social Media Links</span>
                        <Badge variant="secondary">3 platforms</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Structured Data</span>
                        <Badge variant="default">Schema.org</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-green-600" />
            Keyword Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advancedMetrics.seo.keywordDensity.map((keyword, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{keyword.keyword}</span>
                    <Badge variant="secondary">{keyword.density}%</Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {keyword.count} occurrences
                  </div>
                  <Progress value={keyword.density * 10} className="mt-2" />
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{advancedMetrics.seo.backlinksEstimate}</div>
                  <div className="text-sm text-gray-600">Estimated Backlinks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{advancedMetrics.seo.domainAuthority}</div>
                  <div className="text-sm text-gray-600">Domain Authority</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{advancedMetrics.seo.competitorGap}%</div>
                  <div className="text-sm text-gray-600">Competitor Gap</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
