import React from 'react'
import { Search, Globe, FileText, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'
import { SectionCard } from './section-card'
import { Badge } from '@/components/ui/badge'
import { CrawlabilityAnalysis } from '@/types/seo'

interface CrawlabilitySectionProps {
  data: CrawlabilityAnalysis
}

export function CrawlabilitySection({ data }: CrawlabilitySectionProps) {
  return (
    <SectionCard
      title="Crawlability"
      score={data.score}
      icon={<Search className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Robots.txt */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Robots.txt</span>
            </h4>
            <Badge variant={data.robotsTxt.exists ? 'success' : 'warning'}>
              {data.robotsTxt.exists ? 'Found' : 'Missing'}
            </Badge>
          </div>
          
          {data.robotsTxt.exists ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>robots.txt file found</span>
              </div>
              
              {data.robotsTxt.blocks.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Disallowed paths:</h5>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {data.robotsTxt.blocks.slice(0, 5).map((block, index) => (
                      <div key={index} className="text-xs bg-gray-100 p-2 rounded font-mono">
                        {block}
                      </div>
                    ))}
                    {data.robotsTxt.blocks.length > 5 && (
                      <div className="text-xs text-gray-500">
                        +{data.robotsTxt.blocks.length - 5} more rules...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Consider adding a robots.txt file</span>
            </div>
          )}
        </div>

        {/* Sitemap */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>XML Sitemap</span>
            </h4>
            <Badge variant={data.sitemap.exists ? 'success' : 'warning'}>
              {data.sitemap.exists ? 'Found' : 'Missing'}
            </Badge>
          </div>
          
          {data.sitemap.exists ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Sitemap found in robots.txt</span>
              </div>
              {data.sitemap.url && (
                <div className="p-2 bg-gray-50 rounded text-xs font-mono flex items-center justify-between">
                  <span className="truncate">{data.sitemap.url}</span>
                  <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0 ml-2" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>No sitemap reference found</span>
            </div>
          )}
        </div>

        {/* Canonical URL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Canonical URL</h4>
            <Badge variant={data.canonical.exists ? 'success' : 'warning'}>
              {data.canonical.exists ? 'Present' : 'Missing'}
            </Badge>
          </div>
          
          {data.canonical.exists ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Canonical tag found</span>
              </div>
              {data.canonical.url && (
                <div className="p-2 bg-gray-50 rounded text-xs font-mono">
                  <div className="truncate">{data.canonical.url}</div>
                </div>
              )}
              {data.canonical.isSelf && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Self-referencing canonical (good practice)</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Consider adding a canonical URL</span>
            </div>
          )}
        </div>

        {/* Language Attribute */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Language Declaration</h4>
            <Badge variant={data.langAttribute.exists ? 'success' : 'warning'}>
              {data.langAttribute.exists ? data.langAttribute.value : 'Missing'}
            </Badge>
          </div>
          
          {data.langAttribute.exists ? (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              <span>Language attribute properly set</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Add lang attribute to HTML tag</span>
            </div>
          )}
        </div>

        {/* Issues */}
        {data.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Crawlability Issues</h4>
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

        {/* Best Practices */}
        <div className="space-y-2">
          <h4 className="font-medium text-blue-600">Crawlability Tips</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• Submit your sitemap to Google Search Console</div>
            <div>• Regularly check for crawl errors</div>
            <div>• Use robots.txt to control crawler access</div>
            <div>• Ensure important pages are not blocked</div>
            <div>• Monitor server response codes</div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
