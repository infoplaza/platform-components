import type { Metadata } from 'next'
import { InstallDocs } from '../../../components/documentation/content/install'

export const metadata: Metadata = {
  title: 'Installation · Documentation',
}

export default function InstallDocumentationPage() {
  return <InstallDocs />
}
