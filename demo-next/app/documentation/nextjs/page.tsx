import type { Metadata } from 'next'
import { NextJsDocs } from '../../../components/documentation/content/nextjs'

export const metadata: Metadata = {
  title: 'Next.js · Documentation',
}

export default function NextJsDocumentationPage() {
  return <NextJsDocs />
}
