import type { EnsembleRow } from '../../../types'

const ALLOWED = [
  'winter_precipitationtype',
  'winter_frost_probability_overview',
  'overview_precipitationprobability',
  'precipitation_precipitationprobability',
  'precipitation_precipitationtype',
  'overview_cloudcovertotal',
  'moisture_cloudcovershading',
  'moisture_cloudcovertotal',
  'overview_winddirectionchance',
  'wind_winddirectionchance_expert',
  'summer_cloudcovershading',
]

export function isAllowed(slug: string | undefined): boolean {
  return Boolean(slug && ALLOWED.includes(slug))
}

export function getBarWidth(slug: string | undefined) {
  if (!isAllowed(slug)) return undefined
  return (data: EnsembleRow) => {
    if (data.metadata?.sequence === 3) return 3.3
    if (data.metadata?.sequence === 6) return 6.6
    return undefined
  }
}

type BarShapeProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: EnsembleRow
  fill?: string
  fillOpacity?: number
}

export function getBarWidthShape(
  slug: string | undefined,
  widthFn?: (data: EnsembleRow) => number | undefined,
) {
  if (!isAllowed(slug)) return undefined

  return (props: BarShapeProps) => {
    const { x = 0, y = 0, width = 0, height = 0, payload, fill, fillOpacity } =
      props
    const widthPercentage = payload && widthFn ? widthFn(payload) : undefined
    if (widthPercentage != null) {
      const actualWidth = Math.abs(width * widthPercentage)
      const offset = width - actualWidth
      return (
        <rect
          x={x + offset}
          y={y}
          width={actualWidth}
          height={height}
          fill={fill}
          fillOpacity={fillOpacity}
        />
      )
    }
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={fillOpacity}
      />
    )
  }
}

export function getBarWidthOffset(slug: string | undefined) {
  return {
    shape: isAllowed(slug) ? getBarWidthShape(slug, getBarWidth(slug)) : undefined,
  }
}
