import { formatDate } from '@/src/utilities/date'
import { formatChartValue } from '../series'
import { toSupportedLocale } from '../locale'
import type {
  TimeseriesChartGraphConfig,
  TimeseriesChartThresholdLevel,
} from '../types'
import {
  TIMESERIES_CHART_THRESHOLD_COLORS,
  TIMESERIES_CHART_THRESHOLD_LABELS,
} from '../thresholds'

export function formatChartTimestamp(
  value: unknown,
  locale: string,
  timezone: string | null,
  pattern = 'EEEE d LLL HH:mm',
): string {
  const ms = Number(value)
  if (!Number.isFinite(ms)) {
    return ''
  }
  return (
    formatDate(ms, pattern, toSupportedLocale(locale), timezone ?? undefined) ??
    ''
  )
}

export default function ChartHoverHeader({
  config,
  timestamp,
  locale,
  timezone,
  thresholdLevel = null,
}: {
  config: TimeseriesChartGraphConfig
  timestamp: number | null
  locale: string
  timezone: string | null
  thresholdLevel?: TimeseriesChartThresholdLevel | null
}) {
  if (timestamp == null) {
    return null
  }

  const row = config.data.find((entry) => Number(entry.ts) === timestamp)
  if (!row) {
    return null
  }

  const level =
    thresholdLevel && thresholdLevel !== 'none' ? thresholdLevel : null
  const levelColor = level ? TIMESERIES_CHART_THRESHOLD_COLORS[level] : undefined

  return (
    <div className="ip:flex ip:items-center ip:gap-x-3 ip:whitespace-nowrap ip:text-[11px] ip:leading-none ip:text-dark/80 ip:dark:text-white/80">
      <span className="ip:font-semibold ip:text-dark ip:dark:text-white">
        {formatChartTimestamp(timestamp, locale, timezone)}
      </span>
      {level ? (
        <span
          className="ip:inline-flex ip:items-center ip:gap-1 ip:font-semibold"
          style={{ color: levelColor }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path d="M5 1.2 9.2 8.8H.8Z" fill="currentColor" />
          </svg>
          {TIMESERIES_CHART_THRESHOLD_LABELS[level]}
        </span>
      ) : null}
      {config.lines.map((line) => {
        const raw = row[line.slug]
        const value = typeof raw === 'number' ? raw : raw == null || raw === '' ? Number.NaN : Number(raw)
        const label =
          Number.isFinite(value)
            ? `${formatChartValue(value, line.decimals)}${line.unit ? ` ${line.unit}` : ''}`
            : '—'
        return (
          <span
            key={line.slug}
            className="ip:flex ip:items-center ip:gap-1"
            style={{ color: line.color }}
          >
            <span
              className="ip:inline-block ip:h-2 ip:w-2 ip:shrink-0 ip:rounded-full"
              style={{ backgroundColor: line.color }}
            />
            <span>
              {line.title}: {label}
            </span>
          </span>
        )
      })}
      {config.precipitationTypes.map((overlay) => {
        const point = overlay.points.find((entry) => entry.ts === timestamp)
        return (
          <span key={overlay.slug} className="ip:flex ip:items-center ip:gap-1">
            <span>
              {overlay.title}: {point?.title ?? '—'}
            </span>
          </span>
        )
      })}
    </div>
  )
}
