import type { Metadata } from 'next'
import { MapLibreDocs } from '../../../components/documentation/content/maplibre'

export const metadata: Metadata = {
  title: 'MapLibre 6 · Documentation',
}

export default function MapLibreDocumentationPage() {
  return <MapLibreDocs />
}
