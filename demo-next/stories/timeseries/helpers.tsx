import type { ReactNode } from 'react'
import {
  TimeseriesModelsProvider,
  TimeseriesProvider,
  type TimeseriesProviderProps,
} from '@infoplaza/platform/timeseries'
import {
  AMSTERDAM,
  getTimeseriesBlocks,
} from '../../components/timeseries/fixtures'

export const ELEMENT_GROUP_KEYS = [
  'overview',
  'temperature',
  'moisture',
  'wind',
  'precipitation',
  'stability',
  'airquality',
  'wave',
] as const

export const LOCALES = ['en', 'nl', 'de', 'it', 'es', 'fr'] as const

export function getIconSrc(value: number | null): string | null {
  if (value == null) return null
  const n = Math.round(value)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#00BF78"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">${n}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function FixtureProviders({
  children,
  ...providerProps
}: TimeseriesProviderProps & { children: ReactNode }) {
  return (
    <TimeseriesModelsProvider lat={AMSTERDAM.lat} lon={AMSTERDAM.lon}>
      <TimeseriesProvider
        getBlocks={getTimeseriesBlocks}
        getIconSrc={getIconSrc}
        locale="en"
        timezone={null}
        headerFormat={['EEEEEE d MMM', 'HH']}
        scrollToCurrentTime
        {...providerProps}
      >
        {children}
      </TimeseriesProvider>
    </TimeseriesModelsProvider>
  )
}
