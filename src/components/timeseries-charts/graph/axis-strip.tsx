import { getPrecipitationType } from '../../timeseries/cells/precipitation-type'
import {
  TIMESERIES_CHART_STRIP_DATE_GAP,
  TIMESERIES_CHART_THRESHOLD_STRIP_HEIGHT,
  timeseriesChartStripHeight,
  timeseriesChartStripRowCenter,
} from '../defaults'
import type { TimeseriesChartThresholdSegment } from '../thresholds'
import type { TimeseriesChartGraphConfig } from '../types'

const ARROW_POINTS = '0,-6 -3,4 0,1 3,4'
const DIRECTION_SPACING = 12
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

export default function ChartAxisStrip({
  config,
  xAxisMap,
  offset,
  hoverTs = null,
  hourLines = [],
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
            const x1 = xScale(entry)
            const x2 = xScale(ticks[index + 1] as number)
            if (!Number.isFinite(x1) || !Number.isFinite(x2)) {
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
            if (!Number.isFinite(x)) {
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
            if (!Number.isFinite(x)) {
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
        spacedPoints(overlay.points, xScale, DIRECTION_SPACING).map((point) => {
          const x = xScale(point.ts)
          return (
            <g
              key={`${overlay.slug}-${point.ts}`}
              transform={`translate(${x},${arrowY}) rotate(${point.direction - 180})`}
            >
              <polygon points={ARROW_POINTS} fill="#6c757d" fillOpacity={0.85} />
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
            {spacedPoints(
              overlay.points.filter((point) => point.label),
              xScale,
              VALUE_SPACING,
            ).map((point) => (
              <text
                key={`${overlay.slug}-${point.ts}`}
                x={xScale(point.ts)}
                y={valueY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fill="#6c757d"
              >
                {point.label}
              </text>
            ))}
          </g>
        )
      })}
      {config.precipitationTypes.map((overlay) =>
        spacedPoints(overlay.points, xScale, PRECIP_ICON_SPACING).map((point) => {
          const typeInfo = getPrecipitationType(point.value)
          const Icon = typeInfo?.Icon
          if (!Icon) {
            return null
          }
          const x = xScale(point.ts)
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
                  color: '#6c757d',
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
            const x1 = xScale(segment.startTs)
            const x2 = xScale(segment.endTs)
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
      {Number.isFinite(hoverX) ? (
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
