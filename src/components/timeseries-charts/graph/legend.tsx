import {
  IpArrowUp,
  IpGraphLineIcon,
  IpPrecipitationTypeIcon,
} from '@/src/components/icons'
import type { TimeseriesChartGraphConfig } from '../types'
import {
  TIMESERIES_CHART_THRESHOLD_COLORS,
  thresholdLegendLevels,
  type TimeseriesChartThresholdYLine,
} from '../thresholds'

export default function ChartLegend({
  config,
  thresholdYLines = [],
}: {
  config: TimeseriesChartGraphConfig
  thresholdYLines?: TimeseriesChartThresholdYLine[]
}) {
  const thresholdLevels = thresholdLegendLevels(thresholdYLines)
  const hasItems =
    config.lines.length > 0 ||
    config.directions.length > 0 ||
    config.values.length > 0 ||
    config.precipitationTypes.length > 0 ||
    thresholdLevels.length > 0

  if (!hasItems) {
    return null
  }

  return (
    <ul className="ip:flex ip:flex-wrap ip:items-center ip:justify-center ip:gap-x-3 ip:gap-y-1 ip:text-[11px] ip:text-dark/70 ip:dark:text-white/70">
      {config.lines.map((line) => (
        <li key={line.slug} className="ip:flex ip:items-center ip:gap-1">
          {line.strokeDasharray ? (
            <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden>
              <line
                x1="0"
                y1="4"
                x2="12"
                y2="4"
                stroke={line.color}
                strokeWidth="2"
                strokeDasharray={line.strokeDasharray}
                strokeOpacity={line.opacity}
              />
            </svg>
          ) : (
            <IpGraphLineIcon color={line.color} />
          )}
          <span>
            {line.title}
            {line.unit ? ` (${line.unit})` : ''}
          </span>
        </li>
      ))}
      {config.directions.map((direction) => (
        <li key={direction.slug} className="ip:flex ip:items-center ip:gap-1">
          <IpArrowUp className="ip:size-3" aria-hidden />
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
      {thresholdLevels.length > 0 ? (
        <li className="ip:flex ip:items-center ip:gap-1">
          <span className="ip:flex ip:items-center">
            {thresholdLevels.map((level) => (
              <span
                key={level}
                className="ip:inline-block ip:h-2 ip:w-2 ip:rounded-full ip:ml-0.5 ip:first:ml-0"
                style={{ backgroundColor: TIMESERIES_CHART_THRESHOLD_COLORS[level] }}
              />
            ))}
          </span>
          <span>Thresholds</span>
        </li>
      ) : null}
    </ul>
  )
}
