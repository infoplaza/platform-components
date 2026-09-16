import { formatDate } from '@/src/utilities/date'
import { formatChartValue } from '../series'
import { toSupportedLocale } from '../locale'
import type { TimeseriesChartGraphConfig } from '../types'

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
}: {
  config: TimeseriesChartGraphConfig
  timestamp: number | null
  locale: string
  timezone: string | null
}) {
  if (timestamp == null) {
    return null
  }

  const row = config.data.find((entry) => Number(entry.ts) === timestamp)
  if (!row) {
    return null
  }

  return (
    <div className="ip:flex ip:flex-wrap ip:items-center ip:gap-x-3 ip:gap-y-1 ip:text-[11px] ip:text-dark/80 ip:dark:text-white/80">
      <span className="ip:font-semibold">
        {formatChartTimestamp(timestamp, locale, timezone)}
      </span>
      {config.lines.map((line) => {
        const raw = row[line.slug]
        const value = typeof raw === 'number' ? raw : Number(raw)
        const label =
          Number.isFinite(value)
            ? `${formatChartValue(value, line.decimals)}${line.unit ? ` ${line.unit}` : ''}`
            : '—'
        return (
          <span key={line.slug} className="ip:flex ip:items-center ip:gap-1">
            <span
              className="ip:inline-block ip:h-1.5 ip:w-1.5 ip:rounded-full"
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
