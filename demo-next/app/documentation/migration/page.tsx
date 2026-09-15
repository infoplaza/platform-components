import type { Metadata } from 'next'
import { MigrationDocs } from '../../../components/documentation/content/migration'

export const metadata: Metadata = {
  title: 'Migration · Documentation',
}

export default function MigrationDocumentationPage() {
  return <MigrationDocs />
}
