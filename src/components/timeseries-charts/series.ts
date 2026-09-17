import { getPrecipitationType } from '../timeseries/cells/precipitation-type'
import type { TimeseriesCell } from '../timeseries/types'
import { DEFAULT_TIMESERIES_CHART_LINE_COLORS } from './defaults'
import type {
  TimeseriesChartDirectionOverlay,
  TimeseriesChartElementItem,
  TimeseriesChartHourInterval,
  TimeseriesChartLineSeries,
  TimeseriesChartPrecipitationTypeOverlay,
  TimeseriesChartValueOverlay,
} from './types'

export function toMillis(timestamp: number): number {
  return timestamp < 1e12 ? timestamp * 1000 : timestamp
}

export function formatChartValue(
  value: number,
  decimals: number | undefined,
): string {
  const places = decimals ?? 0
  if (places <= 0) {
    return String(Math.round(value))
  }
  return value.toFixed(places)
}

export function lineColorForIndex(index: number, color?: string): string {
  if (color) {
    return color
  }
  return DEFAULT_TIMESERIES_CHART_LINE_COLORS[
    index % DEFAULT_TIMESERIES_CHART_LINE_COLORS.length
  ]
}

export function mutateLineSeries(
  item: TimeseriesChartElementItem,
  cells: TimeseriesCell[],
  colorIndex: number,
): {
  series: TimeseriesChartLineSeries
  points: Array<{ ts: number; value: number | null }>
} {
  return {
    series: {
      slug: item.slug,
      title: item.title,
      element: item.element,
      unit: item.unit,
      color: lineColorForIndex(colorIndex, item.color),
      decimals: item.decimals,
    },
    points: cells.map((cell) => ({
      ts: toMillis(cell.timestamp),
      value: cell.value,
    })),
  }
}

export function mutateDirectionOverlay(
  item: TimeseriesChartElementItem,
  cells: TimeseriesCell[],
): TimeseriesChartDirectionOverlay {
  return {
    slug: item.slug,
    title: item.title,
    points: cells.flatMap((cell) => {
      if (cell.value == null || !Number.isFinite(cell.value)) {
        return []
      }
      return [{ ts: toMillis(cell.timestamp), direction: cell.value }]
    }),
  }
}

export function mutateValueOverlay(
  item: TimeseriesChartElementItem,
  cells: TimeseriesCell[],
): TimeseriesChartValueOverlay {
  return {
    slug: item.slug,
    title: item.title,
    unit: item.unit,
    stripLabel: item.stripLabel,
    points: cells.map((cell) => ({
      ts: toMillis(cell.timestamp),
      value: cell.value,
      label:
        cell.value == null || !Number.isFinite(cell.value)
          ? ''
          : formatChartValue(cell.value, item.decimals),
    })),
  }
}

export function mutatePrecipitationTypeOverlay(
  item: TimeseriesChartElementItem,
  cells: TimeseriesCell[],
): TimeseriesChartPrecipitationTypeOverlay {
  return {
    slug: item.slug,
    title: item.title,
    points: cells.flatMap((cell) => {
      if (cell.value == null || !Number.isFinite(cell.value)) {
        return []
      }
      const typeInfo = getPrecipitationType(Math.round(cell.value))
      if (!typeInfo) {
        return []
      }
      return [
        {
          ts: toMillis(cell.timestamp),
          value: Math.round(cell.value),
          title: typeInfo.title,
        },
      ]
    }),
  }
}

export function alignLineRows(
  series: Array<{
    slug: string
    points: Array<{ ts: number; value: number | null }>
  }>,
): Array<Record<string, unknown>> {
  const timestamps = new Set<number>()
  for (const entry of series) {
    for (const point of entry.points) {
      timestamps.add(point.ts)
    }
  }

  const maps = series.map((entry) => ({
    slug: entry.slug,
    values: new Map(entry.points.map((point) => [point.ts, point.value])),
  }))

  return [...timestamps]
    .sort((a, b) => a - b)
    .map((ts) => {
      const row: Record<string, unknown> = { ts }
      for (const entry of maps) {
        row[entry.slug] = entry.values.has(ts)
          ? entry.values.get(ts)
          : null
      }
      return row
    })
}

/** Re-index line rows onto a shared timestamp list so Brush indices match. */
export function alignRowsToTimestamps(
  data: Array<Record<string, unknown>>,
  keys: string[],
  timestamps: number[],
): Array<Record<string, unknown>> {
  const byTs = new Map(data.map((row) => [Number(row.ts), row]))
  return timestamps.map((ts) => {
    const existing = byTs.get(ts)
    const row: Record<string, unknown> = { ts }
    for (const key of keys) {
      row[key] = existing?.[key] ?? null
    }
    return row
  })
}

export function dayTicks(startMs: number, endMs: number): number[] {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) {
    return []
  }

  const ticks = new Set<number>([startMs, endMs])
  const current = new Date(startMs)
  current.setHours(0, 0, 0, 0)
  if (current.getTime() < startMs) {
    current.setDate(current.getDate() + 1)
  }

  while (current.getTime() < endMs) {
    ticks.add(current.getTime())
    current.setDate(current.getDate() + 1)
  }

  return [...ticks].sort((a, b) => a - b)
}

const HOUR_MS = 60 * 60 * 1000

export function hourTicks(
  startMs: number,
  endMs: number,
  intervalHours: TimeseriesChartHourInterval,
): number[] {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) {
    return []
  }

  const intervalMs = intervalHours * HOUR_MS
  const current = new Date(startMs)
  current.setHours(0, 0, 0, 0)
  const ticks: number[] = []

  while (current.getTime() <= endMs) {
    const ts = current.getTime()
    if (ts >= startMs) {
      ticks.push(ts)
    }
    current.setTime(ts + intervalMs)
  }

  return ticks
}
