import type { CSSProperties, ReactNode } from 'react'
import { formatDate } from '@/src/utilities/date'
import { IpArrowUp, IpExclamationTriangle } from '@/src/components/icons'
import { toSupportedLocale } from '../locale'
import type {
  TimeseriesChartGraphConfig,
  TimeseriesChartThresholdLevel,
} from '../types'
import {
  TIMESERIES_CHART_THRESHOLD_COLORS,
  TIMESERIES_CHART_THRESHOLD_LABELS,
} from '../thresholds'
import { hoverMetrics } from './hover'

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

const HOVER_PILL_CLASS =
  'ip:inline-flex ip:h-5 ip:items-center ip:gap-1 ip:rounded-full ip:px-2'

function hoverPillStyle(color: string): CSSProperties {
  return {
    color,
    backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
  }
}

function HoverPill({
  color,
  children,
}: {
  color?: string
  children: ReactNode
}) {
  return (
    <span
      className={
        color
          ? HOVER_PILL_CLASS
          : `${HOVER_PILL_CLASS} ip:bg-dark/10 ip:text-dark/80 ip:dark:bg-white/10 ip:dark:text-white/80`
      }
      style={color ? hoverPillStyle(color) : undefined}
    >
      {children}
    </span>
  )
}

function HoverMetric({ name, value }: { name: string; value: string }) {
  return (
    <span>
      <span className="ip:font-extralight">{name}: </span>
      <span className="ip:font-semibold">{value}</span>
    </span>
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

  const level =
    thresholdLevel && thresholdLevel !== 'none' ? thresholdLevel : null
  const levelColor = level ? TIMESERIES_CHART_THRESHOLD_COLORS[level] : undefined
  const metrics = hoverMetrics(config, timestamp)

  return (
    <div className="ip:flex ip:items-center ip:gap-1 ip:whitespace-nowrap ip:text-[11px] ip:leading-none ip:text-dark/80 ip:dark:text-white/80">
      <span className="ip:px-1 ip:text-dark ip:dark:text-white">
        <span className="ip:font-semibold">
          {formatChartTimestamp(timestamp, locale, timezone, 'EEEE d LLL')}
        </span>{' '}
        <span className="ip:font-light">
          {formatChartTimestamp(timestamp, locale, timezone, 'HH:mm')}
        </span>
      </span>
      {level ? (
        <HoverPill color={levelColor}>
          <IpExclamationTriangle className="ip:size-3" />
          <span className="ip:font-semibold">
            {TIMESERIES_CHART_THRESHOLD_LABELS[level]}
          </span>
        </HoverPill>
      ) : null}
      {metrics.map((metric) => {
        if (metric.kind === 'line') {
          return (
            <HoverPill key={metric.slug} color={metric.color}>
              <span
                className="ip:inline-block ip:h-2 ip:w-2 ip:shrink-0 ip:rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              <HoverMetric name={metric.title} value={metric.label} />
            </HoverPill>
          )
        }

        if (metric.kind === 'direction') {
          return (
            <HoverPill key={metric.slug}>
              {metric.direction != null ? (
                <IpArrowUp
                  className="ip:inline-block ip:size-3 ip:shrink-0 ip:origin-center"
                  style={{ transform: `rotate(${metric.direction - 180}deg)` }}
                  aria-hidden
                />
              ) : null}
              <HoverMetric name={metric.title} value={metric.label} />
            </HoverPill>
          )
        }

        if (metric.kind === 'value') {
          return (
            <HoverPill key={metric.slug}>
              <HoverMetric name={metric.title} value={metric.label} />
            </HoverPill>
          )
        }

        return (
          <HoverPill key={metric.slug} color={metric.color}>
            {metric.color ? (
              <span
                className="ip:inline-block ip:h-2 ip:w-2 ip:shrink-0 ip:rounded-full"
                style={{ backgroundColor: metric.color }}
              />
            ) : null}
            <HoverMetric name={metric.title} value={metric.label} />
          </HoverPill>
        )
      })}
    </div>
  )
}
