'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/layout/navigation'
import { HeroSection } from '@/components/landing/hero-section'
import { ResultsDashboard } from '@/components/seo/results-dashboard'
import { UserDashboard } from '@/components/dashboard/user-dashboard'
import { PricingPage } from '@/components/pricing/pricing-page'
import { SEOAnalysis } from '@/types/seo'
import { exportToPDF } from '@/lib/pdf-export'
import { useAuth } from '@/contexts/auth-context'
import AIAnalysisPage from './ai-analysis/page'

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'pricing' | 'ai-analysis'>('home')
  const [isScanning, setIsScanning] = useState(false)
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const { user, profile } = useAuth()

  const handleScan = async (url: string) => {
    setIsScanning(true)
    setAnalysis(null)
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze URL')
      }

      const analysisData = result.data
      setAnalysis(analysisData)

      // Save report if user is authenticated
      if (user && profile) {
        try {
          const saveResponse = await fetch('/api/reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              analysis: analysisData,
              userId: user.id
            }),
          })

          if (!saveResponse.ok) {
            const saveResult = await saveResponse.json()
            if (saveResult.upgradeRequired) {
              alert(saveResult.message)
              setCurrentPage('pricing')
            } else {
              console.error('Failed to save report:', saveResult.error)
            }
          }
        } catch (saveError) {
          console.error('Error saving report:', saveError)
        }
      }
    } catch (error) {
      console.error('Scan error:', error)
      alert(`Failed to analyze URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsScanning(false)
    }
  }

  const handleExportPDF = async () => {
    if (!analysis) return
    
    setIsExporting(true)
    try {
      await exportToPDF(analysis)
    } catch (error) {
      console.error('PDF export error:', error)
      alert(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleBackToHome = () => {
    setAnalysis(null)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return user ? <UserDashboard /> : (
          <div className="flex items-center justify-center min-h-[400px] text-gray-500">
            Please sign in to access your dashboard.
          </div>
        )
      case 'pricing':
        return <PricingPage />
      case 'ai-analysis':
        return <AIAnalysisPage />
      case 'home':
      default:
        return (
          <>
            <HeroSection onScan={handleScan} isScanning={isScanning} />
            {analysis && (
              <div className="py-16">
                <ResultsDashboard
                  analysis={analysis}
                  isExporting={isExporting}
                  onExportPDF={handleExportPDF}
                />
              </div>
            )}
          </>
        )
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + (analysis ? '-with-analysis' : '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
