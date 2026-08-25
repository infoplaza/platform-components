import type { Metadata } from 'next'
import { TimeseriesClient } from '../../components/timeseries'

export const metadata: Metadata = {
  title: 'Timeseries',
}

export default function TimeseriesPage() {
  return <TimeseriesClient />
}
