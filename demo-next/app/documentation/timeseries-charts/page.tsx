import type { Metadata } from 'next'
import { TimeseriesChartsDocs } from '../../../components/documentation/content/timeseries-charts-docs'

export const metadata: Metadata = {
  title: 'Timeseries charts · Documentation',
}

export default function TimeseriesChartsDocumentationPage() {
  return <TimeseriesChartsDocs />
}
