import React from 'react'
import { FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { SectionCard } from './section-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MetaAnalysis } from '@/types/seo'

interface MetaSectionProps {
  data: MetaAnalysis
}

export function MetaSection({ data }: MetaSectionProps) {
  return (
    <SectionCard
      title="Meta Information"
      score={data.score}
      icon={<FileText className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Title Analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <span>Page Title</span>
              {data.title.isOptimal ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              )}
            </h4>
            <Badge variant={data.title.isOptimal ? 'success' : 'warning'}>
              {data.title.length} chars
            </Badge>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 font-medium">
              {data.title.content || 'No title found'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Progress 
              value={(data.title.length / 60) * 100} 
              className="flex-1 h-2"
            />
            <span className="text-xs text-gray-500">
              {data.title.length}/60 optimal
            </span>
          </div>
          
          {data.title.issues.length > 0 && (
            <div className="space-y-1">
              {data.title.issues.map((issue, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description Analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <span>Meta Description</span>
              {data.description.isOptimal ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              )}
            </h4>
            <Badge variant={data.description.isOptimal ? 'success' : 'warning'}>
              {data.description.length} chars
            </Badge>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              {data.description.content || 'No meta description found'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Progress 
              value={(data.description.length / 160) * 100} 
              className="flex-1 h-2"
            />
            <span className="text-xs text-gray-500">
              {data.description.length}/160 optimal
            </span>
          </div>
          
          {data.description.issues.length > 0 && (
            <div className="space-y-1">
              {data.description.issues.map((issue, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keywords */}
        {data.keywords && (
          <div className="space-y-2">
            <h4 className="font-medium">Meta Keywords</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{data.keywords}</p>
            </div>
          </div>
        )}

        {/* Duplicates Check */}
        {(data.duplicates.title || data.duplicates.description) && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Duplicate Issues</h4>
            <div className="space-y-1">
              {data.duplicates.title && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Multiple title tags found</span>
                </div>
              )}
              {data.duplicates.description && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Multiple meta descriptions found</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
