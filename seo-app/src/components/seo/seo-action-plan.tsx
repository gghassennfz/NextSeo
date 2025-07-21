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

  // Comprehensive action items based on analysis
  const actionItems: ActionItem[] = [
    {
      id: 'fix-title-tags',
      title: 'Fix Duplicate Title Tags',
      description: 'Create unique, compelling title tags for all pages to improve click-through rates',
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      category: 'technical',
      timeframe: '1-2 weeks',
      resources: ['SEO Specialist', 'Developer'],
      steps: [
        'Audit all existing title tags',
        'Create unique titles for each page',
        'Implement title tag optimization',
        'Test and validate changes'
      ],
      completed: false,
      kpis: ['Click-through rate', 'Search rankings', 'Impressions']
    },
    {
      id: 'optimize-page-speed',
      title: 'Optimize Page Loading Speed',
      description: 'Improve Core Web Vitals to enhance user experience and search rankings',
      priority: 'high',
      effort: 'high',
      impact: 'high',
      category: 'technical',
      timeframe: '2-4 weeks',
      resources: ['Frontend Developer', 'DevOps Engineer'],
      steps: [
        'Compress and optimize images',
        'Minify CSS and JavaScript',
        'Implement lazy loading',
        'Optimize server response time',
        'Enable browser caching'
      ],
      completed: false,
      kpis: ['Page load time', 'Core Web Vitals', 'Bounce rate']
    },
    {
      id: 'content-optimization',
      title: 'Optimize Content for Target Keywords',
      description: 'Enhance content to better target primary and secondary keywords',
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      category: 'content',
      timeframe: '2-4 weeks',
      resources: ['Content Writer', 'SEO Specialist'],
      steps: [
        'Conduct keyword research',
        'Analyze competitor content',
        'Update existing content',
        'Create new targeted content',
        'Optimize internal linking'
      ],
      completed: false,
      kpis: ['Keyword rankings', 'Organic traffic', 'Time on page']
    },
    {
      id: 'mobile-optimization',
      title: 'Implement Mobile-First Design',
      description: 'Ensure optimal mobile experience across all devices',
      priority: 'high',
      effort: 'high',
      impact: 'high',
      category: 'user-experience',
      timeframe: '2-4 weeks',
      resources: ['UX Designer', 'Frontend Developer'],
      steps: [
        'Audit mobile usability',
        'Fix touch target issues',
        'Optimize mobile page speed',
        'Test across devices',
        'Implement responsive design improvements'
      ],
      completed: false,
      kpis: ['Mobile usability score', 'Mobile traffic', 'Mobile conversions']
    },
    {
      id: 'schema-markup',
      title: 'Implement Structured Data',
      description: 'Add schema markup to enhance search result appearance',
      priority: 'medium',
      effort: 'medium',
      impact: 'medium',
      category: 'technical',
      timeframe: '1-2 weeks',
      resources: ['Developer', 'SEO Specialist'],
      steps: [
        'Identify relevant schema types',
        'Implement structured data',
        'Validate with testing tools',
        'Monitor rich snippets'
      ],
      completed: false,
      kpis: ['Rich snippet appearance', 'Click-through rate', 'SERP visibility']
    },
    {
      id: 'link-building',
      title: 'Strategic Link Building Campaign',
      description: 'Build high-quality backlinks to improve domain authority',
      priority: 'medium',
      effort: 'high',
      impact: 'high',
      category: 'off-page',
      timeframe: '3+ months',
      resources: ['SEO Specialist', 'Content Writer', 'Outreach Specialist'],
      steps: [
        'Identify link opportunities',
        'Create linkable content assets',
        'Conduct competitor backlink analysis',
        'Execute outreach campaigns',
        'Monitor link acquisition'
      ],
      completed: false,
      kpis: ['Domain authority', 'Referring domains', 'Backlink quality']
    },
    {
      id: 'local-seo',
      title: 'Optimize for Local Search',
      description: 'Improve local search visibility and Google My Business presence',
      priority: 'medium',
      effort: 'low',
      impact: 'medium',
      category: 'off-page',
      timeframe: '1-2 weeks',
      resources: ['SEO Specialist', 'Marketing Team'],
      steps: [
        'Optimize Google My Business profile',
        'Ensure NAP consistency',
        'Gather customer reviews',
        'Create local content',
        'Build local citations'
      ],
      completed: false,
      kpis: ['Local rankings', 'Google My Business views', 'Local traffic']
    },
    {
      id: 'analytics-setup',
      title: 'Advanced Analytics Implementation',
      description: 'Set up comprehensive tracking and monitoring systems',
      priority: 'low',
      effort: 'medium',
      impact: 'medium',
      category: 'technical',
      timeframe: '1-2 weeks',
      resources: ['Developer', 'Analytics Specialist'],
      steps: [
        'Implement Google Analytics 4',
        'Set up Search Console',
        'Configure conversion tracking',
        'Create custom dashboards',
        'Set up automated reporting'
      ],
      completed: false,
      kpis: ['Data accuracy', 'Conversion tracking', 'Report completeness']
    }
  ]

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
