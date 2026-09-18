import { IpArrowUp } from '@/src/components/icons'
import { getPrecipitationType } from '../../timeseries/cells/precipitation-type'
import {
  DEFAULT_TIMESERIES_CHART_HOUR_INTERVAL,
  TIMESERIES_CHART_STRIP_DATE_GAP,
  TIMESERIES_CHART_THRESHOLD_STRIP_HEIGHT,
  timeseriesChartStripHeight,
  timeseriesChartStripRowCenter,
} from '../defaults'
import { summarizeStripPoints } from '../series'
import type { TimeseriesChartThresholdSegment } from '../thresholds'
import type {
  TimeseriesChartGraphConfig,
  TimeseriesChartHourInterval,
} from '../types'

const DIRECTION_SPACING = 14
const ARROW_ICON_SIZE = 12
const VALUE_SPACING = 20
const PRECIP_ICON_SPACING = 14
const PRECIP_ICON_SIZE = 12
const DAY_BAND_FILL = '#787878'
const GRID_STROKE = '#C5C5C5'
const HOUR_LINE_STROKE = '#0000001a'
const CURSOR_STROKE = '#2E2E2B'

type ScaleFn = (value: number) => number

type AxisStripProps = {
  xAxisMap?: Record<string, { scale?: ScaleFn }>
  offset?: { top?: number; height?: number; left?: number; width?: number }
  hoverTs?: number | null
  hourLines?: number[]
  hourInterval?: TimeseriesChartHourInterval
  thresholdSegments?: TimeseriesChartThresholdSegment[]
}

function spacedPoints<T extends { ts: number }>(
  points: T[],
  xScale: ScaleFn,
  minSpacing: number,
): T[] {
  const visible: T[] = []
  let lastX = Number.NEGATIVE_INFINITY
  for (const point of points) {
    const x = xScale(point.ts)
    if (!Number.isFinite(x)) {
      continue
    }
    if (x - lastX < minSpacing) {
      continue
    }
    visible.push(point)
    lastX = x
  }
  return visible
}

function overlayPoints<T extends { ts: number }>(
  points: T[],
  xScale: ScaleFn,
  minSpacing: number,
  hourInterval: TimeseriesChartHourInterval,
  domain: [number, number] | undefined,
): T[] {
  const summarized = summarizeStripPoints(points, domain, hourInterval)
  if (hourInterval !== 1) {
    return summarized
  }
  return spacedPoints(summarized, xScale, minSpacing)
}

export default function ChartAxisStrip({
  config,
  xAxisMap,
  offset,
  hoverTs = null,
  hourLines = [],
  hourInterval = DEFAULT_TIMESERIES_CHART_HOUR_INTERVAL,
  thresholdSegments = [],
}: AxisStripProps & { config: TimeseriesChartGraphConfig }) {
  const xScale =
    xAxisMap?.[0]?.scale ??
    (xAxisMap ? Object.values(xAxisMap)[0]?.scale : undefined)
  if (!xScale) {
    return null
  }

  const plotLeft = offset?.left ?? 0
  const plotWidth = offset?.width ?? 0
  const plotBottom = (offset?.top ?? 0) + (offset?.height ?? 0)
  const hasDirection = config.directions.length > 0
  const hasValue = config.values.length > 0
  const hasPrecipitationType = config.precipitationTypes.length > 0
  const hasOverlays = hasDirection || hasValue || hasPrecipitationType
  const hasThresholds = thresholdSegments.length > 0
  if (!hasOverlays && !hasThresholds) {
    return null
  }

  const stripHeight = timeseriesChartStripHeight(config, {
    thresholdStrip: hasThresholds,
  })
  const overlayHeight = hasOverlays
    ? stripHeight -
      TIMESERIES_CHART_STRIP_DATE_GAP -
      (hasThresholds ? TIMESERIES_CHART_THRESHOLD_STRIP_HEIGHT : 0)
    : 0
  const bandBottom = plotBottom + overlayHeight
  const thresholdY = plotBottom + overlayHeight
  const cursorBottom = hasThresholds
    ? thresholdY + TIMESERIES_CHART_THRESHOLD_STRIP_HEIGHT
    : bandBottom
  const ticks = config.ticks ?? []

  let rowIndex = 0
  const arrowY = hasDirection
    ? timeseriesChartStripRowCenter(plotBottom, rowIndex)
    : 0
  if (hasDirection) {
    rowIndex += 1
  }
  const valueY = hasValue
    ? timeseriesChartStripRowCenter(plotBottom, rowIndex)
    : 0
  if (hasValue) {
    rowIndex += 1
  }
  const precipY = hasPrecipitationType
    ? timeseriesChartStripRowCenter(plotBottom, rowIndex)
    : 0

  const hoverX = hoverTs != null ? xScale(hoverTs) : Number.NaN
  const plotRight = plotLeft + plotWidth

  const inPlot = (x: number) =>
    Number.isFinite(x) && x >= plotLeft && x <= plotRight

  return (
    <g>
      {overlayHeight > 0 ? (
        <rect
          x={plotLeft}
          y={plotBottom}
          width={plotWidth}
          height={overlayHeight}
          fill="transparent"
        />
      ) : null}
      {overlayHeight > 0
        ? ticks.map((entry, index) => {
            if (index === ticks.length - 1) {
              return null
            }
            const x1 = Math.max(plotLeft, xScale(entry))
            const x2 = Math.min(plotRight, xScale(ticks[index + 1] as number))
            if (!Number.isFinite(x1) || !Number.isFinite(x2) || x2 <= x1) {
              return null
            }
            return (
              <rect
                key={`strip-day-${entry}`}
                x={x1}
                y={plotBottom}
                width={x2 - x1}
                height={overlayHeight}
                fill={index % 2 === 0 ? DAY_BAND_FILL : 'transparent'}
                fillOpacity={0.1}
              />
            )
          })
        : null}
      {overlayHeight > 0
        ? hourLines.map((entry) => {
            const x = xScale(entry)
            if (!inPlot(x)) {
              return null
            }
            return (
              <line
                key={`strip-hour-${entry}`}
                x1={x}
                y1={plotBottom}
                x2={x}
                y2={bandBottom}
                stroke={HOUR_LINE_STROKE}
                strokeWidth={0.5}
              />
            )
          })
        : null}
      {overlayHeight > 0
        ? ticks.map((entry) => {
            const x = xScale(entry)
            if (!inPlot(x)) {
              return null
            }
            return (
              <line
                key={`strip-tick-${entry}`}
                x1={x}
                y1={plotBottom}
                x2={x}
                y2={bandBottom}
                stroke={GRID_STROKE}
              />
            )
          })
        : null}
      {overlayHeight > 0 ? (
        <line
          x1={plotLeft}
          y1={plotBottom}
          x2={plotLeft + plotWidth}
          y2={plotBottom}
          stroke={GRID_STROKE}
          strokeWidth={1}
        />
      ) : null}
      {config.directions.map((overlay) =>
        overlayPoints(
          overlay.points,
          xScale,
          DIRECTION_SPACING,
          hourInterval,
          config.domain,
        ).map((point) => {
          const x = xScale(point.ts)
          if (!inPlot(x)) {
            return null
          }
          const half = ARROW_ICON_SIZE / 2
          return (
            <g
              key={`${overlay.slug}-${point.ts}`}
              transform={`translate(${x},${arrowY}) rotate(${point.direction - 180})`}
            >
              <IpArrowUp
                x={-half}
                y={-half}
                width={ARROW_ICON_SIZE}
                height={ARROW_ICON_SIZE}
                color="#6c757d"
                opacity={0.85}
                aria-hidden
              />
            </g>
          )
        }),
      )}
      {config.values.map((overlay) => {
        const labelX = xScale(config.domain?.[0] ?? overlay.points[0]?.ts ?? 0)
        return (
          <g key={overlay.slug}>
            {overlay.stripLabel ? (
              <text
                x={Math.max(0, labelX - 18)}
                y={valueY}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={9}
                fill="#6c757d"
              >
                {overlay.stripLabel}
              </text>
            ) : null}
            {overlayPoints(
              overlay.points.filter((point) => point.label),
              xScale,
              VALUE_SPACING,
              hourInterval,
              config.domain,
            ).map((point) => {
              const x = xScale(point.ts)
              if (!inPlot(x)) {
                return null
              }
              return (
                <text
                  key={`${overlay.slug}-${point.ts}`}
                  x={x}
                  y={valueY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fill="#6c757d"
                >
                  {point.label}
                </text>
              )
            })}
          </g>
        )
      })}
      {config.precipitationTypes.map((overlay) =>
        overlayPoints(
          overlay.points,
          xScale,
          PRECIP_ICON_SPACING,
          hourInterval,
          config.domain,
        ).map((point) => {
          const typeInfo = getPrecipitationType(point.value)
          const Icon = typeInfo?.Icon
          if (!Icon) {
            return null
          }
          const x = xScale(point.ts)
          if (!inPlot(x)) {
            return null
          }
          const half = PRECIP_ICON_SIZE / 2
          return (
            <foreignObject
              key={`${overlay.slug}-${point.ts}`}
              x={x - half}
              y={precipY - half}
              width={PRECIP_ICON_SIZE}
              height={PRECIP_ICON_SIZE}
            >
              <div
                title={point.title}
                style={{
                  width: PRECIP_ICON_SIZE,
                  height: PRECIP_ICON_SIZE,
                  color: point.color,
                }}
              >
                <Icon className="ip:size-3" />
              </div>
            </foreignObject>
          )
        }),
      )}
      {hasThresholds
        ? thresholdSegments.map((segment) => {
            const x1 = Math.max(plotLeft, xScale(segment.startTs))
            const x2 = Math.min(plotRight, xScale(segment.endTs))
            if (!Number.isFinite(x1) || !Number.isFinite(x2) || x2 <= x1) {
              return null
            }
            return (
              <rect
                key={`threshold-${segment.level}-${segment.startTs}`}
                x={x1}
                y={thresholdY}
                width={x2 - x1}
                height={TIMESERIES_CHART_THRESHOLD_STRIP_HEIGHT}
                fill={segment.color}
              />
            )
          })
        : null}
      {inPlot(hoverX) ? (
        <line
          x1={hoverX}
          y1={plotBottom}
          x2={hoverX}
          y2={cursorBottom}
          stroke={CURSOR_STROKE}
        />
      ) : null}
    </g>
  )
}
