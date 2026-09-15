import type { Metadata } from 'next'
import { MapClient } from '../../components/map'

export const metadata: Metadata = {
  title: 'Map · Demo',
}

export default function DemoMapPage() {
  return <MapClient />
}
