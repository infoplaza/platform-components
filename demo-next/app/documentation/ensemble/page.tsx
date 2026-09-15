import type { Metadata } from 'next'
import { EnsembleDocs } from '../../../components/documentation/content/ensemble-docs'

export const metadata: Metadata = {
  title: 'Ensemble · Documentation',
}

export default function EnsembleDocumentationPage() {
  return <EnsembleDocs />
}
