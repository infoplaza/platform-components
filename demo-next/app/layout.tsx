import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../../dist/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Map viewer · Infoplaza Platform',
  description: 'Next.js demo of @infoplaza/platform map components',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
