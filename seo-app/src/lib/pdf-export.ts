import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { SEOAnalysis } from '@/types/seo'

export async function exportToPDF(analysis: SEOAnalysis) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper function to add text with automatic wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
    
    const lines = pdf.splitTextToSize(text, contentWidth)
    const lineHeight = fontSize * 0.3
    
    // Check if we need a new page
    if (yPosition + lines.length * lineHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
    
    pdf.text(lines, margin, yPosition)
    yPosition += lines.length * lineHeight + 5
  }

  // Add header
  pdf.setFillColor(59, 130, 246) // Blue color
  pdf.rect(0, 0, pageWidth, 40, 'F')
  
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text('SEO Analysis Report', margin, 25)
  
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text(new Date(analysis.timestamp).toLocaleDateString(), pageWidth - margin - 30, 32)
  
  yPosition = 60
  pdf.setTextColor(0, 0, 0)

  // URL and Overall Score
  addText(`Website: ${analysis.url}`, 14, true)
  addText(`Overall SEO Score: ${Math.round(analysis.overallScore)}/100`, 16, true)
  
  const scoreColor = analysis.overallScore >= 80 ? [34, 197, 94] : 
                     analysis.overallScore >= 60 ? [234, 179, 8] : [239, 68, 68]
  pdf.setTextColor(...scoreColor)
  
  const scoreStatus = analysis.overallScore >= 80 ? 'Excellent' : 
                      analysis.overallScore >= 60 ? 'Good' : 'Needs Improvement'
  addText(`Status: ${scoreStatus}`, 14, true)
  
  pdf.setTextColor(0, 0, 0)
  yPosition += 10

  // Section breakdown
  addText('Section Scores:', 16, true)
  
  const sections = [
    { name: 'Meta Information', data: analysis.sections.meta },
    { name: 'Page Quality', data: analysis.sections.pageQuality },
    { name: 'Link Structure', data: analysis.sections.linkStructure },
    { name: 'Performance', data: analysis.sections.performance },
    { name: 'Crawlability', data: analysis.sections.crawlability },
    { name: 'External Factors', data: analysis.sections.externalFactors }
  ]

  sections.forEach(section => {
    addText(`${section.name}: ${Math.round(section.data.score)}/100`, 12, false)
  })

  yPosition += 10

  // Detailed analysis
  addText('Detailed Analysis:', 16, true)

  // Meta Information
  addText('Meta Information', 14, true)
  addText(`Title: ${analysis.sections.meta.title.content || 'Not found'}`, 10)
  addText(`Title Length: ${analysis.sections.meta.title.length} characters`, 10)
  addText(`Meta Description: ${analysis.sections.meta.description.content || 'Not found'}`, 10)
  addText(`Description Length: ${analysis.sections.meta.description.length} characters`, 10)
  
  if (analysis.sections.meta.title.issues.length > 0) {
    addText('Title Issues:', 12, true)
    analysis.sections.meta.title.issues.forEach(issue => {
      addText(`• ${issue}`, 10)
    })
  }
  
  if (analysis.sections.meta.description.issues.length > 0) {
    addText('Description Issues:', 12, true)
    analysis.sections.meta.description.issues.forEach(issue => {
      addText(`• ${issue}`, 10)
    })
  }

  yPosition += 5

  // Page Quality
  addText('Page Quality', 14, true)
  addText(`Word Count: ${analysis.sections.pageQuality.wordCount.toLocaleString()}`, 10)
  addText(`Images: ${analysis.sections.pageQuality.imageCount} total, ${analysis.sections.pageQuality.imagesWithAlt} with alt text`, 10)
  addText(`Headings: H1(${analysis.sections.pageQuality.headingsCount.h1}), H2(${analysis.sections.pageQuality.headingsCount.h2}), H3(${analysis.sections.pageQuality.headingsCount.h3})`, 10)
  
  if (analysis.sections.pageQuality.issues.length > 0) {
    addText('Issues:', 12, true)
    analysis.sections.pageQuality.issues.forEach(issue => {
      addText(`• ${issue}`, 10)
    })
  }

  yPosition += 5

  // Link Structure
  addText('Link Structure', 14, true)
  addText(`Internal Links: ${analysis.sections.linkStructure.internalLinks}`, 10)
  addText(`External Links: ${analysis.sections.linkStructure.externalLinks}`, 10)
  addText(`Broken Links: ${analysis.sections.linkStructure.brokenLinks.length}`, 10)

  yPosition += 5

  // Performance
  addText('Performance', 14, true)
  addText(`Response Time: ${analysis.sections.performance.responseTime}ms`, 10)
  addText(`Page Size: ${(analysis.sections.performance.pageSize / 1024).toFixed(2)} KB`, 10)
  addText(`CSS Files: ${analysis.sections.performance.assetsCount.css}`, 10)
  addText(`JavaScript Files: ${analysis.sections.performance.assetsCount.js}`, 10)
  addText(`Images: ${analysis.sections.performance.assetsCount.images}`, 10)

  yPosition += 5

  // Recommendations
  addText('Recommendations:', 16, true)
  
  const recommendations = []
  
  if (analysis.sections.meta.score < 80) {
    recommendations.push('Optimize meta titles and descriptions for better click-through rates')
  }
  
  if (analysis.sections.pageQuality.score < 80) {
    recommendations.push('Improve content quality and structure with more comprehensive text')
  }
  
  if (analysis.sections.linkStructure.score < 80) {
    recommendations.push('Build more internal links and fix any broken links')
  }
  
  if (analysis.sections.performance.score < 80) {
    recommendations.push('Optimize page loading speed by compressing images and minimizing files')
  }
  
  if (analysis.sections.crawlability.score < 80) {
    recommendations.push('Improve crawlability with proper robots.txt and sitemap configuration')
  }
  
  if (analysis.sections.externalFactors.score < 80) {
    recommendations.push('Add Open Graph tags, Twitter Cards, and ensure HTTPS implementation')
  }

  recommendations.forEach(rec => {
    addText(`• ${rec}`, 10)
  })

  // Footer
  const timestamp = new Date().toLocaleDateString()
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.text(`Generated by WitG seo on ${timestamp}`, margin, pageHeight - 10)

  // Save the PDF
  pdf.save(`seo-analysis-${analysis.url.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`)
}
