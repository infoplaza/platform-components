type ActiveDotProps = {
  cx?: number
  cy?: number
  payload?: Record<string, unknown>
  value?: number
  dataKey?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export default function ActiveDot({
  cx,
  cy,
  payload,
  value,
  dataKey,
  fill,
  stroke,
  strokeWidth,
}: ActiveDotProps) {
  const valuesArray = Object.values({ ...(payload ?? {}), datetime: undefined }) as unknown[]
  const numericValuesArray = valuesArray.filter(
    (item): item is number => typeof item === 'number' && !Number.isNaN(item),
  )
  const maxPayload = Math.max(...numericValuesArray)
  const minPayload = Math.min(...numericValuesArray)

  if (
    value !== maxPayload &&
    value !== minPayload &&
    dataKey !== 'control' &&
    dataKey !== 'median'
  ) {
    return null
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r="4"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      className="recharts-dot"
    />
  )
}
