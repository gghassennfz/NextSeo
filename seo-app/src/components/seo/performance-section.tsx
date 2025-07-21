import React from 'react'
import { Zap, Clock, HardDrive, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { SectionCard } from './section-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PerformanceAnalysis } from '@/types/seo'

interface PerformanceSectionProps {
  data: PerformanceAnalysis
}

export function PerformanceSection({ data }: PerformanceSectionProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <SectionCard
      title="Performance"
      score={data.score}
      icon={<Zap className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Response Time */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Response Time</span>
            </h4>
            <Badge variant={data.responseTime <= 1000 ? 'success' : data.responseTime <= 3000 ? 'warning' : 'error'}>
              {formatResponseTime(data.responseTime)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Progress 
              value={Math.max(0, 100 - (data.responseTime / 5000) * 100)} 
              className="flex-1 h-2"
            />
            <span className="text-xs text-gray-500">
              Target: &lt; 1s
            </span>
          </div>
          
          {data.responseTime <= 1000 ? (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              <span>Excellent response time</span>
            </div>
          ) : data.responseTime <= 3000 ? (
            <div className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Response time could be improved</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Slow response time affects user experience</span>
            </div>
          )}
        </div>

        {/* Page Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <HardDrive className="w-4 h-4" />
              <span>Page Size</span>
            </h4>
            <Badge variant={data.pageSize <= 512 * 1024 ? 'success' : data.pageSize <= 1024 * 1024 ? 'warning' : 'error'}>
              {formatFileSize(data.pageSize)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Progress 
              value={Math.max(0, 100 - (data.pageSize / (2 * 1024 * 1024)) * 100)} 
              className="flex-1 h-2"
            />
            <span className="text-xs text-gray-500">
              Target: &lt; 500KB
            </span>
          </div>
        </div>

        {/* Assets Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium">Assets Overview</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">{data.assetsCount.css}</div>
              <div className="text-xs text-blue-700">CSS Files</div>
              {data.assetsCount.css <= 3 ? (
                <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto mt-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-yellow-600 mx-auto mt-1" />
              )}
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-600">{data.assetsCount.js}</div>
              <div className="text-xs text-yellow-700">JS Files</div>
              {data.assetsCount.js <= 3 ? (
                <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto mt-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-yellow-600 mx-auto mt-1" />
              )}
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{data.assetsCount.images}</div>
              <div className="text-xs text-green-700">Images</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">{data.assetsCount.total}</div>
              <div className="text-xs text-purple-700">Total Assets</div>
            </div>
          </div>
        </div>

        {/* Performance Issues */}
        {data.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Performance Issues</h4>
            <div className="space-y-1">
              {data.issues.map((issue, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="font-medium text-blue-600">Performance Tips</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• Optimize images and use modern formats (WebP, AVIF)</div>
            <div>• Minimize CSS and JavaScript files</div>
            <div>• Use a Content Delivery Network (CDN)</div>
            <div>• Enable gzip compression</div>
            <div>• Reduce HTTP requests by combining files</div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
