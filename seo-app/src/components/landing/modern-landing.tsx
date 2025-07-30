"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  BarChart3, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Globe,
  TrendingUp,
  Users,
  Award,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { validateUrl, normalizeUrl } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

interface ModernLandingProps {
  onScan: (url: string) => void
  onNavigate: (page: 'pricing' | 'auth') => void
  isScanning?: boolean
}

export function ModernLanding({ onScan, onNavigate, isScanning = false }: ModernLandingProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const { user } = useAuth()

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
      icon: <Search className="w-8 h-8" />,
      title: "Deep SEO Analysis",
      description: "Comprehensive audit of 50+ SEO factors including technical, content, and performance metrics"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Visual Reports",
      description: "Beautiful, easy-to-understand reports with actionable insights and priority recommendations"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Competitive Edge",
      description: "Stay ahead with real-time monitoring and competitor analysis to boost your rankings"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Ready",
      description: "Professional-grade analysis trusted by agencies and Fortune 500 companies worldwide"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Digital Marketing Manager",
      company: "TechCorp",
      content: "This tool increased our organic traffic by 150% in just 3 months. The insights are incredibly actionable.",
      rating: 5
    },
    {
      name: "Mike Johnson",
      role: "SEO Agency Owner",
      company: "GrowthPro",
      content: "Best SEO analysis tool I've used. My clients love the professional reports and clear recommendations.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Startup Founder",
      company: "InnovateLab",
      content: "Finally, an SEO tool that's both powerful and easy to understand. Game-changer for our startup.",
      rating: 5
    }
  ]

  const stats = [
    { number: "50K+", label: "Websites Analyzed" },
    { number: "98%", label: "Accuracy Rate" },
    { number: "2.5x", label: "Average Traffic Boost" },
    { number: "24/7", label: "Support Available" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo & Brand */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Search className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    SEO Analyzer Pro
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="bg-white/70 backdrop-blur-sm text-blue-700 border-blue-200">
                🚀 AI-Powered SEO Intelligence
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Analyze Your Website &<br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Dominate Search Rankings
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              Get comprehensive SEO analysis with AI-powered insights, actionable recommendations, 
              and beautiful reports. Boost your search rankings and drive more organic traffic.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              {!user ? (
                <>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                    onClick={() => onNavigate('auth')}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Start for Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
                    onClick={() => onNavigate('pricing')}
                  >
                    <Award className="w-5 h-5 mr-2" />
                    View Pro Plans
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
                  onClick={() => onNavigate('pricing')}
                >
                  <Award className="w-5 h-5 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
            </motion.div>

            {/* Quick Scan Form */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="p-6 shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Try it now - Free instant analysis
                  </h3>
                  <p className="text-sm text-gray-600">
                    No registration required • Get results in seconds
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        type="url"
                        placeholder="Enter your website URL (e.g., https://example.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors"
                        disabled={isScanning}
                      />
                      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isScanning}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isScanning ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Target className="w-5 h-5" />
                          <span>Analyze Now</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose SEO Analyzer Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get professional-grade SEO insights that help you outrank competitors 
              and grow your online presence with confidence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group-hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              Trusted by thousands of professionals
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what our customers say about SEO Analyzer Pro
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-100 mb-6 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-semibold text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to boost your SEO rankings?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of successful websites using SEO Analyzer Pro to dominate search results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                    onClick={() => onNavigate('auth')}
                  >
                    Start Free Analysis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300"
                    onClick={() => onNavigate('pricing')}
                  >
                    View Pricing
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300"
                  onClick={() => onNavigate('pricing')}
                >
                  Upgrade to Pro
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
