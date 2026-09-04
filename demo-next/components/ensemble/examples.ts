export const PACKAGED_FILENAME = 'packaged.tsx'

export const PACKAGED_SOURCE = `'use client'

import { EnsembleForecast } from '@infoplaza/platform/ensemble'

export default function PackagedEnsemble() {
  return (
    <EnsembleForecast
      lat={52.3676}
      lon={4.9041}
      locale="en"
    />
  )
}
`

export const CHART_ONLY_FILENAME = 'chart-only.tsx'

export const CHART_ONLY_SOURCE = `'use client'

import { EnsembleForecast } from '@infoplaza/platform/ensemble'

export default function ChartOnlyEnsemble() {
  return (
    <EnsembleForecast
      lat={52.3676}
      lon={4.9041}
      locale="en"
      showToolbar={false}
      showFooter={false}
    />
  )
}
`

export const COMPOSED_FILENAME = 'composed.tsx'

export const COMPOSED_SOURCE = `'use client'

import {
  EnsembleBuilder,
  EnsembleChart,
  EnsembleFooter,
  EnsembleModelsProvider,
  EnsembleProvider,
  EnsembleToolbar,
} from '@infoplaza/platform/ensemble'

export default function ComposedEnsemble() {
  return (
    <EnsembleModelsProvider lat={52.3676} lon={4.9041}>
      <EnsembleProvider locale="en">
        <EnsembleToolbar />
        <EnsembleBuilder>
          <EnsembleChart />
        </EnsembleBuilder>
        <EnsembleFooter />
      </EnsembleProvider>
    </EnsembleModelsProvider>
  )
}
`
