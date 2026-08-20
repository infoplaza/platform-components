import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../../dist/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Platform Components Next Demo',
  description: 'Next.js distribution demo for @infoplaza/platform',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
