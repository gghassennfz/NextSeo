'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Globe, 
  Search,
  BarChart3,
  Target,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface CompetitorAnalysisProps {
  analysis: any
  url: string
}

interface Competitor {
  domain: string
  score: number
  traffic: string
  keywords: number
  backlinks: number
  contentGap: number
  trend: 'up' | 'down' | 'stable'
}

export function CompetitorAnalysis({ analysis, url }: CompetitorAnalysisProps) {
  const [activeView, setActiveView] = useState<'overview' | 'keywords' | 'content' | 'backlinks'>('overview')

  // Mock competitor data (in real app, this would come from competitor analysis APIs)
  const competitors: Competitor[] = [
    {
      domain: 'competitor1.com',
      score: 85,
      traffic: '2.5M',
      keywords: 12543,
      backlinks: 8932,
      contentGap: 23,
      trend: 'up'
    },
    {
      domain: 'competitor2.com', 
      score: 78,
      traffic: '1.8M',
      keywords: 9876,
      backlinks: 6543,
      contentGap: 31,
      trend: 'down'
    },
    {
      domain: 'competitor3.com',
      score: 92,
      traffic: '3.2M', 
      keywords: 15678,
      backlinks: 12456,
      contentGap: 18,
      trend: 'up'
    }
  ]

  const keywordGaps = [
    { keyword: 'seo analysis', difficulty: 65, volume: 8100, yourRank: null, competitorRank: 3 },
    { keyword: 'website audit', difficulty: 58, volume: 5400, yourRank: 15, competitorRank: 2 },
    { keyword: 'seo tools', difficulty: 72, volume: 12100, yourRank: null, competitorRank: 1 },
    { keyword: 'site optimization', difficulty: 51, volume: 3300, yourRank: 8, competitorRank: 4 },
  ]

  const contentOpportunities = [
    {
      topic: 'Technical SEO Guide',
      competitorPages: 3,
      avgWords: 2800,
      socialShares: 1250,
      backlinks: 45
    },
    {
      topic: 'Local SEO Strategies', 
      competitorPages: 2,
      avgWords: 3200,
      socialShares: 890,
      backlinks: 32
    },
    {
      topic: 'Mobile SEO Best Practices',
      competitorPages: 4,
      avgWords: 2400,
      socialShares: 670,
      backlinks: 28
    }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <div className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Competitor Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            {(['overview', 'keywords', 'content', 'backlinks'] as const).map((view) => (
              <Button
                key={view}
                variant={activeView === view ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView(view)}
                className="flex-1 capitalize"
              >
                {view === 'overview' && <BarChart3 className="h-4 w-4 mr-1" />}
                {view === 'keywords' && <Search className="h-4 w-4 mr-1" />}
                {view === 'content' && <Globe className="h-4 w-4 mr-1" />}
                {view === 'backlinks' && <Zap className="h-4 w-4 mr-1" />}
                {view}
              </Button>
            ))}
          </div>

          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {competitors.map((competitor, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-sm">{competitor.domain}</div>
                        {getTrendIcon(competitor.trend)}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">SEO Score</span>
                            <span className={`text-sm font-bold ${getScoreColor(competitor.score)}`}>
                              {competitor.score}
                            </span>
                          </div>
                          <Progress value={competitor.score} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-gray-600">Traffic</div>
                            <div className="font-semibold text-blue-600">{competitor.traffic}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Keywords</div>
                            <div className="font-semibold text-green-600">{competitor.keywords.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Backlinks</div>
                            <div className="font-semibold text-purple-600">{competitor.backlinks.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Content Gap</div>
                            <div className="font-semibold text-orange-600">{competitor.contentGap}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Market Position Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">4th</div>
                      <div className="text-sm text-gray-600">Market Position</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">↑23%</div>
                      <div className="text-sm text-gray-600">Growth Opportunity</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">67</div>
                      <div className="text-sm text-gray-600">Competitive Score</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'keywords' && (
              <div className="space-y-6">
                <h3 className="font-semibold">Keyword Gap Analysis</h3>
                
                <div className="space-y-3">
                  {keywordGaps.map((gap, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{gap.keyword}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Vol: {gap.volume.toLocaleString()}</Badge>
                          <Badge variant={gap.difficulty > 70 ? 'destructive' : gap.difficulty > 50 ? 'secondary' : 'default'}>
                            KD: {gap.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Your Rank: </span>
                          <span className="font-semibold">
                            {gap.yourRank ? `#${gap.yourRank}` : 'Not ranking'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Top Competitor: </span>
                          <span className="font-semibold text-red-600">#{gap.competitorRank}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-blue-600 font-medium">
                          {gap.yourRank ? 'Improve ranking' : 'Target this keyword'} - High opportunity
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'content' && (
              <div className="space-y-6">
                <h3 className="font-semibold">Content Gap Opportunities</h3>
                
                <div className="space-y-4">
                  {contentOpportunities.map((opportunity, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium">{opportunity.topic}</div>
                        <Badge variant="default">High Priority</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{opportunity.competitorPages}</div>
                          <div className="text-gray-600">Competitor Pages</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{opportunity.avgWords.toLocaleString()}</div>
                          <div className="text-gray-600">Avg Words</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{opportunity.socialShares}</div>
                          <div className="text-gray-600">Social Shares</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{opportunity.backlinks}</div>
                          <div className="text-gray-600">Avg Backlinks</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        💡 Create comprehensive content on this topic to capture competitor traffic
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'backlinks' && (
              <div className="space-y-6">
                <h3 className="font-semibold">Backlink Gap Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Link Building Opportunities</h4>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Industry Directories</span>
                          <Badge variant="default">High Impact</Badge>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          23 competitors have links from industry directories
                        </div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Guest Posting</span>
                          <Badge variant="secondary">Medium Impact</Badge>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          15 high-authority sites accepting guest posts
                        </div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Resource Pages</span>
                          <Badge variant="default">High Impact</Badge>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          8 resource pages linking to competitors
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Backlink Quality Analysis</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Domain Authority</span>
                          <span className="text-sm font-medium">45/100</span>
                        </div>
                        <Progress value={45} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Link Diversity</span>
                          <span className="text-sm font-medium">67%</span>
                        </div>
                        <Progress value={67} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Toxic Links</span>
                          <span className="text-sm font-medium text-green-600">2%</span>
                        </div>
                        <Progress value={2} className="bg-green-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
