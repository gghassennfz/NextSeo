'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { ScrollArea } from '@/components/ui/scroll-area' // Using simple div for now
import { Loader2, Send, Globe, Bot, User, Sparkles, Brain, MessageCircle, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface SEOAnalysis {
  url: string
  title?: string
  description?: string
  keywords?: string[]
  h1Tags?: string[]
  h2Tags?: string[]
  images?: { src: string; alt: string }[]
  links?: { href: string; text: string }[]
  issues?: string[]
  recommendations?: string[]
}

export default function AIAnalysisPage() {
  const { user, profile } = useAuth()
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScanned, setIsScanned] = useState(false)
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleAnalyzeWebsite = async () => {
    if (!url) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze website')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      setIsScanned(true)

      // Generate conversational AI analysis
      const conversationResponse = await fetch('/api/ai-seo-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: data.analysis,
          url: url,
          userName: profile?.full_name || user?.user_metadata?.full_name || 'there',
        }),
      })

      if (conversationResponse.ok) {
        const conversationData = await conversationResponse.json()
        const initialMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: conversationData.response,
          timestamp: new Date(),
        }
        setMessages([initialMessage])
      } else {
        // Fallback message if AI conversation fails
        const fallbackMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: `Hi! I've just finished analyzing ${url}. I found ${data.analysis.issues?.length || 0} SEO issues that need attention and have ${data.analysis.recommendations?.length || 0} recommendations to help improve your rankings. Let me know what specific aspects of your SEO you'd like to discuss!`,
          timestamp: new Date(),
        }
        setMessages([fallbackMessage])
      }
    } catch (error) {
      console.error('Error analyzing website:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !isScanned) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/ai-seo-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          analysis: analysis,
          url: url,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try asking your question again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6 shadow-lg">
              <Brain className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">Powered by AI</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              AI SEO Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform your website's SEO with intelligent, personalized recommendations powered by advanced AI
            </p>
          </div>

          {/* URL Input Section */}
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  Website Analysis
                </CardTitle>
                <CardDescription className="text-base">
                  Enter your website URL and let our AI analyze your SEO performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-14 text-lg border-2 border-gray-200 focus:border-indigo-500 rounded-xl transition-all duration-300"
                    disabled={isAnalyzing}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <Button
                  onClick={handleAnalyzeWebsite}
                  disabled={!url || isAnalyzing}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      <span>Analyzing your website...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="mr-3 h-5 w-5" />
                      <span>Start AI Analysis</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Interface - Full Width Modern Design */}
      {isScanned && analysis && (
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* AI Chat Interface */}
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  SEO Conversation
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Your AI SEO expert is ready to discuss {analysis.url} and provide personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-[600px]">
                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto mb-6 space-y-4 p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                        <Bot className="h-12 w-12 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">AI Analysis Complete!</h3>
                      <p className="text-gray-500 max-w-md">
                        Your SEO expert is ready to discuss findings and provide actionable recommendations for your website.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-4 ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        } animate-in slide-in-from-bottom-2 duration-300`}
                      >
                        <div
                          className={`flex gap-3 max-w-[85%] ${
                            message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {message.type === 'user' ? (
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                <Bot className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div
                            className={`rounded-2xl px-5 py-3 shadow-lg ${
                              message.type === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-2 ${
                              message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isChatLoading && (
                    <div className="flex gap-4 justify-start animate-in slide-in-from-bottom-2 duration-300">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          <span className="text-gray-500">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Ask me anything about your website's SEO performance..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isChatLoading}
                        className="h-12 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <MessageCircle className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isChatLoading}
                      className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
