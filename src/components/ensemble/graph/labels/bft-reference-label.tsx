type BftReferenceLabelProps = {
  label?: string
  offset?: number
  viewBox?: {
    x?: number
    y?: number
    width?: number
    height?: number
  }
}

export default function BftReferenceLabel({
  label,
  offset,
  viewBox,
}: BftReferenceLabelProps) {
  const { x = 0, y = 0, width = 0, height = 0 } = viewBox ?? {}

  if (label === '0 Bft') {
    return null
  }

  return (
    <text
      className="recharts-text recharts-label ip:text-white"
      offset={offset}
      x={x}
      y={y}
      textAnchor="middle"
      fill="#808080"
    >
      <tspan
        className="ip:fill-white"
        x={width + 20}
        y={y + height - 5}
        dy="0.355em"
      >
        {label}
      </tspan>
    </text>
  )
}
