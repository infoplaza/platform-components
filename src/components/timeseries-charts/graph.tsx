import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Customized,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DEFAULT_TIMESERIES_CHART_HOUR_INTERVAL,
  DEFAULT_TIMESERIES_CHART_LINE_STROKE_WIDTH,
  DEFAULT_TIMESERIES_CHART_PLOT_HEIGHT,
  TIMESERIES_CHART_DATE_AXIS_HEIGHT,
  TIMESERIES_CHART_PLOT_CHROME_HEIGHT,
  TIMESERIES_CHART_PLOT_TOP_MARGIN,
  TIMESERIES_CHART_Y_AXIS_WIDTH,
  timeseriesChartStripHeight,
} from './defaults'
import type { TimeseriesChartHourInterval, TimeseriesGraphProps } from './types'
import ChartAxisStrip from './graph/axis-strip'
import ChartDateTick from './graph/date-tick'
import ChartDayPager from './graph/day-pager'
import { useTimeseriesChartDayView } from './graph/day-view'
import ChartLegend from './graph/legend'
import ChartThresholdHues from './graph/threshold-hues'
import ChartHoverHeader from './graph/tooltip'
import { useTimeseriesChartBlockContext, useTimeseriesChartsContext } from './context'
import { hourTicks } from './series'
import {
  resolveTimeseriesChartYDomain,
  thresholdLevelAtTimestamp,
  thresholdStripSegments,
  thresholdYLines,
} from './thresholds'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

const DAY_VIEW_LABEL_INTERVAL: TimeseriesChartHourInterval = 6
const SWIPE_MIN_PX = 48

export default function TimeseriesGraph({
  id = '',
  title = null,
  titleExtra = null,
  subtitle = null,
  config = null,
  locale = 'en',
  timezone = null,
  plotHeight = DEFAULT_TIMESERIES_CHART_PLOT_HEIGHT,
  hourInterval = DEFAULT_TIMESERIES_CHART_HOUR_INTERVAL,
  thresholds = null,
  fixedWidth = null,
  fixedHeight = null,
}: TimeseriesGraphProps) {
  const [hoverTs, setHoverTs] = useState<number | null>(null)
  const [width, setWidth] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const swipeRef = useRef<{ x: number; y: number } | null>(null)

  const block = useTimeseriesChartBlockContext()
  const chartsCtx = useTimeseriesChartsContext()
  const {
    days,
    compact: ownCompact,
    selected,
    onDayStartChange,
  } = useTimeseriesChartDayView(config?.ticks, width, fixedWidth)
  const compact = block ? Boolean(chartsCtx?.dayViewCompact) : ownCompact

  useIsomorphicLayoutEffect(() => {
    if (fixedWidth != null) {
      return
    }
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
  }, [fixedWidth])

  useEffect(() => {
    setHoverTs(null)
  }, [selected?.startTs])

  const yLines = useMemo(
    () => (config ? thresholdYLines(config, thresholds) : []),
    [config, thresholds],
  )
  const thresholdSegments = useMemo(
    () =>
      config ? thresholdStripSegments(config, thresholds, timezone) : [],
    [config, thresholds, timezone],
  )
  const hasThresholdStrip = thresholdSegments.length > 0

  const chartHeight = useMemo(() => {
    if (!config) return plotHeight
    return (
      plotHeight +
      timeseriesChartStripHeight(config, { thresholdStrip: hasThresholdStrip })
    )
  }, [config, hasThresholdStrip, plotHeight])

  const viewDomain = useMemo<[number, number] | undefined>(() => {
    if (compact && selected) {
      return [selected.startTs, selected.endTs]
    }
    return config?.domain
  }, [compact, config?.domain, selected])

  const bandTicks = useMemo(() => {
    if (compact && selected) {
      return [selected.startTs, selected.endTs]
    }
    return config?.ticks ?? []
  }, [compact, config?.ticks, selected])

  const axisTicks = useMemo(() => {
    if (compact && selected) {
      return hourTicks(
        selected.startTs,
        selected.endTs,
        DAY_VIEW_LABEL_INTERVAL,
      )
    }
    return config?.ticks ?? []
  }, [compact, config?.ticks, selected])

  const hourLines = useMemo(() => {
    if (!viewDomain) return []
    const labeled = new Set(axisTicks)
    return hourTicks(viewDomain[0], viewDomain[1], hourInterval).filter(
      (ts) => !labeled.has(ts),
    )
  }, [axisTicks, hourInterval, viewDomain])

  const viewConfig = useMemo(() => {
    if (!config) {
      return null
    }
    if (!compact || !viewDomain) {
      return config
    }
    return {
      ...config,
      domain: viewDomain,
      ticks: bandTicks,
    }
  }, [bandTicks, compact, config, viewDomain])

  const hoverLevel = useMemo(
    () =>
      config
        ? thresholdLevelAtTimestamp(config, thresholds, hoverTs, timezone)
        : null,
    [config, hoverTs, thresholds, timezone],
  )

  if (config && config.data.length === 0 && config.lines.length === 0) {
    return (
      <div className="ip:flex ip:w-full ip:flex-col ip:gap-2">
        <div className="ip:flex ip:flex-col ip:items-start ip:p-1 ip:text-xs ip:font-bold ip:uppercase ip:dark:text-white">
          <div className="ip:min-w-52">
            {title ?? ''}
            {config.unit ? (
              <span className="ip:ml-2 ip:text-[10px] ip:font-light ip:normal-case">
                {config.unit}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <div className="ip:text-[10px] ip:font-normal ip:opacity-75">
              {subtitle}
            </div>
          ) : null}
        </div>
        <div className="ip:flex ip:grow ip:items-center ip:justify-center ip:rounded ip:bg-gray-600/5 ip:dark:bg-white/10 ip:py-5">
          <span className="ip:text-sm ip:text-dark/75 ip:dark:text-white/75">
            No data.
          </span>
        </div>
      </div>
    )
  }

  if (!config || !viewConfig) {
    return null
  }

  const strip = timeseriesChartStripHeight(config, {
    thresholdStrip: hasThresholdStrip,
  })
  const axisHeight = strip + TIMESERIES_CHART_DATE_AXIS_HEIGHT
  const height = fixedHeight ?? chartHeight + TIMESERIES_CHART_PLOT_CHROME_HEIGHT
  const yDomain = resolveTimeseriesChartYDomain(config, yLines)
  const bandIndex =
    compact && selected
      ? days.findIndex((day) => day.startTs === selected.startTs)
      : 0

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!compact) {
      return
    }
    swipeRef.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current
    swipeRef.current = null
    if (!start || !compact || !selected) {
      return
    }
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.25) {
      return
    }
    const index = days.findIndex((day) => day.startTs === selected.startTs)
    if (index < 0) {
      return
    }
    const next = dx < 0 ? days[index + 1] : days[index - 1]
    if (next) {
      onDayStartChange(next.startTs)
    }
  }

  const renderChart = (extraProps: Record<string, unknown>) => (
    <ComposedChart
      key={`day-${viewDomain?.[0] ?? 0}-${viewDomain?.[1] ?? 0}`}
      data={config.data}
      margin={{
        top: TIMESERIES_CHART_PLOT_TOP_MARGIN,
        right: 12,
        left: 0,
        bottom: 0,
      }}
      onMouseMove={(state) => {
        const label = Number(state?.activeLabel)
        setHoverTs(Number.isFinite(label) ? label : null)
      }}
      onMouseLeave={() => setHoverTs(null)}
      {...extraProps}
    >
      {bandTicks.length > 1
        ? bandTicks.slice(0, -1).map((entry, index) => (
            <ReferenceArea
              key={`bg-gray-interval-area-${id}-${index}-${entry}`}
              x1={entry}
              x2={bandTicks[index + 1]}
              fill={
                (compact ? bandIndex : index) % 2 === 0
                  ? '#787878'
                  : 'transparent'
              }
              fillOpacity={0.1}
            />
          ))
        : null}
      {hourLines.map((entry, index) => (
        <ReferenceLine
          key={`ref-x-hour-${id}-${index}-${entry}`}
          x={entry}
          stroke="#0000001a"
          strokeWidth={0.5}
        />
      ))}
      <CartesianGrid stroke="#C5C5C5" vertical />
      <Customized
        component={(props: Record<string, unknown>) => (
          <ChartThresholdHues
            id={id}
            yLines={yLines}
            yAxisMap={props.yAxisMap as never}
            offset={props.offset as never}
          />
        )}
      />
      {config.lines.map((line) => (
        <Line
          key={`line-${id}-${line.slug}`}
          dataKey={line.slug}
          name={line.title}
          type={line.type ?? 'linear'}
          stroke={line.color}
          strokeWidth={
            line.strokeWidth ?? DEFAULT_TIMESERIES_CHART_LINE_STROKE_WIDTH
          }
          strokeDasharray={line.strokeDasharray}
          strokeOpacity={line.opacity}
          connectNulls={line.connectNulls ?? false}
          dot={line.dot ?? false}
          isAnimationActive={false}
        />
      ))}
      {yLines.map((entry, index) => (
        <ReferenceLine
          key={`ref-y-threshold-${id}-${index}-${entry.level}-${entry.y}`}
          y={entry.y}
          stroke={entry.color}
          strokeDasharray="4 4"
          strokeWidth={1}
          ifOverflow="extendDomain"
        />
      ))}
      <XAxis
        dataKey="ts"
        type="number"
        domain={viewDomain ?? ['dataMin', 'dataMax']}
        ticks={axisTicks}
        interval={0}
        height={axisHeight}
        allowDataOverflow={compact}
        tick={
          <ChartDateTick
            locale={locale}
            timezone={timezone}
            domainEnd={viewDomain?.[1]}
            variant={compact ? 'hour' : 'day'}
          />
        }
        tickLine={strip > 0 ? false : undefined}
        tickSize={strip > 0 ? 0 : undefined}
        tickMargin={strip > 0 ? strip : undefined}
      />
      <YAxis
        domain={yDomain}
        width={TIMESERIES_CHART_Y_AXIS_WIDTH}
        tick={{ fontSize: 10, fill: '#6c757d' }}
        allowDecimals
      />
      <Tooltip cursor={{ stroke: '#2E2E2B' }} content={() => null} />
      <Customized
        component={(props: Record<string, unknown>) => (
          <ChartAxisStrip
            config={viewConfig}
            xAxisMap={props.xAxisMap as never}
            offset={props.offset as never}
            hoverTs={hoverTs}
            hourLines={hourLines}
            hourInterval={hourInterval}
            thresholdSegments={thresholdSegments}
          />
        )}
      />
    </ComposedChart>
  )

  const hoverHeader = (
    <ChartHoverHeader
      config={config}
      timestamp={hoverTs}
      locale={locale}
      timezone={timezone}
      thresholdLevel={hoverLevel}
      wrap={compact}
    />
  )

  return (
    <div ref={rootRef} className="ip:relative ip:pr-2">
      <div className="ip:px-4 ip:pb-2">
        {compact ? (
          <div className="ip:flex ip:flex-col ip:gap-1">
            <div className="ip:min-w-0 ip:truncate ip:text-xs ip:font-bold ip:uppercase ip:dark:text-white">
              {title ?? ''}
              {config.unit ? (
                <span className="ip:ml-2 ip:text-[10px] ip:font-light ip:normal-case ip:text-dark/60 ip:dark:text-white/60">
                  {config.unit}
                </span>
              ) : null}
              {titleExtra ? (
                <span className="ip:ml-2 ip:text-[10px] ip:font-light ip:truncate">
                  {titleExtra}
                </span>
              ) : null}
            </div>
            {hoverHeader}
          </div>
        ) : (
          <div className="ip:relative ip:flex ip:h-6 ip:items-center">
            <div className="ip:relative ip:z-10 ip:min-w-0 ip:shrink-0 ip:truncate ip:text-xs ip:font-bold ip:uppercase ip:dark:text-white">
              {title ?? ''}
              {config.unit ? (
                <span className="ip:ml-2 ip:text-[10px] ip:font-light ip:normal-case ip:text-dark/60 ip:dark:text-white/60">
                  {config.unit}
                </span>
              ) : null}
              {titleExtra ? (
                <span className="ip:ml-2 ip:text-[10px] ip:font-light ip:truncate">
                  {titleExtra}
                </span>
              ) : null}
            </div>
            <div className="ip:pointer-events-none ip:absolute ip:inset-0 ip:flex ip:items-center ip:justify-center ip:overflow-hidden">
              {hoverHeader}
            </div>
          </div>
        )}
        {subtitle ? (
          <div className="ip:text-[10px] ip:font-normal ip:uppercase ip:opacity-75 ip:dark:text-white">
            {subtitle}
          </div>
        ) : null}
        {compact && selected && !block ? (
          <ChartDayPager
            days={days}
            selectedStart={selected.startTs}
            onSelect={onDayStartChange}
            locale={locale}
            timezone={timezone}
          />
        ) : null}
      </div>
      {fixedWidth ? (
        renderChart({ width: fixedWidth, height })
      ) : (
        <div
          style={{ width: '100%', height, touchAction: compact ? 'pan-y' : undefined }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            swipeRef.current = null
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {renderChart({})}
          </ResponsiveContainer>
        </div>
      )}
      <div className="ip:pt-1">
        <ChartLegend config={config} thresholdYLines={yLines} />
      </div>
    </div>
  )
}
