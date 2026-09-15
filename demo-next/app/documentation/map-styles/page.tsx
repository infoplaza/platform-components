import type { Metadata } from 'next'
import { MapStylesDocs } from '../../../components/documentation/content/map-styles'

export const metadata: Metadata = {
  title: 'Map styles · Documentation',
}

export default function MapStylesDocumentationPage() {
  return <MapStylesDocs />
}
