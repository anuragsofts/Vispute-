import type { Metadata, Viewport } from 'next'
import { Mukta, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'

// Devanagari (Marathi/Hindi)
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
  display: 'swap',
})

// General / English / numbers
const mukta = Mukta({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mukta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'विस्पुते हॉटेल',
  description: 'QR टेबल ऑर्डरिंग – Vispute Restaurant',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'विस्पुते हॉटेल',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#B45309',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mr" className={`${notoDevanagari.variable} ${mukta.variable}`}>
      <body className="antialiased min-h-screen bg-cream text-brown-900">
        {children}
      </body>
    </html>
  )
}
