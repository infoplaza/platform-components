import type { Metadata } from 'next'
import { AuthDocs } from '../../../components/documentation/content/auth'

export const metadata: Metadata = {
  title: 'Server setup · Documentation',
}

export default function AuthDocumentationPage() {
  return <AuthDocs />
}
