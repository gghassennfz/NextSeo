import React from 'react'
import { FileCheck, Image, Type, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { SectionCard } from './section-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PageQualityAnalysis } from '@/types/seo'

interface PageQualitySectionProps {
  data: PageQualityAnalysis
}

export function PageQualitySection({ data }: PageQualitySectionProps) {
  const totalHeadings = Object.values(data.headingsCount).reduce((sum, count) => sum + count, 0)
  const altTextPercentage = data.imageCount > 0 ? (data.imagesWithAlt / data.imageCount) * 100 : 100

  return (
    <SectionCard
      title="Page Quality"
      score={data.score}
      icon={<FileCheck className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Word Count */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <Type className="w-4 h-4" />
              <span>Content Length</span>
            </h4>
            <Badge variant={data.wordCount >= 300 ? 'success' : 'warning'}>
              {data.wordCount.toLocaleString()} words
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Progress 
              value={Math.min((data.wordCount / 300) * 100, 100)} 
              className="flex-1 h-2"
            />
            <span className="text-xs text-gray-500">
              {data.wordCount}/300+ optimal
            </span>
          </div>
          
          {data.wordCount < 300 && (
            <div className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Consider adding more content for better SEO</span>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Images & Alt Text</span>
            </h4>
            <div className="flex space-x-2">
              <Badge variant="outline">{data.imageCount} images</Badge>
              <Badge variant={data.imagesWithoutAlt === 0 ? 'success' : 'error'}>
                {data.imagesWithAlt} with alt
              </Badge>
            </div>
          </div>
          
          {data.imageCount > 0 && (
            <>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={altTextPercentage} 
                  className="flex-1 h-2"
                />
                <span className="text-xs text-gray-500">
                  {Math.round(altTextPercentage)}% have alt text
                </span>
              </div>
              
              {data.imagesWithoutAlt > 0 && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{data.imagesWithoutAlt} images missing alt text</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Headings Structure */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Heading Structure</h4>
            <Badge variant="outline">{totalHeadings} headings</Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(data.headingsCount).map(([level, count]) => (
              <div key={level} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-semibold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500 uppercase">{level}</div>
              </div>
            ))}
          </div>
          
          <div className="space-y-1">
            {data.headingsCount.h1 === 0 && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Missing H1 heading</span>
              </div>
            )}
            {data.headingsCount.h1 > 1 && (
              <div className="flex items-center space-x-2 text-sm text-yellow-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Multiple H1 headings found</span>
              </div>
            )}
            {data.headingsCount.h1 === 1 && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Perfect H1 structure</span>
              </div>
            )}
          </div>
        </div>

        {/* Issues */}
        {data.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Issues Found</h4>
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
      </div>
    </SectionCard>
  )
}
