import type { Metadata } from 'next'
import { IntroductionDocs } from '../../components/documentation/content/introduction'

export const metadata: Metadata = {
  title: 'Introduction · Documentation',
}

export default function DocumentationPage() {
  return <IntroductionDocs />
}
