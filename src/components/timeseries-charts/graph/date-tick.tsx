import { TIMESERIES_CHART_Y_AXIS_WIDTH } from '../defaults'
import { formatChartTimestamp } from './tooltip'

const DAY_LABEL_ROOM = 48
const HOUR_LABEL_ROOM = 32

type ChartDateTickProps = {
  x?: number
  y?: number
  width?: number
  payload?: { value?: unknown }
  locale: string
  timezone: string | null
  domainEnd?: number
  axisLeft?: number
  variant?: 'day' | 'hour'
}

export default function ChartDateTick({
  x = 0,
  y = 0,
  width,
  payload,
  locale,
  timezone,
  domainEnd,
  axisLeft = TIMESERIES_CHART_Y_AXIS_WIDTH,
  variant = 'day',
}: ChartDateTickProps) {
  const ts = Number(payload?.value)
  if (!Number.isFinite(ts) || (domainEnd != null && ts === domainEnd)) {
    return null
  }
  const labelRoom = variant === 'hour' ? HOUR_LABEL_ROOM : DAY_LABEL_ROOM
  if (typeof width === 'number' && x + labelRoom / 2 > axisLeft + width) {
    return null
  }

  if (variant === 'hour') {
    const hour = formatChartTimestamp(ts, locale, timezone, 'HH:mm')
    if (!hour) {
      return null
    }
    return (
      <text
        x={x}
        y={y}
        dy="0.71em"
        textAnchor="middle"
        className="ip:fill-dark ip:text-2xs ip:dark:fill-white"
      >
        {hour}
      </text>
    )
  }

  const weekday = formatChartTimestamp(ts, locale, timezone, 'EEE')
  const day = formatChartTimestamp(ts, locale, timezone, 'd')
  if (!weekday && !day) {
    return null
  }

  return (
    <text
      x={x}
      y={y}
      dy="0.71em"
      textAnchor="middle"
      className="ip:fill-dark ip:text-2xs ip:dark:fill-white"
    >
      <tspan fontWeight={400}>{weekday} </tspan>
      <tspan fontWeight={600}>{day}</tspan>
    </text>
  )
}
