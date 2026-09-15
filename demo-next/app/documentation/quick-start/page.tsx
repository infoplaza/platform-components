import type { Metadata } from 'next'
import { QuickStartDocs } from '../../../components/documentation/content/quick-start'

export const metadata: Metadata = {
  title: 'Quick start · Documentation',
}

export default function QuickStartDocumentationPage() {
  return <QuickStartDocs />
}
