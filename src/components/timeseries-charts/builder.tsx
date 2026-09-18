import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { TIMESERIES_CHART_PLOT_CHROME_HEIGHT } from './defaults'
import type { TimeseriesChartsBuilderProps } from './types'
import { TimeseriesChartBlockProvider, useTimeseriesCharts } from './context'
import ChartDayPager from './graph/day-pager'
import { useTimeseriesChartDayView } from './graph/day-view'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function TimeseriesChartsBuilder({
  children,
}: TimeseriesChartsBuilderProps) {
  const {
    charts,
    loading,
    plotHeight,
    locale,
    timezone,
    onDayViewCompactChange,
  } = useTimeseriesCharts()
  const rootRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const { days, compact, selected, onDayStartChange } = useTimeseriesChartDayView(
    charts[0]?.config.ticks,
    width,
    null,
  )
  const skeletonHeight = plotHeight + TIMESERIES_CHART_PLOT_CHROME_HEIGHT

  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current
    if (!el) {
      return
    }
    if (typeof ResizeObserver === 'undefined') {
      setWidth(el.clientWidth)
      return
    }
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? el.clientWidth)
    })
    observer.observe(el)
    setWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [loading])

  useEffect(() => {
    onDayViewCompactChange(compact)
    return () => onDayViewCompactChange(false)
  }, [compact, onDayViewCompactChange])

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
    <div
      ref={rootRef}
      className="ip:flex ip:flex-col ip:gap-4 ip:px-2 ip:py-2"
    >
      {compact && selected ? (
        <div className="ip:sticky ip:top-0 ip:z-10 ip:-mx-2 ip:bg-white ip:px-4 ip:py-1 ip:dark:bg-dark/90">
          <ChartDayPager
            days={days}
            selectedStart={selected.startTs}
            onSelect={onDayStartChange}
            locale={locale}
            timezone={timezone}
          />
        </div>
      ) : null}
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
