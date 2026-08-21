import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@infoplaza/platform/styles.css'
import './globals.css'
import { AppShell } from '../components/layouts'
import { TopNav } from '../components/navigation'

export const metadata: Metadata = {
  title: {
    default: 'Demo · Infoplaza Platform',
    template: '%s · Infoplaza Platform',
  },
  description: 'Next.js demo of @infoplaza/platform map components',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell header={<TopNav />}>{children}</AppShell>
      </body>
    </html>
  )
}
