import { TIMESERIES_CHART_THRESHOLD_HUE_HEIGHT } from '../defaults'
import type { TimeseriesChartThresholdYLine } from '../thresholds'

type ScaleFn = (value: number) => number

type ThresholdHuesProps = {
  id?: string
  yLines: TimeseriesChartThresholdYLine[]
  yAxisMap?: Record<string, { scale?: ScaleFn }>
  offset?: { top?: number; height?: number; left?: number; width?: number }
}

export default function ChartThresholdHues({
  id = '',
  yLines,
  yAxisMap,
  offset,
}: ThresholdHuesProps) {
  const yScale =
    yAxisMap?.[0]?.scale ??
    (yAxisMap ? Object.values(yAxisMap)[0]?.scale : undefined)
  if (!yScale || yLines.length === 0) {
    return null
  }

  const plotLeft = offset?.left ?? 0
  const plotWidth = offset?.width ?? 0
  const plotTop = offset?.top ?? 0
  const plotHeight = offset?.height ?? 0
  const plotBottom = plotTop + plotHeight
  if (plotWidth <= 0 || plotHeight <= 0) {
    return null
  }

  const gradients = new Map<string, { color: string; direction: 'up' | 'down' }>()
  for (const line of yLines) {
    if (!line.direction) {
      continue
    }
    const gradientId = `ip-ts-th-hue-${id}-${line.level}-${line.direction}`
    if (!gradients.has(gradientId)) {
      gradients.set(gradientId, { color: line.color, direction: line.direction })
    }
  }

  return (
    <g pointerEvents="none">
      <defs>
        {[...gradients.entries()].map(([gradientId, { color, direction }]) => (
          <linearGradient
            key={gradientId}
            id={gradientId}
            x1="0"
            y1={direction === 'up' ? '1' : '0'}
            x2="0"
            y2={direction === 'up' ? '0' : '1'}
          >
            <stop offset="0%" stopColor={color} stopOpacity={0.1} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {yLines.map((line, index) => {
        if (!line.direction) {
          return null
        }
        const yPx = yScale(line.y)
        if (!Number.isFinite(yPx)) {
          return null
        }
        const band = TIMESERIES_CHART_THRESHOLD_HUE_HEIGHT
        const y =
          line.direction === 'up'
            ? Math.max(plotTop, yPx - band)
            : yPx
        const height =
          line.direction === 'up'
            ? yPx - y
            : Math.min(plotBottom, yPx + band) - yPx
        if (height <= 0) {
          return null
        }
        return (
          <rect
            key={`th-hue-${id}-${index}-${line.level}-${line.y}-${line.direction}`}
            x={plotLeft}
            y={y}
            width={plotWidth}
            height={height}
            fill={`url(#ip-ts-th-hue-${id}-${line.level}-${line.direction})`}
          />
        )
      })}
    </g>
  )
}
