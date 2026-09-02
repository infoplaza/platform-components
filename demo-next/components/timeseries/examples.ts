export const PACKAGED_FILENAME = 'packaged.tsx'

export const PACKAGED_SOURCE = `'use client'

import { TimeseriesForecast } from '@infoplaza/platform/timeseries'

export default function PackagedTimeseries() {
  return (
    <TimeseriesForecast
      lat={52.3676}
      lon={4.9041}
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

export default function ChartOnlyTimeseries() {
  return (
    <TimeseriesForecast
      lat={52.3676}
      lon={4.9041}
      locale="en"
      headerFormat={['EEEEEE d MMM', 'HH']}
      scrollToCurrentTime
      showToolbar={false}
      showFooter={false}
    />
  )
}
`

export const CUSTOM_LOCATION_FILENAME = 'custom-location.tsx'

export const CUSTOM_LOCATION_SOURCE = `'use client'

import { type FormEvent, useState } from 'react'
import { TimeseriesForecast } from '@infoplaza/platform/timeseries'

export default function CustomLocationTimeseries() {
  const [lat, setLat] = useState(52.3676)
  const [lon, setLon] = useState(4.9041)
  const [latInput, setLatInput] = useState('52.3676')
  const [lonInput, setLonInput] = useState('4.9041')

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextLat = Number(latInput)
    const nextLon = Number(lonInput)
    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLon)) {
      return
    }
    setLat(nextLat)
    setLon(nextLon)
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>
          Latitude
          <input
            type="number"
            step="any"
            value={latInput}
            onChange={(event) => setLatInput(event.target.value)}
          />
        </label>
        <label>
          Longitude
          <input
            type="number"
            step="any"
            value={lonInput}
            onChange={(event) => setLonInput(event.target.value)}
          />
        </label>
        <button type="submit">Load forecast</button>
      </form>
      <TimeseriesForecast
        lat={lat}
        lon={lon}
        locale="en"
        headerFormat={['EEEEEE d MMM', 'HH']}
        scrollToCurrentTime
      />
    </div>
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

export default function ComposedTimeseries() {
  return (
    <TimeseriesModelsProvider lat={52.3676} lon={4.9041}>
      <TimeseriesProvider
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
