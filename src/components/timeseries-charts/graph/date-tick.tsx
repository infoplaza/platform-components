import { formatChartTimestamp } from './tooltip'

const LABEL_ROOM = 48
const Y_AXIS_WIDTH = 36

type ChartDateTickProps = {
  x?: number
  y?: number
  width?: number
  payload?: { value?: unknown }
  locale: string
  timezone: string | null
  domainEnd?: number
  axisLeft?: number
}

export default function ChartDateTick({
  x = 0,
  y = 0,
  width,
  payload,
  locale,
  timezone,
  domainEnd,
  axisLeft = Y_AXIS_WIDTH,
}: ChartDateTickProps) {
  const ts = Number(payload?.value)
  if (!Number.isFinite(ts) || (domainEnd != null && ts === domainEnd)) {
    return null
  }
  if (typeof width === 'number' && x + LABEL_ROOM / 2 > axisLeft + width) {
    return null
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
