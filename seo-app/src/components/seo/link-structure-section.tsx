import React from 'react'
import { Link, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { SectionCard } from './section-card'
import { Badge } from '@/components/ui/badge'
import { LinkStructureAnalysis } from '@/types/seo'

interface LinkStructureSectionProps {
  data: LinkStructureAnalysis
}

export function LinkStructureSection({ data }: LinkStructureSectionProps) {
  const totalLinks = data.internalLinks + data.externalLinks

  return (
    <SectionCard
      title="Link Structure"
      score={data.score}
      icon={<Link className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Link Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{data.internalLinks}</div>
            <div className="text-sm text-blue-700">Internal Links</div>
            <div className="flex items-center justify-center mt-1">
              {data.internalLinks >= 3 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              )}
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.externalLinks}</div>
            <div className="text-sm text-green-700">External Links</div>
            <div className="flex items-center justify-center mt-1">
              {data.externalLinks > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              )}
            </div>
          </div>
        </div>

        {/* Link Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Links</span>
            <Badge variant="outline">{totalLinks}</Badge>
          </div>
          
          {data.noFollowLinks > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">NoFollow Links</span>
              <Badge variant="secondary">{data.noFollowLinks}</Badge>
            </div>
          )}
        </div>

        {/* Broken Links */}
        {data.brokenLinks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-red-600 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Broken Links Found</span>
              <Badge variant="error">{data.brokenLinks.length}</Badge>
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {data.brokenLinks.map((link, index) => (
                <div key={index} className="p-2 bg-red-50 rounded text-sm">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-3 h-3 text-red-600 flex-shrink-0" />
                    <span className="text-red-700 truncate">{link}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {data.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-600">Recommendations</h4>
            <div className="space-y-1">
              {data.issues.map((issue, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-yellow-700">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Good Practices */}
        <div className="space-y-2">
          <h4 className="font-medium text-green-600">Good Practices</h4>
          <div className="space-y-1">
            {data.internalLinks >= 3 && (
              <div className="flex items-center space-x-2 text-sm text-green-700">
                <CheckCircle2 className="w-3 h-3" />
                <span>Good internal linking structure</span>
              </div>
            )}
            {data.externalLinks > 0 && (
              <div className="flex items-center space-x-2 text-sm text-green-700">
                <CheckCircle2 className="w-3 h-3" />
                <span>Contains external references</span>
              </div>
            )}
            {data.brokenLinks.length === 0 && (
              <div className="flex items-center space-x-2 text-sm text-green-700">
                <CheckCircle2 className="w-3 h-3" />
                <span>No broken links detected</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
