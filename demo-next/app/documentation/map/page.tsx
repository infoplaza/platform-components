import type { Metadata } from 'next'
import { MapComponentsDocs } from '../../../components/documentation/content/map-docs'

export const metadata: Metadata = {
  title: 'Map · Documentation',
}

export default function MapDocumentationPage() {
  return <MapComponentsDocs />
}
