import type { Metadata } from 'next'
import { EnsembleClient } from '../../components/ensemble'

export const metadata: Metadata = {
  title: 'Ensemble',
}

export default function EnsemblePage() {
  return <EnsembleClient />
}
