'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Download, ExternalLink, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScoreCircle } from '@/components/ui/score-circle'
import { Progress } from '@/components/ui/progress'
import { BrowserPreview } from './browser-preview'
import { AdvancedSEOFeatures } from './advanced-seo-features'
import { CompetitorAnalysis } from './competitor-analysis'
import { TechnicalSEOAudit } from './technical-seo-audit'
import { SEOActionPlan } from './seo-action-plan'
import { MetaSection } from './meta-section'
import { PageQualitySection } from './page-quality-section'
import { LinkStructureSection } from './link-structure-section'
import { PerformanceSection } from './performance-section'
import { CrawlabilitySection } from './crawlability-section'
import { ExternalFactorsSection } from './external-factors-section'
import { SEOAnalysis } from '@/types/seo'
import { getScoreColor } from '@/lib/utils'

interface ResultsDashboardProps {
  analysis: SEOAnalysis
  onExportPDF?: () => void
  isExporting?: boolean
}

export function ResultsDashboard({ analysis, onExportPDF, isExporting = false }: ResultsDashboardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { text: 'Excellent', variant: 'success' as const }
    if (score >= 60) return { text: 'Good', variant: 'warning' as const }
    return { text: 'Needs Work', variant: 'error' as const }
  }

  const scoreStatus = getScoreStatus(analysis.overallScore)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">SEO Analysis Report</h1>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <a 
                      href={analysis.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium truncate max-w-md"
                    >
                      {analysis.url}
                    </a>
                  </div>
                  <div className="text-sm text-gray-500">
                    Analyzed on {formatDate(analysis.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <ScoreCircle score={analysis.overallScore} size="lg" />
                  <div className="mt-2">
                    <Badge variant={scoreStatus.variant} className="text-sm">
                      {scoreStatus.text}
                    </Badge>
                  </div>
                </div>
                
                {onExportPDF && (
                  <Button 
                    onClick={onExportPDF}
                    disabled={isExporting}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Browser Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <BrowserPreview 
            url={analysis.url} 
            analysis={analysis}
            loading={false}
          />
        </motion.div>

        {/* SEO Analysis Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <MetaSection data={analysis.sections.meta} />
          <PageQualitySection data={analysis.sections.pageQuality} />
          <LinkStructureSection data={analysis.sections.linkStructure} />
          <PerformanceSection data={analysis.sections.performance} />
          <CrawlabilitySection data={analysis.sections.crawlability} />
          <ExternalFactorsSection data={analysis.sections.externalFactors} />
        </motion.div>

        {/* Advanced SEO Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AdvancedSEOFeatures analysis={analysis} url={analysis.url} />
        </motion.div>

        {/* Technical SEO Audit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TechnicalSEOAudit analysis={analysis} url={analysis.url} />
        </motion.div>

        {/* Competitor Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <CompetitorAnalysis analysis={analysis} url={analysis.url} />
        </motion.div>

        {/* SEO Action Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SEOActionPlan analysis={analysis} url={analysis.url} />
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(analysis.sections).map(([key, section]) => (
                  <div key={key} className="text-center">
                    <ScoreCircle score={section.score} size="sm" className="mx-auto" />
                    <div className="mt-2">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className={`text-xs font-semibold ${getScoreColor(section.score)}`}>
                        {Math.round(section.score)}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
