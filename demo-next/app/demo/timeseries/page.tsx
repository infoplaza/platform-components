import type { Metadata } from 'next'
import { TimeseriesClient } from '../../../components/timeseries'

export const metadata: Metadata = {
  title: 'Timeseries · Demo',
}

export default function DemoTimeseriesPage() {
  return <TimeseriesClient />
}
