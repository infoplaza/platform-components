import { degreesToCompass } from '../../timeseries/utils'
import { formatChartValue } from '../series'
import type { TimeseriesChartGraphConfig } from '../types'

export type TimeseriesChartHoverMetric =
  | {
      kind: 'line'
      slug: string
      title: string
      color: string
      label: string
    }
  | {
      kind: 'direction'
      slug: string
      title: string
      direction: number | null
      label: string
    }
  | {
      kind: 'value'
      slug: string
      title: string
      label: string
    }
  | {
      kind: 'precipitationType'
      slug: string
      title: string
      color?: string
      label: string
    }

function numericValue(raw: unknown): number {
  if (typeof raw === 'number') {
    return raw
  }
  if (raw == null || raw === '') {
    return Number.NaN
  }
  return Number(raw)
}

function formatDirectionLabel(direction: number): string {
  const degrees = Math.round(direction)
  const compass = degreesToCompass(direction)
  return compass ? `${degrees}° ${compass}` : `${degrees}°`
}

/** LINE, DIRECTION, VALUE, then PRECIPITATION_TYPE at an exact timestamp. */
export function hoverMetrics(
  config: TimeseriesChartGraphConfig,
  timestamp: number,
): TimeseriesChartHoverMetric[] {
  const row = config.data.find((entry) => Number(entry.ts) === timestamp)
  const metrics: TimeseriesChartHoverMetric[] = []

  for (const line of config.lines) {
    const value = numericValue(row?.[line.slug])
    metrics.push({
      kind: 'line',
      slug: line.slug,
      title: line.title,
      color: line.color,
      label: Number.isFinite(value)
        ? `${formatChartValue(value, line.decimals)}${line.unit ? ` ${line.unit}` : ''}`
        : '—',
    })
  }

  for (const overlay of config.directions) {
    const point = overlay.points.find((entry) => Number(entry.ts) === timestamp)
    const direction =
      point && Number.isFinite(point.direction) ? point.direction : null
    metrics.push({
      kind: 'direction',
      slug: overlay.slug,
      title: overlay.title,
      direction,
      label: direction != null ? formatDirectionLabel(direction) : '—',
    })
  }

  for (const overlay of config.values) {
    const point = overlay.points.find((entry) => Number(entry.ts) === timestamp)
    const valueLabel = point?.label
    metrics.push({
      kind: 'value',
      slug: overlay.slug,
      title: overlay.stripLabel ?? overlay.title,
      label: valueLabel
        ? `${valueLabel}${overlay.unit ? ` ${overlay.unit}` : ''}`
        : '—',
    })
  }

  for (const overlay of config.precipitationTypes) {
    const point = overlay.points.find((entry) => Number(entry.ts) === timestamp)
    metrics.push({
      kind: 'precipitationType',
      slug: overlay.slug,
      title: overlay.title,
      color: point?.color,
      label: point?.title ?? '—',
    })
  }

  return metrics
}
