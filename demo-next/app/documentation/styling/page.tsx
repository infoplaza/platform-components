import type { Metadata } from 'next'
import { StylingDocs } from '../../../components/documentation/content/styling'

export const metadata: Metadata = {
  title: 'Styling · Documentation',
}

export default function StylingDocumentationPage() {
  return <StylingDocs />
}
