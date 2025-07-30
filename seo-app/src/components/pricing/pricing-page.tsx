'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'

interface PricingPageProps {
  onSignUp?: () => void
}

export function PricingPage({ onSignUp }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const { user, profile } = useAuth()

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      onSignUp?.()
      return
    }

    setLoading(priceId)
    
    try {
      console.log(`Starting ${planName} subscription with price ID: ${priceId}`)
      
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId, 
          userId: user.id, 
          planName 
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }
      
      const { url } = await response.json()
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
      
    } catch (error) {
      console.error('Subscription error:', error)
      alert(`Failed to start subscription process: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for trying out our SEO analysis',
      price: { monthly: 0, yearly: 0 },
      priceId: { monthly: '', yearly: '' },
      features: [
        '3 SEO scans per day',
        'Basic analysis reports',
        'Core SEO metrics',
        'Email support',
        'Mobile responsive results'
      ],
      limitations: [
        'Limited scan history',
        'No PDF exports',
        'Basic recommendations only'
      ],
      recommended: false,
      icon: <Zap className="w-6 h-6" />,
      buttonText: user ? 'Current Plan' : 'Get Started Free',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Pro',
      description: 'For serious marketers and agencies',
      price: { monthly: 29, yearly: 290 },
      priceId: { 
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_1234567890abcdef', 
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_0987654321fedcba'
      },
      features: [
        'Unlimited SEO scans',
        'Advanced analysis reports',
        'All SEO metrics + insights',
        'PDF report exports',
        'Scan history & tracking',
        'Priority email support',
        'API access (coming soon)',
        'White-label reports',
        'Custom branding',
        'Advanced competitor analysis'
      ],
      limitations: [],
      recommended: true,
      icon: <Crown className="w-6 h-6" />,
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default' as const
    }
  ]

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your SEO Analysis Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get the insights you need to boost your website's search engine rankings and drive more organic traffic.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                Save 17%
              </Badge>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-medium">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card className={`h-full ${plan.recommended ? 'border-blue-500 shadow-xl ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-200 shadow-lg'}`}>
                <CardHeader className="text-center pb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                    plan.recommended ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <div className={plan.recommended ? 'text-blue-600' : 'text-gray-600'}>
                      {plan.icon}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                  
                  <div className="mt-4">
                    {plan.price[billingCycle] === 0 ? (
                      <div className="text-4xl font-bold">Free</div>
                    ) : (
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold">${plan.price[billingCycle]}</span>
                        <span className="text-gray-600 ml-2">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                    )}
                    
                    {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Save ${(plan.price.monthly * 12) - plan.price.yearly} per year
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-500">Limitations:</p>
                      {plan.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-start space-x-3">
                          <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mx-auto mt-2"></div>
                          </div>
                          <span className="text-gray-500 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="pt-6">
                    <Button
                      onClick={() => {
                        if (plan.name === 'Free') {
                          onSignUp?.()
                        } else {
                          handleSubscribe(plan.priceId[billingCycle], plan.name)
                        }
                      }}
                      variant={plan.buttonVariant}
                      className={`w-full ${
                        plan.recommended 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          : ''
                      }`}
                      disabled={loading === plan.priceId[billingCycle] || (plan.name === 'Free' && profile?.subscription_tier === 'free')}
                    >
                      {loading === plan.priceId[billingCycle] ? (
                        'Processing...'
                      ) : profile?.subscription_tier === 'pro' && plan.name === 'Pro' ? (
                        'Current Plan'
                      ) : profile?.subscription_tier === 'free' && plan.name === 'Free' ? (
                        'Current Plan'
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{plan.buttonText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Can I cancel anytime?</h4>
              <p className="text-gray-600 text-sm">
                Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Do you offer refunds?</h4>
              <p className="text-gray-600 text-sm">
                We offer a 30-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, PayPal, and ACH transfers for annual plans.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">
                Our free plan gives you 3 scans per day forever. Upgrade to Pro for unlimited access and advanced features.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
