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
  TimeseriesChartGraphConfig,
  TimeseriesChartHourInterval,
} from './types'

type GroupIcon = NonNullable<TimeseriesChartElementGroup['icon']>

/** Plot-area height in pixels. Hosts can override via `plotHeight`. */
export const DEFAULT_TIMESERIES_CHART_PLOT_HEIGHT = 320

/** Vertical hour-grid interval in hours. Hosts can override via `hourInterval`. */
export const DEFAULT_TIMESERIES_CHART_HOUR_INTERVAL: TimeseriesChartHourInterval = 6

/** Docked Recharts Brush bar (container height). */
export const TIMESERIES_CHART_BRUSH_HEIGHT = 40

/** Traveller track height inside the Brush chart. */
export const TIMESERIES_CHART_BRUSH_TRACK_HEIGHT = 24

/** ComposedChart top margin. */
export const TIMESERIES_CHART_PLOT_TOP_MARGIN = 1

/** Vertical space for X-axis date ticks below the plot / custom strip. */
export const TIMESERIES_CHART_DATE_AXIS_HEIGHT = 24

/**
 * Extra pixels around the plot besides the custom strip band
 * (top margin + date-tick band).
 */
export const TIMESERIES_CHART_PLOT_CHROME_HEIGHT =
  TIMESERIES_CHART_PLOT_TOP_MARGIN + TIMESERIES_CHART_DATE_AXIS_HEIGHT

/** Gap between the plot bottom and the first custom strip row. */
export const TIMESERIES_CHART_STRIP_GAP = 0

/** Height of one DIRECTION / VALUE / PRECIPITATION_TYPE strip row. */
export const TIMESERIES_CHART_STRIP_ROW_HEIGHT = 18

/** Gap between the last strip row and the date ticks. */
export const TIMESERIES_CHART_STRIP_DATE_GAP = 8

/** Thin threshold status band above the date labels. */
export const TIMESERIES_CHART_THRESHOLD_STRIP_HEIGHT = 6

/** Pixel height of the operator-direction hue on a threshold Y-line. */
export const TIMESERIES_CHART_THRESHOLD_HUE_HEIGHT = 18

type StripConfig = Pick<
  TimeseriesChartGraphConfig,
  'directions' | 'values' | 'precipitationTypes'
>

export function timeseriesChartStripRowCount(config: StripConfig): number {
  return (
    (config.directions.length > 0 ? 1 : 0) +
    (config.values.length > 0 ? 1 : 0) +
    (config.precipitationTypes.length > 0 ? 1 : 0)
  )
}

/** Custom-view strip height only (no date-tick band). */
export function timeseriesChartStripHeight(
  config: StripConfig,
  options?: { thresholdStrip?: boolean },
): number {
  const rows = timeseriesChartStripRowCount(config)
  const overlays =
    rows > 0
      ? TIMESERIES_CHART_STRIP_GAP + rows * TIMESERIES_CHART_STRIP_ROW_HEIGHT
      : 0
  if (options?.thresholdStrip) {
    return (
      overlays +
      TIMESERIES_CHART_THRESHOLD_STRIP_HEIGHT +
      TIMESERIES_CHART_STRIP_DATE_GAP
    )
  }
  if (rows === 0) {
    return 0
  }
  return overlays + TIMESERIES_CHART_STRIP_DATE_GAP
}

export function timeseriesChartStripRowCenter(
  plotBottom: number,
  rowIndex: number,
): number {
  return (
    plotBottom +
    TIMESERIES_CHART_STRIP_GAP +
    rowIndex * TIMESERIES_CHART_STRIP_ROW_HEIGHT +
    TIMESERIES_CHART_STRIP_ROW_HEIGHT / 2
  )
}

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
