import React, { ReactNode } from "react"
import { Shield, Share2, Twitter, Facebook, AlertTriangle, CheckCircle2, Globe } from "lucide-react"
import { SectionCard } from "./section-card"
import { Badge } from "@/components/ui/badge"
import { ExternalFactorsAnalysis } from "@/types/seo"

interface ExternalFactorsSectionProps {
  data: ExternalFactorsAnalysis
}

export function ExternalFactorsSection({ data }: ExternalFactorsSectionProps) {
  console.log(data)
  return (
    <SectionCard title="External Factors" score={data.score} icon={<Globe className="w-5 h-5" />}>
      <div className="space-y-6">
        {/* HTTPS Security */}
        <SectionElement icon={<Shield className="w-4 h-4" />} title="HTTPS Security" element={{ exists: !!data?.https }} successMessage="Site uses HTTPS encryption" warningMessage="Site is not using HTTPS - this affects SEO rankings" />

        {/* Favicon */}
        <SectionElement title="Favicon" element={data.favicon} successMessage="Favicon found" warningMessage="Consider adding a favicon for better branding" />
        <SectionElement title="Apple touch icon" element={data.appleTouchIcon} successMessage="Apple touch icon found" warningMessage="Consider adding a Apple touch icon for better branding" />

        {/* Open Graph */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <Facebook className="w-4 h-4" />
              <span>Open Graph Tags</span>
            </h4>
            <Badge variant={data.openGraph.title && data.openGraph.description ? "success" : "warning"}>{data.openGraph.title && data.openGraph.description ? "Complete" : "Incomplete"}</Badge>
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
            <Badge variant={data.twitterCard.card ? "success" : "warning"}>{data.twitterCard.card ? data.twitterCard.card : "Missing"}</Badge>
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
        <SectionElement title="Schema Markup" element={data.schemaMarkup} successMessage="Structured data found" warningMessage="No structured data found" icon={<Share2 className="w-4 h-4" />}>
          <div className="flex flex-wrap gap-1">
            {data.schemaMarkup.types.map((type, index) => (
              <Badge key={`${type}-${index}`} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </SectionElement>

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

function SectionElement({ title, element, successMessage, warningMessage, icon = null, children = null }: { title: string; element: { exists: boolean; url?: string }; successMessage: string; warningMessage: string; icon?: ReactNode; children?: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center space-x-2">
          {icon ? icon : null}
          <span>{title}</span>
        </h4>
        <Badge variant={element.exists ? "success" : "warning"}>{element.exists ? "Present" : "Missing"}</Badge>
      </div>

      {element.exists ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle2 className="w-3 h-3" />
            <span>{successMessage}</span>
          </div>
          {element.url && (
            <div className="p-2 bg-gray-50 rounded text-xs font-mono">
              <div className="truncate">{element.url}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-sm text-yellow-600">
          <AlertTriangle className="w-3 h-3" />
          <span>{warningMessage}</span>
        </div>
      )}
      {children}
    </div>
  )
}
