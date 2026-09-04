const ALLOWED = [
  'overview_precipitationprobability',
  'precipitation_precipitationprobability',
  'summer_precipitationprobability',
]

type BarShapeProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  fillOpacity?: number
}

export function getPrecipitationBarWidthOffset(slug: string | undefined) {
  if (!slug || !ALLOWED.includes(slug)) {
    return {}
  }
  return {
    shape: (props: BarShapeProps) => {
      const { x = 0, y = 0, width = 0, height = 0, fill, fillOpacity } = props
      return (
        <rect
          x={x - 10}
          y={y}
          width={width}
          height={height}
          fill={fill}
          fillOpacity={fillOpacity}
        />
      )
    },
  }
}
