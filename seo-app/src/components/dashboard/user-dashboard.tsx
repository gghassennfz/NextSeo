'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Calendar, ExternalLink, Download, Trash2, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScoreCircle } from '@/components/ui/score-circle'
import { useAuth } from '@/contexts/auth-context'
import { createSupabaseClient, ScanReport } from '@/lib/supabase'

export function UserDashboard() {
  const [reports, setReports] = useState<ScanReport[]>([])
  const [filteredReports, setFilteredReports] = useState<ScanReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good' | 'poor'>('all')
  const { user, profile } = useAuth()
  const supabase = createSupabaseClient()
  
  // Add abort controller for request cancellation
  const abortControllerRef = React.useRef<AbortController | null>(null)

  useEffect(() => {
    if (user?.id) {
      // Small delay to avoid StrictMode double-rendering issues
      const timeoutId = setTimeout(() => {
        fetchReports()
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
        // Cleanup on unmount or dependency change  
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
          abortControllerRef.current = null
        }
      }
    }
  }, [user?.id])

  useEffect(() => {
    filterReports()
  }, [reports, searchQuery, filter])

  const fetchReports = async (retryCount = 0) => {
    try {
      // Ensure user is authenticated
      if (!user?.id) {
        console.log('No authenticated user, skipping report fetch')
        setLoading(false)
        return
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      
      console.log('Fetching reports...', { userId: user.id, retry: retryCount })
      
      // Progressive loading strategy - start small and get smaller on retries
      const limit = retryCount === 0 ? 10 : retryCount === 1 ? 5 : 3
      const timeout = retryCount === 0 ? 15000 : retryCount === 1 ? 10000 : 8000
      
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort()
      }, timeout)
      
      // Optimized query with full type compatibility
      const { data, error } = await supabase
        .from('scan_reports')
        .select('id, user_id, url, title, description, seo_score, performance_score, accessibility_score, best_practices_score, report_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)
        .abortSignal(abortControllerRef.current.signal)
      
      clearTimeout(timeoutId)

      if (error) {
        console.error('Error fetching reports:', error)
        throw error
      }

      console.log(`Reports fetched successfully: ${data?.length || 0} reports (limit: ${limit})`)
      setReports((data || []) as ScanReport[])
      setError(null)
      
    } catch (error: any) {
      // Don't retry if request was aborted (common in React StrictMode)
      if (error.name === 'AbortError' || error.message?.includes('AbortError') || error.code === '20') {
        // Silent handling - no console logs for abort errors
        return
      }
      
      console.error('Error fetching reports:', error)
      
      if (retryCount < 2) {
        console.log(`Retrying fetch reports (attempt ${retryCount + 1}/3) with smaller batch...`)
        setTimeout(() => {
          fetchReports(retryCount + 1)
        }, Math.pow(2, retryCount) * 1000) // Exponential backoff
        return
      }
      
      // Final fallback with helpful error message
      const errorMessage = error.message?.includes('timeout')
        ? 'Database query timeout detected. This may indicate a large dataset or slow database connection. Try refreshing or contact support if this persists.'
        : `Failed to load reports: ${error.message || 'Unknown error'}`
      
      setError(errorMessage)
      setReports([])
      
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  // Helper function to calculate overall score from available scores
  const calculateOverallScore = (report: ScanReport) => {
    const scores: number[] = []
    if (report.seo_score !== null && report.seo_score !== undefined) scores.push(report.seo_score)
    if (report.performance_score !== null && report.performance_score !== undefined) scores.push(report.performance_score)
    if (report.accessibility_score !== null && report.accessibility_score !== undefined) scores.push(report.accessibility_score)
    if (report.best_practices_score !== null && report.best_practices_score !== undefined) scores.push(report.best_practices_score)
    
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
  }

  const filterReports = () => {
    let filtered = reports

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply score filter
    if (filter !== 'all') {
      filtered = filtered.filter(report => {
        const score = calculateOverallScore(report)
        switch (filter) {
          case 'excellent':
            return score >= 80
          case 'good':
            return score >= 60 && score < 80
          case 'poor':
            return score < 60
          default:
            return true
        }
      })
    }

    setFilteredReports(filtered)
  }

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('scan_reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Error deleting report:', error)
        return
      }

      setReports(reports.filter(r => r.id !== reportId))
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const stats = {
    totalScans: reports.length,
    averageScore: reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + calculateOverallScore(r), 0) / reports.length) : 0,
    excellentSites: reports.filter(r => calculateOverallScore(r) >= 80).length,
    scansThisMonth: reports.filter(r => {
      const reportDate = new Date(r.created_at)
      const now = new Date()
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || user?.email}!
          </h1>
          <p className="text-gray-600">
            Track your SEO analysis history and monitor your website improvements.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Scans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ScoreCircle score={stats.averageScore} size="sm" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Badge variant="success" className="text-xs">★</Badge>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Excellent Sites</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.excellentSites}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.scansThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Scores</option>
                  <option value="excellent">Excellent (80+)</option>
                  <option value="good">Good (60-79)</option>
                  <option value="poor">Poor (&lt;60)</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredReports.length} of {reports.length} reports
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading your SEO reports...</p>
            </div>
          </motion.div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Failed to load reports</h3>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchReports()}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Reports List */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {reports.length === 0 ? 'No SEO scans yet' : 'No reports match your filters'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {reports.length === 0 
                      ? 'Start analyzing websites to see your results here.'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                  {reports.length === 0 && (
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Run Your First Scan
                    </Button>
                  )}
                </CardContent>
              </Card>
          ) : (
            filteredReports.map((report, index) => {
              const overallScore = calculateOverallScore(report)
              const scoreStatus = getScoreStatus(overallScore)
              
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <ScoreCircle score={overallScore} size="sm" />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {report.url}
                              </h3>
                              <div className="flex items-center space-x-3 text-sm text-gray-600">
                                <span>{formatDate(report.created_at)}</span>
                                <Badge variant={scoreStatus.variant}>
                                  {scoreStatus.text}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(report.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          
                          {profile?.subscription_tier === 'pro' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Export PDF functionality
                                console.log('Export PDF for report:', report.id)
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteReport(report.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
          </motion.div>
        )}

        {/* Subscription Upsell for Free Users */}
        {profile?.subscription_tier === 'free' && reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Unlock More Powerful Features
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Upgrade to Pro for unlimited scans, PDF exports, detailed analysis, and advanced features.
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
