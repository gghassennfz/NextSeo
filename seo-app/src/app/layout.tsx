import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'WitG seo - Professional SEO Analysis Tool',
  description: 'Comprehensive SEO analysis and optimization tool for modern websites. Get detailed insights, technical audits, and actionable recommendations.',
  keywords: ['SEO', 'analysis', 'optimization', 'website', 'audit', 'WitG seo'],
  authors: [{ name: 'WitG seo Team' }],
  creator: 'WitG seo',
  publisher: 'WitG seo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://witg-seo.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'WitG seo - Professional SEO Analysis Tool',
    description: 'Comprehensive SEO analysis and optimization tool for modern websites.',
    url: 'https://witg-seo.com',
    siteName: 'WitG seo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WitG seo - SEO Analysis Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WitG seo - Professional SEO Analysis Tool',
    description: 'Comprehensive SEO analysis and optimization tool for modern websites.',
    images: ['/og-image.png'],
    creator: '@witgseo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}