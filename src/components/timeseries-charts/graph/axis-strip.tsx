import { getPrecipitationType } from '../../timeseries/cells/precipitation-type'
import type { TimeseriesChartGraphConfig } from '../types'

const ARROW_POINTS = '0,-6 -3,4 0,1 3,4'
const MIN_SPACING = 10
const PRECIP_ICON_SPACING = 14
const PRECIP_ICON_SIZE = 12
const STRIP_ROW = 16

type ScaleFn = (value: number) => number

type AxisStripProps = {
  xAxisMap?: Record<string, { scale?: ScaleFn }>
  offset?: { top?: number; height?: number }
}

function spacedPoints<T extends { ts: number }>(
  points: T[],
  xScale: ScaleFn,
  minSpacing = MIN_SPACING,
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
}: AxisStripProps & { config: TimeseriesChartGraphConfig }) {
  const xScale =
    xAxisMap?.[0]?.scale ??
    (xAxisMap ? Object.values(xAxisMap)[0]?.scale : undefined)
  if (!xScale) {
    return null
  }

  const plotBottom = (offset?.top ?? 0) + (offset?.height ?? 0)
  const hasDirection = config.directions.length > 0
  const hasValue = config.values.length > 0
  const hasPrecipitationType = config.precipitationTypes.length > 0
  if (!hasDirection && !hasValue && !hasPrecipitationType) {
    return null
  }

  let rowY = plotBottom + 12
  const arrowY = hasDirection ? rowY : 0
  if (hasDirection) {
    rowY += STRIP_ROW
  }
  const valueY = hasValue ? rowY : 0
  if (hasValue) {
    rowY += STRIP_ROW
  }
  const precipY = hasPrecipitationType ? rowY : 0

  return (
    <g>
      {config.directions.map((overlay) =>
        spacedPoints(overlay.points, xScale).map((point) => {
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
    </g>
  )
}
