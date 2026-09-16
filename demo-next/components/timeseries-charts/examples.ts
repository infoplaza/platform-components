export const PACKAGED_FILENAME = 'packaged.tsx'

export const PACKAGED_SOURCE = `'use client'

import { TimeseriesChartsForecast } from '@infoplaza/platform/timeseries-charts'

export default function PackagedTimeseriesCharts() {
  // Amsterdam
  return (
    <TimeseriesChartsForecast
      lat={52.3676}
      lon={4.9041}
      model="gfs"
      locale="en"
    />
  )
}
`

export const CHART_ONLY_FILENAME = 'chart-only.tsx'

export const CHART_ONLY_SOURCE = `'use client'

import { TimeseriesChartsForecast } from '@infoplaza/platform/timeseries-charts'

export default function ChartOnlyTimeseriesCharts() {
  // Amsterdam
  return (
    <TimeseriesChartsForecast
      lat={52.3676}
      lon={4.9041}
      model="gfs"
      locale="en"c
      showToolbar={false}
    />
  )
}
`

export const MARINE_FILENAME = 'marine.tsx'

export const MARINE_SOURCE = `'use client'

import { TimeseriesChartsForecast } from '@infoplaza/platform/timeseries-charts'

export default function MarineTimeseriesCharts() {
  // North Sea
  return (
    <TimeseriesChartsForecast
      lat={55.551448725742}
      lon={4.0444930642829116}
      domain="marine"
      model="gfswave"
      locale="en"
    />
  )
}
`

export const COMPOSED_FILENAME = 'composed.tsx'

export const COMPOSED_SOURCE = `'use client'

import {
  TimeseriesChartsBuilder,
  TimeseriesChartsChart,
  TimeseriesChartsProvider,
  TimeseriesChartsToolbar,
  TimeseriesModelsProvider,
} from '@infoplaza/platform/timeseries-charts'

export default function ComposedTimeseriesCharts() {
  // Amsterdam
  return (
    <TimeseriesModelsProvider lat={52.3676} lon={4.9041}>
      <TimeseriesChartsProvider locale="en">
        <TimeseriesChartsToolbar />
        <TimeseriesChartsBuilder>
          <TimeseriesChartsChart />
        </TimeseriesChartsBuilder>
      </TimeseriesChartsProvider>
    </TimeseriesModelsProvider>
  )
}
`
