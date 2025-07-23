"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Search, Zap, BarChart3, Shield, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { validateUrl, normalizeUrl } from "@/lib/utils"

interface HeroSectionProps {
  onScan: (url: string) => void
  isScanning?: boolean
}

export function HeroSection({ onScan, isScanning = false }: HeroSectionProps) {
  const [url, setUrl] = useState("https://www.remorquagebalkis.tn")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!url.trim()) {
      setError("Please enter a website URL")
      return
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid URL (e.g., https://example.com)")
      return
    }

    const normalizedUrl = normalizeUrl(url)
    onScan(normalizedUrl)
  }

  const features = [
    {
      icon: <Search className="w-6 h-6 text-blue-600" />,
      title: "Comprehensive Analysis",
      description: "Deep SEO analysis covering meta tags, content quality, links, and technical factors"
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      title: "Real-time Results",
      description: "Get instant SEO reports with actionable recommendations and priority fixes"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-600" />,
      title: "Visual Insights",
      description: "Easy-to-understand scores, charts, and detailed breakdowns for every aspect"
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-600" />,
      title: "Professional Reports",
      description: "Export beautiful PDF reports to share with clients and stakeholders"
    }
  ]

  const checkpoints = ["Meta tags & descriptions", "Content quality & structure", "Internal & external links", "Page performance & speed", "Crawlability & indexing", "Social media integration", "Mobile responsiveness", "Security & HTTPS"]

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="mb-6">
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                🚀 Professional SEO Analysis Tool
              </Badge>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Unlock Your Website's <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SEO Potential</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get comprehensive SEO analysis with actionable insights, beautiful reports, and expert recommendations. Perfect for agencies, marketers, and website owners.
            </motion.p>

            {/* Scan Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="max-w-2xl mx-auto mb-12">
              <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input type="url" name="url" id="url" placeholder="Enter your website URL (e.g., https://example.com)" value={url} onChange={e => setUrl(e.target.value)} className="h-12 text-lg" disabled={isScanning} />
                      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <Button type="submit" size="lg" disabled={isScanning} className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
                      {isScanning ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Search className="w-5 h-5" />
                          <span>Analyze Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 text-center">✨ Free analysis • No registration required • Instant results</p>
                </form>
              </Card>
            </motion.div>

            {/* What We Check */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-16">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">We analyze 50+ SEO factors including:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                {checkpoints.map((checkpoint, index) => (
                  <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + index * 0.1 }} className="flex items-center space-x-2 text-sm text-gray-700 bg-white/50 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{checkpoint}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our SEO Analyzer?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Get professional-grade SEO insights that help you outrank competitors and grow your online presence.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
