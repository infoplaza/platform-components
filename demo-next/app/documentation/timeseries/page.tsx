import type { Metadata } from 'next'
import { TimeseriesDocs } from '../../../components/documentation/content/timeseries-docs'

export const metadata: Metadata = {
  title: 'Timeseries · Documentation',
}

export default function TimeseriesDocumentationPage() {
  return <TimeseriesDocs />
}
