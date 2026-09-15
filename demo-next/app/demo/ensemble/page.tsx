import type { Metadata } from 'next'
import { EnsembleClient } from '../../../components/ensemble'

export const metadata: Metadata = {
  title: 'Ensemble · Demo',
}

export default function DemoEnsemblePage() {
  return <EnsembleClient />
}
