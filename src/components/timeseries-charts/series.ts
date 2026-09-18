import {
  getPrecipitationType,
  resolvePrecipitationTypeColor,
} from '../timeseries/cells/precipitation-type'
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
  const style = item.line
  return {
    series: {
      slug: item.slug,
      title: item.title,
      element: item.element,
      unit: item.unit,
      color: lineColorForIndex(colorIndex, style?.color ?? item.color),
      decimals: item.decimals,
      strokeWidth: style?.strokeWidth,
      strokeDasharray: style?.strokeDasharray,
      opacity: style?.opacity,
      type: style?.type,
      connectNulls: style?.connectNulls,
      dot: style?.dot,
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
      const value = Math.round(cell.value)
      const typeInfo = getPrecipitationType(value)
      if (!typeInfo) {
        return []
      }
      return [
        {
          ts: toMillis(cell.timestamp),
          value,
          title: typeInfo.title,
          color:
            resolvePrecipitationTypeColor(value, cell.color.background) ??
            '#6c757d',
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

export type TimeseriesChartHourBucket = {
  startTs: number
  endTs: number
  displayTs: number
}

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

/** Midnight-aligned half-open hour-grid buckets, matching `hourTicks`. */
export function hourBuckets(
  startMs: number,
  endMs: number,
  intervalHours: TimeseriesChartHourInterval,
): TimeseriesChartHourBucket[] {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) {
    return []
  }

  const intervalMs = intervalHours * HOUR_MS
  const current = new Date(startMs)
  current.setHours(0, 0, 0, 0)
  const buckets: TimeseriesChartHourBucket[] = []

  while (current.getTime() < endMs) {
    const startTs = current.getTime()
    const endTs = startTs + intervalMs
    if (endTs > startMs && startTs < endMs) {
      const visibleStart = Math.max(startTs, startMs)
      const visibleEnd = Math.min(endTs, endMs)
      if (visibleEnd > visibleStart) {
        buckets.push({
          startTs,
          endTs,
          displayTs: (visibleStart + visibleEnd) / 2,
        })
      }
    }
    current.setTime(endTs)
  }

  return buckets
}

function bucketIndexForTs(
  buckets: TimeseriesChartHourBucket[],
  ts: number,
): number {
  let low = 0
  let high = buckets.length - 1
  while (low <= high) {
    const mid = (low + high) >> 1
    const bucket = buckets[mid]
    if (!bucket) {
      return -1
    }
    if (ts < bucket.startTs) {
      high = mid - 1
    } else if (ts >= bucket.endTs) {
      low = mid + 1
    } else {
      return mid
    }
  }
  return -1
}

/**
 * For 3h/6h, keep the latest point in each hour-grid bucket and rewrite `ts`
 * to the visible bucket midpoint. Interval 1 is a no-op (original points).
 */
export function summarizeStripPoints<T extends { ts: number }>(
  points: T[],
  domain: [number, number] | undefined,
  hourInterval: TimeseriesChartHourInterval,
): T[] {
  if (hourInterval === 1) {
    return points
  }
  const startMs = domain?.[0]
  const endMs = domain?.[1]
  if (
    startMs == null ||
    endMs == null ||
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs)
  ) {
    return points
  }

  const buckets = hourBuckets(startMs, endMs, hourInterval)
  if (buckets.length === 0) {
    return []
  }

  const latest = new Array<T | undefined>(buckets.length)
  for (const point of points) {
    if (!Number.isFinite(point.ts)) {
      continue
    }
    const index = bucketIndexForTs(buckets, point.ts)
    if (index < 0) {
      continue
    }
    const current = latest[index]
    if (!current || point.ts >= current.ts) {
      latest[index] = point
    }
  }

  const summarized: T[] = []
  for (let index = 0; index < buckets.length; index += 1) {
    const point = latest[index]
    const displayTs = buckets[index]?.displayTs
    if (!point || displayTs == null) {
      continue
    }
    summarized.push(
      point.ts === displayTs ? point : { ...point, ts: displayTs },
    )
  }
  return summarized
}
