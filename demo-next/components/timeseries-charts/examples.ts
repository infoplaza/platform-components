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
      locale="en"
      showToolbar={false}
    />
  )
}
`

export const MARINE_FILENAME = 'marine.tsx'

export const MARINE_SOURCE = `'use client'

import {
  TimeseriesChartsForecast,
  type TimeseriesChartThresholds,
} from '@infoplaza/platform/timeseries-charts'

const THRESHOLDS: TimeseriesChartThresholds = {
  ignored_hours: [],
  conditions: {
    yellow: [
      { rows: [{ elementId: 'windspeed', operator: 'greater-than', from: 2, to: null }] },
      { rows: [{ elementId: 'waveheight_significant', operator: 'greater-than', from: 0.8, to: null }] },
    ],
    orange: [
      {
        rows: [
          { elementId: 'windspeed', operator: 'greater-than', from: 5, to: null },
          { elementId: 'windgust', operator: 'greater-than', from: 25, to: null },
        ],
      },
      { rows: [{ elementId: 'waveheight_significant', operator: 'greater-than', from: 1.5, to: null }] },
    ],
    red: [
      {
        rows: [
          { elementId: 'windspeed', operator: 'greater-than', from: 8, to: null },
          { elementId: 'windgust', operator: 'greater-than', from: 30, to: null },
        ],
      },
      { rows: [{ elementId: 'waveheight_significant', operator: 'greater-than', from: 2.5, to: null }] },
    ],
  },
}

export default function MarineTimeseriesCharts() {
  // North Sea
  return (
    <TimeseriesChartsForecast
      lat={55.551448725742}
      lon={4.0444930642829116}
      domain="marine"
      model="gfswave"
      locale="en"
      thresholds={THRESHOLDS}
    />
  )
}
`

export const HOUR_INTERVAL_FILENAME = 'hour-interval.tsx'

export const HOUR_INTERVAL_SOURCE = `'use client'

import { useState } from 'react'
import {
  TimeseriesChartsForecast,
  type TimeseriesChartHourInterval,
} from '@infoplaza/platform/timeseries-charts'

const INTERVALS: TimeseriesChartHourInterval[] = [1, 3, 6]

export default function HourIntervalTimeseriesCharts() {
  const [hourInterval, setHourInterval] =
    useState<TimeseriesChartHourInterval>(6)

  return (
    <div>
      <div className="ip:flex ip:items-center ip:gap-2 ip:px-3 ip:py-2">
        <span className="ip:text-xs ip:font-medium ip:text-dark/60">
          Hour grid
        </span>
        <div className="ip:flex ip:h-5 ip:items-center ip:gap-1">
          {INTERVALS.map((hours) => (
            <button
              key={hours}
              type="button"
              onClick={() => setHourInterval(hours)}
              className={
                hourInterval === hours
                  ? 'ip:flex ip:h-full ip:cursor-pointer ip:items-center ip:rounded-full ip:bg-primary ip:px-2 ip:text-xs ip:leading-none ip:text-white'
                  : 'ip:flex ip:h-full ip:cursor-pointer ip:items-center ip:rounded-full ip:px-2 ip:text-xs ip:leading-none ip:opacity-50 ip:hover:bg-primary/20 ip:hover:opacity-100'
              }
            >
              {hours}h
            </button>
          ))}
        </div>
      </div>
      <TimeseriesChartsForecast
        lat={52.3676}
        lon={4.9041}
        model="gfs"
        locale="en"
        hourInterval={hourInterval}
      />
    </div>
  )
}
`

export const THRESHOLDS_FILENAME = 'thresholds.tsx'

export const THRESHOLDS_SOURCE = `'use client'

import {
  TimeseriesChartsForecast,
  type TimeseriesChartThresholds,
} from '@infoplaza/platform/timeseries-charts'

const THRESHOLDS: TimeseriesChartThresholds = {
  ignored_hours: [],
  conditions: {
    yellow: [
      { rows: [{ elementId: 'temperature', operator: 'greater-than', from: 8, to: null }] },
      { rows: [{ elementId: 'windspeed', operator: 'greater-than', from: 2, to: null }] },
      { rows: [{ elementId: 'temperature', operator: 'less-than', from: 12, to: null }] },
    ],
    orange: [
      {
        rows: [
          { elementId: 'windspeed', operator: 'greater-than', from: 5, to: null },
          { elementId: 'windgust', operator: 'greater-than', from: 25, to: null },
        ],
      },
      { rows: [{ elementId: 'temperature', operator: 'greater-than', from: 28, to: null }] },
      { rows: [{ elementId: 'precipitation', operator: 'greater-than', from: 3.2, to: null }] },
    ],
    red: [
      {
        rows: [
          { elementId: 'windspeed', operator: 'greater-than', from: 8, to: null },
          { elementId: 'windgust', operator: 'greater-than', from: 30, to: null },
        ],
      },
      { rows: [{ elementId: 'temperature', operator: 'greater-than', from: 20, to: null }] },
      { rows: [{ elementId: 'precipitation', operator: 'greater-than', from: 7.6, to: null }] },
    ],
  },
}

export default function ThresholdsTimeseriesCharts() {
  // Amsterdam
  return (
    <TimeseriesChartsForecast
      lat={52.3676}
      lon={4.9041}
      model="gfs"
      locale="en"
      thresholds={THRESHOLDS}
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

export const CUSTOM_ELEMENTS_FILENAME = 'custom-elements.tsx'

export const CUSTOM_ELEMENTS_SOURCE = `'use client'

import {
  TimeseriesChartsForecast,
  DEFAULT_LAND_TIMESERIES_CHART_GROUPS,
  type TimeseriesChartElementGroup,
} from '@infoplaza/platform/timeseries-charts'

const GROUPS: TimeseriesChartElementGroup[] = [
  DEFAULT_LAND_TIMESERIES_CHART_GROUPS.find((g) => g.key === 'temperature')!,
  {
    key: 'clouds',
    title: 'Cloud cover',
    items: [
      { slug: 'clouds_total', title: 'Total cloud cover', element: 'cloudcovertotal', unit: '%', view: 'LINE' },
      { slug: 'clouds_low', title: 'Low clouds', element: 'cloudcoverlow', unit: '%', view: 'LINE' },
    ],
  },
  {
    key: 'pressure',
    title: 'Pressure',
    items: [
      {
        slug: 'pressure_msl',
        title: 'Mean sea level pressure',
        element: 'pressure_meansealevel',
        unit: 'hPa',
        view: 'LINE',
      },
    ],
  },
]

export default function CustomElementsTimeseriesCharts() {
  // Amsterdam
  return (
    <TimeseriesChartsForecast
      lat={52.3676}
      lon={4.9041}
      model="gfs"
      locale="en"
      elementGroups={GROUPS}
    />
  )
}
`
