import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@infoplaza/platform/styles.css'
import './globals.css'
import { AppShell } from '../components/layouts'
import { TopNav } from '../components/navigation'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Demo · Infoplaza Platform',
    template: '%s · Infoplaza Platform',
  },
  description: 'Next.js demo of @infoplaza/platform map components',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full ${poppins.className}`}>
      <body className="h-full min-h-dvh bg-cloud font-sans text-dark antialiased">
        <AppShell header={<TopNav />}>{children}</AppShell>
      </body>
    </html>
  )
}
