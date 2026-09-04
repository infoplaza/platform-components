type SequenceLabelProps = {
  label?: string
  offset?: number
  viewBox?: {
    x?: number
    y?: number
    height?: number
  }
}

export default function SequenceLabel({
  label,
  offset,
  viewBox,
}: SequenceLabelProps) {
  const { x = 0, y = 0, height = 0 } = viewBox ?? {}

  if (height < 10) {
    return null
  }

  return (
    <g>
      <rect
        x={x}
        y={y - 15}
        width={(label?.length ?? 0) * 6.8}
        height={15}
        fill="black"
        rx="0"
      />
      <text
        className="recharts-text recharts-label"
        offset={offset}
        x={x}
        y={y}
        textAnchor="middle"
        fill="#808080"
      >
        <tspan
          className="ip:fill-white ip:font-semibold"
          x={x + 37}
          y={y - 6}
          dy="0.355em"
        >
          {label}
        </tspan>
      </text>
    </g>
  )
}
