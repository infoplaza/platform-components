import type { Metadata } from 'next'
import { MapOldClient } from '../../components/map'

export const metadata: Metadata = {
  title: 'Map Old',
}

export default function MapOldPage() {
  return <MapOldClient />
}
