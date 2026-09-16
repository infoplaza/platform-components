import type { Metadata } from 'next'
import { TimeseriesChartsClient } from '../../../components/timeseries-charts'

export const metadata: Metadata = {
  title: 'Timeseries charts · Demo',
}

export default function DemoTimeseriesChartsPage() {
  return <TimeseriesChartsClient />
}
