import { IpGraphLineIcon, IpPrecipitationTypeIcon } from '@/src/components/icons'
import type { TimeseriesChartGraphConfig } from '../types'

const ARROW_POINTS = '0,-5 -2.5,3.5 0,1 2.5,3.5'

export default function ChartLegend({
  config,
}: {
  config: TimeseriesChartGraphConfig
}) {
  const hasItems =
    config.lines.length > 0 ||
    config.directions.length > 0 ||
    config.values.length > 0 ||
    config.precipitationTypes.length > 0

  if (!hasItems) {
    return null
  }

  return (
    <ul className="ip:flex ip:flex-wrap ip:items-center ip:justify-center ip:gap-x-3 ip:gap-y-1 ip:text-[11px] ip:text-dark/70 ip:dark:text-white/70">
      {config.lines.map((line) => (
        <li key={line.slug} className="ip:flex ip:items-center ip:gap-1">
          <IpGraphLineIcon color={line.color} />
          <span>
            {line.title}
            {line.unit ? ` (${line.unit})` : ''}
          </span>
        </li>
      ))}
      {config.directions.map((direction) => (
        <li key={direction.slug} className="ip:flex ip:items-center ip:gap-1">
          <svg width="12" height="12" viewBox="-6 -8 12 14" aria-hidden>
            <polygon points={ARROW_POINTS} fill="currentColor" />
          </svg>
          <span>{direction.title}</span>
        </li>
      ))}
      {config.values.map((value) => (
        <li key={value.slug} className="ip:flex ip:items-center ip:gap-1">
          <span className="ip:font-semibold">
            {value.stripLabel ?? value.title}
          </span>
          <span>
            {value.title}
            {value.unit ? ` (${value.unit})` : ''}
          </span>
        </li>
      ))}
      {config.precipitationTypes.map((overlay) => (
        <li key={overlay.slug} className="ip:flex ip:items-center ip:gap-1">
          <IpPrecipitationTypeIcon className="ip:size-3" />
          <span>{overlay.title}</span>
        </li>
      ))}
    </ul>
  )
}
