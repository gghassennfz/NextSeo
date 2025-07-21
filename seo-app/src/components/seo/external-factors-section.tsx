import React from 'react'
import { Shield, Share2, Twitter, Facebook, AlertTriangle, CheckCircle2, Globe } from 'lucide-react'
import { SectionCard } from './section-card'
import { Badge } from '@/components/ui/badge'
import { ExternalFactorsAnalysis } from '@/types/seo'

interface ExternalFactorsSectionProps {
  data: ExternalFactorsAnalysis
}

export function ExternalFactorsSection({ data }: ExternalFactorsSectionProps) {
  return (
    <SectionCard
      title="External Factors"
      score={data.score}
      icon={<Globe className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* HTTPS Security */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>HTTPS Security</span>
            </h4>
            <Badge variant={data.https ? 'success' : 'error'}>
              {data.https ? 'Secure' : 'Not Secure'}
            </Badge>
          </div>
          
          {data.https ? (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              <span>Site uses HTTPS encryption</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Site is not using HTTPS - this affects SEO rankings</span>
            </div>
          )}
        </div>

        {/* Favicon */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Favicon</h4>
            <Badge variant={data.favicon.exists ? 'success' : 'warning'}>
              {data.favicon.exists ? 'Present' : 'Missing'}
            </Badge>
          </div>
          
          {data.favicon.exists ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Favicon found</span>
              </div>
              {data.favicon.url && (
                <div className="p-2 bg-gray-50 rounded text-xs font-mono">
                  <div className="truncate">{data.favicon.url}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Consider adding a favicon for better branding</span>
            </div>
          )}
        </div>

        {/* Open Graph */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <Facebook className="w-4 h-4" />
              <span>Open Graph Tags</span>
            </h4>
            <Badge variant={data.openGraph.title && data.openGraph.description ? 'success' : 'warning'}>
              {data.openGraph.title && data.openGraph.description ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {data.openGraph.title ? (
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>OG Title found</span>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <strong>Title:</strong> {data.openGraph.title}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-yellow-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Missing og:title</span>
              </div>
            )}
            
            {data.openGraph.description ? (
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>OG Description found</span>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <strong>Description:</strong> {data.openGraph.description}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-yellow-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Missing og:description</span>
              </div>
            )}
            
            {data.openGraph.image && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>OG Image found</span>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <strong>Image:</strong> {data.openGraph.image}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Twitter Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <Twitter className="w-4 h-4" />
              <span>Twitter Card</span>
            </h4>
            <Badge variant={data.twitterCard.card ? 'success' : 'warning'}>
              {data.twitterCard.card ? data.twitterCard.card : 'Missing'}
            </Badge>
          </div>
          
          {data.twitterCard.card ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Twitter Card configured</span>
              </div>
              
              {data.twitterCard.title && (
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <strong>Title:</strong> {data.twitterCard.title}
                </div>
              )}
              
              {data.twitterCard.description && (
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <strong>Description:</strong> {data.twitterCard.description}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>No Twitter Card meta tags found</span>
            </div>
          )}
        </div>

        {/* Schema Markup */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Structured Data</span>
            </h4>
            <Badge variant={data.schemaMarkup.exists ? 'success' : 'warning'}>
              {data.schemaMarkup.exists ? `${data.schemaMarkup.types.length} types` : 'None'}
            </Badge>
          </div>
          
          {data.schemaMarkup.exists ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Structured data found</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {data.schemaMarkup.types.map((type, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>No structured data found</span>
            </div>
          )}
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

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="font-medium text-blue-600">Social & SEO Tips</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• Add Open Graph tags for better social sharing</div>
            <div>• Implement Twitter Card for better Twitter previews</div>
            <div>• Use structured data to help search engines understand content</div>
            <div>• Ensure all assets are served over HTTPS</div>
            <div>• Test social sharing with Facebook and Twitter debuggers</div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
