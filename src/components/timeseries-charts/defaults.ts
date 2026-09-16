import type { ComponentType } from 'react'
import {
  IpCloudSunHail,
  IpSignificantWaveHeightIcon,
  IpTemperatureHalf,
  IpWind,
} from '@/src/components/icons'
import type { TimeseriesDomain } from '../timeseries/types'
import type {
  TimeseriesChartElementGroup,
  TimeseriesChartElementItem,
} from './types'

type GroupIcon = NonNullable<TimeseriesChartElementGroup['icon']>

/** Plot-area height in pixels. Hosts can override via `plotHeight`. */
export const DEFAULT_TIMESERIES_CHART_PLOT_HEIGHT = 320

/** Extra pixels for the X-axis / Recharts container around the plot. */
export const TIMESERIES_CHART_PLOT_CHROME_HEIGHT = 48

function groupIcon(Icon: ComponentType<{ className: string }>): GroupIcon {
  return Icon as GroupIcon
}

const UNIT_BY_KEY: Record<string, string> = {
  precipitation: 'mm/hr',
  temperature: '°C',
  wave: 'm',
  wind: 'm/s',
  windgust: 'm/s',
}

function item(partial: TimeseriesChartElementItem): TimeseriesChartElementItem {
  return {
    ...partial,
    unit:
      partial.unit ??
      (partial.unitKey ? UNIT_BY_KEY[partial.unitKey] : undefined),
  }
}

export const DEFAULT_TIMESERIES_CHART_LINE_COLORS = [
  '#111111',
  '#9ca3af',
  '#3b82f6',
  '#0f766e',
  '#b45309',
] as const

const WIND_GROUP: TimeseriesChartElementGroup = {
  key: 'wind',
  title: 'Wind',
  icon: groupIcon(IpWind),
  items: [
    item({
      slug: 'wind_windspeed',
      title: 'Wind',
      element: 'windspeed',
      level: '10m',
      unitKey: 'wind',
      view: 'LINE',
    }),
    item({
      slug: 'wind_windgust',
      title: 'Wind gusts',
      element: 'windgust',
      level: '10m',
      unitKey: 'windgust',
      view: 'LINE',
    }),
    item({
      slug: 'wind_winddirection',
      title: 'Wind direction',
      element: 'winddirection',
      level: '10m',
      unit: '°',
      view: 'DIRECTION',
    }),
  ],
}

/**
 * Default land chart groups: one composed chart per group
 * (LINE + DIRECTION + VALUE + PRECIPITATION_TYPE). Used when `domain` is `land`.
 */
export const DEFAULT_LAND_TIMESERIES_CHART_GROUPS: TimeseriesChartElementGroup[] =
  [
    {
      key: 'temperature',
      title: 'Temperature',
      icon: groupIcon(IpTemperatureHalf),
      items: [
        item({
          slug: 'temperature_temperature',
          title: 'Temperature',
          element: 'temperature',
          level: '2m',
          unitKey: 'temperature',
          view: 'LINE',
        }),
        item({
          slug: 'temperature_dewpoint',
          title: 'Dewpoint',
          element: 'dewpoint',
          level: '2m',
          unitKey: 'temperature',
          view: 'LINE',
        }),
        item({
          slug: 'temperature_temperatureapparent',
          title: 'Feels like',
          element: 'temperatureapparent',
          level: '2m',
          unitKey: 'temperature',
          view: 'LINE',
        }),
      ],
    },
    {
      key: 'precipitation',
      title: 'Precipitation',
      icon: groupIcon(IpCloudSunHail),
      items: [
        item({
          slug: 'precipitation_precipitation',
          title: 'Precipitation',
          element: 'precipitation',
          unitKey: 'precipitation',
          view: 'LINE',
        }),
        item({
          slug: 'precipitation_precipitationrate',
          title: 'Precipitation rate',
          element: 'precipitationrate',
          unitKey: 'precipitation',
          view: 'LINE',
        }),
        item({
          slug: 'precipitation_probability',
          title: 'Probability',
          element: 'probability_precipitation',
          unit: '%',
          view: 'VALUE',
          stripLabel: 'PoP',
        }),
        item({
          slug: 'precipitation_precipitationtype',
          title: 'Precipitation type',
          element: 'precipitationtype',
          unit: '-',
          view: 'PRECIPITATION_TYPE',
        }),
      ],
    },
    WIND_GROUP,
  ]

/**
 * Default marine chart groups: one composed chart per group
 * (LINE + DIRECTION + VALUE). Used when `domain` is `marine`.
 */
export const DEFAULT_MARINE_TIMESERIES_CHART_GROUPS: TimeseriesChartElementGroup[] =
  [
    WIND_GROUP,
    {
      key: 'wave',
      title: 'Wave',
      icon: groupIcon(IpSignificantWaveHeightIcon),
      items: [
        item({
          slug: 'wave_waveheight_significant',
          title: 'Significant wave height',
          element: 'waveheight_significant',
          unitKey: 'wave',
          view: 'LINE',
        }),
        item({
          slug: 'wave_waveheight_swell',
          title: 'Swell wave height',
          element: 'waveheight_swell',
          unitKey: 'wave',
          view: 'LINE',
        }),
        item({
          slug: 'wave_waveheight_wind',
          title: 'Wind waves height',
          element: 'waveheight_wind',
          unitKey: 'wave',
          view: 'LINE',
        }),
        item({
          slug: 'wave_winddirection',
          title: 'Wind direction',
          element: 'winddirection',
          level: '10m',
          unit: '°',
          view: 'DIRECTION',
        }),
        item({
          slug: 'wave_waveperiod_wind',
          title: 'Wind wave period',
          element: 'waveperiod_wind',
          unit: 's',
          view: 'VALUE',
          stripLabel: 'TZ',
        }),
      ],
    },
  ]

/** @deprecated Use DEFAULT_LAND_TIMESERIES_CHART_GROUPS. */
export const DEFAULT_TIMESERIES_CHART_GROUPS =
  DEFAULT_LAND_TIMESERIES_CHART_GROUPS

export function defaultTimeseriesChartGroups(
  domain: TimeseriesDomain = 'land',
): TimeseriesChartElementGroup[] {
  return domain === 'marine'
    ? DEFAULT_MARINE_TIMESERIES_CHART_GROUPS
    : DEFAULT_LAND_TIMESERIES_CHART_GROUPS
}
