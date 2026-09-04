import { IpGraphBarIcon, IpGraphLineIcon } from '@/src/components/icons'

type LegendEntry = {
  type?: string
  color?: string
  opacity?: number
  value?: string
  translatable?: boolean
}

type CustomLegendProps = {
  payload?: LegendEntry[]
  onClick?: (entry: LegendEntry) => void
}

export default function CustomLegend({ payload = [], onClick }: CustomLegendProps) {
  return (
    <ul className="ip:flex ip:flex-wrap ip:justify-center ip:gap-1">
      {payload.map((entry, index) => (
        <li
          key={`item-${index}`}
          onClick={() => onClick?.(entry)}
          style={{ color: entry.color, opacity: (entry.opacity ?? 1) + 0.4 }}
          className="ip:flex ip:cursor-pointer ip:items-center ip:gap-1"
        >
          <span>
            {entry.type === 'line' ? (
              <IpGraphLineIcon color={entry.color} />
            ) : null}
            {entry.type === 'bar' ? (
              <IpGraphBarIcon color={entry.color} />
            ) : null}
          </span>
          <span className="ip:brightness-75">{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}
