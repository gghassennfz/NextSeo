import { SEOAnalysis } from '@/types/seo'

export async function exportToPDF(analysis: SEOAnalysis) {
  try {
    console.log('Starting high-quality PDF export with Puppeteer...')
    
    // Call our new Puppeteer-based PDF API
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        analysis,
        reportId: `seo-report-${Date.now()}`
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to generate PDF: ${response.status}`)
    }

    // Get the PDF blob
    const pdfBlob = await response.blob()
    
    // Create download link
    const url = window.URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SEO-Report-${analysis.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('High-quality PDF exported successfully!')
    return true

  } catch (error) {
    console.error('PDF export error:', error)
    
    // Fallback: Show user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    alert(`Failed to export PDF: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`)
    
    return false
  }
}
