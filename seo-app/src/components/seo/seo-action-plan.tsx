'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  Calendar,
  Users,
  Zap,
  Star,
  Trophy,
  FileText,
  Download,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface SEOActionPlanProps {
  analysis: any
  url: string
}

interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  category: 'technical' | 'content' | 'off-page' | 'user-experience'
  timeframe: '1-2 weeks' | '2-4 weeks' | '1-3 months' | '3+ months'
  resources: string[]
  steps: string[]
  completed: boolean
  kpis: string[]
}

export function SEOActionPlan({ analysis, url }: SEOActionPlanProps) {
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [showDetailedPlan, setShowDetailedPlan] = useState(false)

  const generateRealActionItems = (): ActionItem[] => {
    const actions: ActionItem[] = []
    
    // Performance-based actions
    const perfSection = analysis.sections.performance
    if (perfSection.score < 80) {
      if (perfSection.responseTime > 3000) {
        actions.push({
          id: 'optimize-server-response',
          title: 'Optimize Server Response Time',
          description: `Server response time is ${(perfSection.responseTime / 1000).toFixed(1)}s - optimize for better performance`,
          priority: 'high',
          effort: 'high',
          impact: 'high',
          category: 'technical',
          timeframe: '1-2 weeks',
          resources: ['Backend Developer', 'DevOps Engineer'],
          steps: [
            'Analyze server performance bottlenecks',
            'Optimize database queries',
            'Implement server-side caching',
            'Consider CDN implementation',
            'Monitor server metrics'
          ],
          completed: false,
          kpis: ['Server response time', 'Time to First Byte', 'Performance score']
        })
      }
      
      if (perfSection.pageSize > 3000000) {
        actions.push({
          id: 'reduce-page-weight',
          title: 'Reduce Page Weight',
          description: `Page size is ${(perfSection.pageSize / 1000000).toFixed(1)}MB - optimize resources`,
          priority: 'high',
          effort: 'medium',
          impact: 'high',
          category: 'technical',
          timeframe: '1-2 weeks',
          resources: ['Frontend Developer'],
          steps: [
            'Compress and optimize images',
            'Minify CSS and JavaScript',
            'Remove unused resources',
            'Implement lazy loading',
            'Enable GZIP compression'
          ],
          completed: false,
          kpis: ['Page size', 'Load time', 'Core Web Vitals']
        })
      }
    }
    
    // Meta and content issues
    const metaSection = analysis.sections.meta
    if (metaSection.title.issues.length > 0) {
      actions.push({
        id: 'fix-title-issues',
        title: 'Fix Title Tag Issues',
        description: `Address title problems: ${metaSection.title.issues.join(', ')}`,
        priority: 'high',
        effort: 'low',
        impact: 'high',
        category: 'content',
        timeframe: '1 week',
        resources: ['SEO Specialist', 'Content Writer'],
        steps: [
          'Review current title tag',
          'Optimize length (30-60 characters)',
          'Include target keywords',
          'Make it compelling for clicks',
          'Test and validate changes'
        ],
        completed: false,
        kpis: ['Click-through rate', 'Search rankings', 'Title tag optimization']
      })
    }
    
    if (metaSection.description.issues.length > 0) {
      actions.push({
        id: 'fix-meta-description',
        title: 'Optimize Meta Description',
        description: `Fix meta description: ${metaSection.description.issues.join(', ')}`,
        priority: 'medium',
        effort: 'low',
        impact: 'medium',
        category: 'content',
        timeframe: '1 week',
        resources: ['SEO Specialist', 'Content Writer'],
        steps: [
          'Write compelling meta descriptions',
          'Keep within 120-160 characters',
          'Include call-to-action',
          'Match search intent',
          'A/B test different versions'
        ],
        completed: false,
        kpis: ['Click-through rate', 'Meta description optimization', 'SERP appearance']
      })
    }
    
    // Crawlability issues
    const crawlSection = analysis.sections.crawlability
    if (!crawlSection.sitemap.exists) {
      actions.push({
        id: 'create-xml-sitemap',
        title: 'Create XML Sitemap',
        description: 'Generate and submit XML sitemap to help search engines discover your pages',
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        category: 'technical',
        timeframe: '1 week',
        resources: ['Developer', 'SEO Specialist'],
        steps: [
          'Generate comprehensive XML sitemap',
          'Include all important pages',
          'Add proper priority and frequency',
          'Submit to Google Search Console',
          'Monitor sitemap status'
        ],
        completed: false,
        kpis: ['Pages indexed', 'Crawl efficiency', 'Search visibility']
      })
    }
    
    if (!crawlSection.robotsTxt.exists) {
      actions.push({
        id: 'create-robots-txt',
        title: 'Implement robots.txt',
        description: 'Create robots.txt file to guide search engine crawling',
        priority: 'medium',
        effort: 'low',
        impact: 'medium',
        category: 'technical',
        timeframe: '1 week',
        resources: ['Developer', 'SEO Specialist'],
        steps: [
          'Create robots.txt file',
          'Define crawling rules',
          'Include sitemap location',
          'Test with robots.txt tester',
          'Monitor crawl behavior'
        ],
        completed: false,
        kpis: ['Crawl efficiency', 'Bot guidance', 'SEO compliance']
      })
    }
    
    // External factors
    const extFactors = analysis.sections.externalFactors
    if (!extFactors.https) {
      actions.push({
        id: 'enable-https',
        title: 'Enable HTTPS Security',
        description: 'Implement SSL certificate for secure connections and SEO benefits',
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        category: 'technical',
        timeframe: '1 week',
        resources: ['DevOps Engineer', 'Developer'],
        steps: [
          'Obtain SSL certificate',
          'Configure HTTPS redirects',
          'Update internal links',
          'Test security implementation',
          'Monitor HTTPS status'
        ],
        completed: false,
        kpis: ['Security score', 'Trust indicators', 'Search rankings']
      })
    }
    
    if (!extFactors.schemaMarkup.exists) {
      actions.push({
        id: 'implement-schema',
        title: 'Add Structured Data',
        description: 'Implement schema markup for rich snippets and better search appearance',
        priority: 'medium',
        effort: 'medium',
        impact: 'medium',
        category: 'technical',
        timeframe: '1-2 weeks',
        resources: ['Developer', 'SEO Specialist'],
        steps: [
          'Identify relevant schema types',
          'Implement JSON-LD markup',
          'Validate with testing tools',
          'Monitor rich snippet appearance',
          'Expand to other content types'
        ],
        completed: false,
        kpis: ['Rich snippet appearance', 'Click-through rate', 'SERP features']
      })
    }
    
    // Link structure improvements
    const linkSection = analysis.sections.linkStructure
    if (linkSection.score < 70) {
      actions.push({
        id: 'improve-internal-linking',
        title: 'Optimize Internal Link Structure',
        description: 'Improve internal linking for better SEO and user navigation',
        priority: 'medium',
        effort: 'medium',
        impact: 'medium',
        category: 'content',
        timeframe: '2-3 weeks',
        resources: ['SEO Specialist', 'Content Writer'],
        steps: [
          'Audit current link structure',
          'Identify linking opportunities',
          'Create topic clusters',
          'Implement strategic internal links',
          'Monitor link performance'
        ],
        completed: false,
        kpis: ['Internal link distribution', 'Page authority flow', 'User engagement']
      })
    }
    
    // If overall score is good, add maintenance tasks
    if (analysis.overallScore > 80) {
      actions.push({
        id: 'seo-monitoring',
        title: 'SEO Performance Monitoring',
        description: 'Set up ongoing monitoring to maintain excellent SEO performance',
        priority: 'low',
        effort: 'low',
        impact: 'medium',
        category: 'technical',
        timeframe: '1 week',
        resources: ['SEO Specialist'],
        steps: [
          'Set up automated monitoring',
          'Create performance alerts',
          'Schedule regular audits',
          'Track competitor changes',
          'Monitor algorithm updates'
        ],
        completed: false,
        kpis: ['SEO stability', 'Performance trends', 'Competitive position']
      })
    }
    
    return actions
  }
  
  const actionItems: ActionItem[] = generateRealActionItems()

  const toggleTaskCompletion = (taskId: string) => {
    const newCompleted = new Set(completedTasks)
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId)
    } else {
      newCompleted.add(taskId)
    }
    setCompletedTasks(newCompleted)
  }

  const filteredItems = selectedPriority === 'all' 
    ? actionItems 
    : actionItems.filter(item => item.priority === selectedPriority)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'high': return <Badge variant="destructive">High Effort</Badge>
      case 'medium': return <Badge variant="secondary">Medium Effort</Badge>
      case 'low': return <Badge variant="default">Low Effort</Badge>
      default: return null
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="default">High Impact</Badge>
      case 'medium': return <Badge variant="secondary">Medium Impact</Badge>
      case 'low': return <Badge variant="outline">Low Impact</Badge>
      default: return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Zap className="h-4 w-4" />
      case 'content': return <FileText className="h-4 w-4" />
      case 'off-page': return <TrendingUp className="h-4 w-4" />
      case 'user-experience': return <Users className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const completionRate = (completedTasks.size / actionItems.length) * 100
  const highPriorityItems = actionItems.filter(item => item.priority === 'high')
  const completedHighPriority = highPriorityItems.filter(item => completedTasks.has(item.id)).length

  return (
    <div className="space-y-6">
      {/* Action Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            SEO Action Plan & Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{actionItems.length}</div>
              <div className="text-sm text-gray-600">Total Actions</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{highPriorityItems.length}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedTasks.size}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round(completionRate)}%</div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{completedTasks.size}/{actionItems.length} tasks</span>
            </div>
            <Progress value={completionRate} />
          </div>

          {/* Priority Filters */}
          <div className="flex space-x-2 mb-6">
            {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
              <Button
                key={priority}
                variant={selectedPriority === priority ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority(priority)}
                className="capitalize"
              >
                {priority === 'all' ? 'All Tasks' : `${priority} Priority`}
              </Button>
            ))}
          </div>

          {/* Action Items */}
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${completedTasks.has(item.id) ? 'opacity-60 bg-gray-50' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleTaskCompletion(item.id)}
                      className="mt-1"
                    >
                      {completedTasks.has(item.id) ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        <div className="h-4 w-4 border-2 border-gray-300 rounded" />
                      }
                    </Button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(item.category)}
                        <h4 className={`font-medium ${completedTasks.has(item.id) ? 'line-through' : ''}`}>
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority} priority
                        </Badge>
                        {getEffortBadge(item.effort)}
                        {getImpactBadge(item.impact)}
                        <Badge variant="outline" className="capitalize">
                          {item.category.replace('-', ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.timeframe}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.resources.join(', ')}
                        </div>
                      </div>

                      {showDetailedPlan && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-sm mb-2">Action Steps:</h5>
                              <ul className="text-xs space-y-1">
                                {item.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2">
                                    <ChevronRight className="h-3 w-3 mt-0.5 text-gray-400" />
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm mb-2">Success Metrics:</h5>
                              <ul className="text-xs space-y-1">
                                {item.kpis.map((kpi, kpiIndex) => (
                                  <li key={kpiIndex} className="flex items-start gap-2">
                                    <Star className="h-3 w-3 mt-0.5 text-yellow-500" />
                                    {kpi}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDetailedPlan(!showDetailedPlan)}
            >
              {showDetailedPlan ? 'Hide' : 'Show'} Detailed Action Steps
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Quick Wins (Low Effort, High Impact)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionItems
              .filter(item => item.effort === 'low' && item.impact === 'high')
              .map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-medium">{item.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{item.timeframe}</span>
                    <Badge variant="default">Quick Win</Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            Export Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export as PDF
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Create Project Timeline
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assign to Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
