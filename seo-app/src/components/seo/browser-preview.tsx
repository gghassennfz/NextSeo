'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Monitor, 
  Smartphone, 
  Tablet,
  ExternalLink,
  Shield,
  Clock,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BrowserPreviewProps {
  url: string
  loading?: boolean
  analysis?: any
}

export function BrowserPreview({ url, loading = false, analysis }: BrowserPreviewProps) {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const [isSecure, setIsSecure] = useState(false)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const startTime = useRef<number>(Date.now())

  useEffect(() => {
    setIsSecure(url.startsWith('https://'))
    startTime.current = Date.now()
    setStatus('loading')
  }, [url])

  const handleIframeLoad = () => {
    const endTime = Date.now()
    setLoadTime(endTime - startTime.current)
    setStatus('loaded')
  }

  const handleIframeError = () => {
    setStatus('error')
  }

  const refreshPreview = () => {
    if (iframeRef.current) {
      startTime.current = Date.now()
      setStatus('loading')
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const openInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getDeviceClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-80 h-[600px]'
      case 'tablet':
        return 'w-[600px] h-[800px]'
      case 'desktop':
      default:
        return 'w-full h-[600px]'
    }
  }

  const getDeviceIcon = () => {
    switch (deviceMode) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      case 'desktop':
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Live Website Preview
          </CardTitle>
          
          {/* Device Mode Selector */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
              <Button
                key={mode}
                variant={deviceMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceMode(mode)}
                className="h-8 px-2"
              >
                {mode === 'desktop' && <Monitor className="h-4 w-4" />}
                {mode === 'tablet' && <Tablet className="h-4 w-4" />}
                {mode === 'mobile' && <Smartphone className="h-4 w-4" />}
              </Button>
            ))}
          </div>
        </div>

        {/* Browser Controls */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 flex-1 max-w-md">
              {isSecure ? (
                <Shield className="h-4 w-4 text-green-600" />
              ) : (
                <Globe className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-sm font-mono truncate">{url}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {loadTime && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {loadTime}ms
              </Badge>
            )}
            
            <Button variant="ghost" size="sm" onClick={refreshPreview}>
              <RefreshCw className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <motion.div
          className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
          animate={{
            scale: isFullscreen ? 1 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className={`relative mx-auto transition-all duration-300 ${getDeviceClass()}`}>
            {/* Loading Overlay */}
            <AnimatePresence>
              {status === 'loading' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 rounded-lg"
                >
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading website...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error State */}
            {status === 'error' && (
              <div className="absolute inset-0 bg-gray-50 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center p-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Unable to load preview
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This website cannot be displayed in a frame due to security restrictions.
                  </p>
                  <Button onClick={openInNewTab} className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            )}

            {/* Website iframe */}
            <iframe
              ref={iframeRef}
              src={url}
              className={`w-full h-full border-0 rounded-lg ${deviceMode === 'mobile' ? 'scale-90 origin-top' : ''}`}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              title={`Preview of ${url}`}
            />
          </div>

          {/* Fullscreen close button */}
          {isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 bg-white shadow-lg"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
        </motion.div>

        {/* Website Info */}
        {analysis && (
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-gray-600">Score:</span>
                <Badge variant={analysis.overallScore >= 80 ? 'default' : analysis.overallScore >= 60 ? 'secondary' : 'destructive'}>
                  {analysis.overallScore}/100
                </Badge>
              </div>
              
              {analysis.meta?.title && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium truncate">{analysis.meta.title.content}</span>
                </div>
              )}
              
              {loadTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">Load Time:</span>
                  <span className="font-medium">{loadTime}ms</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {isSecure ? (
                  <>
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Secure</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">Not Secure</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
