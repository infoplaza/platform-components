import {
  useTimeseriesChartBlockContext,
  useTimeseriesChartsContext,
} from './context'
import TimeseriesGraph from './graph'
import type { TimeseriesChartsChartProps } from './types'

export default function TimeseriesChartsChart({
  id,
  title: titleProp,
  titleExtra: titleExtraProp,
  subtitle: subtitleProp,
  config: configProp,
  locale: localeProp,
  timezone: timezoneProp,
  plotHeight: plotHeightProp,
  hourInterval: hourIntervalProp,
  thresholds: thresholdsProp,
  fixedWidth,
  fixedHeight,
}: TimeseriesChartsChartProps) {
  const block = useTimeseriesChartBlockContext()
  const ctx = useTimeseriesChartsContext()

  const config = configProp ?? block?.config
  if (!config) {
    return null
  }

  return (
    <TimeseriesGraph
      id={id ?? block?.key ?? ctx?.model ?? ''}
      title={titleProp ?? block?.title}
      titleExtra={titleExtraProp ?? block?.titleExtra}
      subtitle={subtitleProp ?? block?.subtitle}
      config={config}
      locale={localeProp ?? ctx?.locale}
      timezone={timezoneProp ?? ctx?.timezone}
      plotHeight={plotHeightProp ?? ctx?.plotHeight}
      hourInterval={hourIntervalProp ?? ctx?.hourInterval}
      thresholds={thresholdsProp ?? ctx?.thresholds}
      fixedWidth={fixedWidth}
      fixedHeight={fixedHeight}
    />
  )
}
