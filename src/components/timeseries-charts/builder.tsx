import { TIMESERIES_CHART_PLOT_CHROME_HEIGHT } from './defaults'
import type { TimeseriesChartsBuilderProps } from './types'
import { TimeseriesChartBlockProvider, useTimeseriesCharts } from './context'

export default function TimeseriesChartsBuilder({
  children,
}: TimeseriesChartsBuilderProps) {
  const { charts, loading, plotHeight } = useTimeseriesCharts()
  const skeletonHeight = plotHeight + TIMESERIES_CHART_PLOT_CHROME_HEIGHT

  if (loading) {
    return (
      <div className="ip:flex ip:flex-col ip:gap-4 ip:px-2">
        <div
          className="ip:w-full ip:animate-pulse ip:self-center ip:rounded-md ip:bg-gray-100 ip:dark:bg-white/10"
          style={{ height: skeletonHeight }}
        />
        <div
          className="ip:w-full ip:animate-pulse ip:self-center ip:rounded-md ip:bg-gray-100 ip:dark:bg-white/10"
          style={{ height: skeletonHeight }}
        />
      </div>
    )
  }

  return (
    <div className="ip:flex ip:flex-col ip:gap-4 ip:px-2 ip:py-2">
      {charts.map((block, index) => (
        <TimeseriesChartBlockProvider
          key={`${block.key}-${index}`}
          block={block}
        >
          {children}
        </TimeseriesChartBlockProvider>
      ))}
    </div>
  )
}
