export const PACKAGED_FILENAME = 'packaged.tsx'

export const PACKAGED_SOURCE = `'use client'

import { TimeseriesForecast } from '@infoplaza/platform/timeseries'

export default function PackagedTimeseries({ getBlocks }) {
  return (
    <TimeseriesForecast
      lat={52.3676}
      lon={4.9041}
      getBlocks={getBlocks}
      locale="en"
      headerFormat={['EEEEEE d MMM', 'HH']}
      scrollToCurrentTime
    />
  )
}
`

export const CHART_ONLY_FILENAME = 'chart-only.tsx'

export const CHART_ONLY_SOURCE = `'use client'

import { TimeseriesForecast } from '@infoplaza/platform/timeseries'

export default function ChartOnlyTimeseries({ getBlocks }) {
  return (
    <TimeseriesForecast
      lat={52.3676}
      lon={4.9041}
      getBlocks={getBlocks}
      locale="en"
      headerFormat={['EEEEEE d MMM', 'HH']}
      scrollToCurrentTime
      showToolbar={false}
      showFooter={false}
    />
  )
}
`

export const COMPOSED_FILENAME = 'composed.tsx'

export const COMPOSED_SOURCE = `'use client'

import {
  TimeseriesBuilder,
  TimeseriesChart,
  TimeseriesFooter,
  TimeseriesModelsProvider,
  TimeseriesProvider,
  TimeseriesToolbar,
} from '@infoplaza/platform/timeseries'

export default function ComposedTimeseries({ getBlocks }) {
  return (
    <TimeseriesModelsProvider lat={52.3676} lon={4.9041}>
      <TimeseriesProvider
        getBlocks={getBlocks}
        locale="en"
        headerFormat={['EEEEEE d MMM', 'HH']}
        scrollToCurrentTime
      >
        <TimeseriesToolbar />
        <TimeseriesBuilder>
          <TimeseriesChart />
        </TimeseriesBuilder>
        <TimeseriesFooter />
      </TimeseriesProvider>
    </TimeseriesModelsProvider>
  )
}
`
