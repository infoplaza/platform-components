import { useMemo, useState } from 'react'
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
  timeseriesChartStripHeight,
} from './defaults'
import type { TimeseriesGraphProps } from './types'
import ChartAxisStrip from './graph/axis-strip'
import ChartDateTick from './graph/date-tick'
import ChartLegend from './graph/legend'
import ChartThresholdHues from './graph/threshold-hues'
import ChartHoverHeader from './graph/tooltip'
import { hourTicks } from './series'
import {
  resolveTimeseriesChartYDomain,
  thresholdLevelAtTimestamp,
  thresholdStripSegments,
  thresholdYLines,
} from './thresholds'

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

  const hourLines = useMemo(() => {
    if (!config?.domain) return []
    const days = new Set(config.ticks ?? [])
    return hourTicks(config.domain[0], config.domain[1], hourInterval).filter(
      (ts) => !days.has(ts),
    )
  }, [config, hourInterval])

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
        <div
          className="ip:flex ip:grow ip:items-center ip:justify-center ip:rounded ip:bg-gray-600/5 ip:dark:bg-white/10 ip:py-5"
          // style={{ minHeight: plotHeight }}
        >
          <span className="ip:text-sm ip:text-dark/75 ip:dark:text-white/75">
            No data.
          </span>
        </div>
      </div>
    )
  }

  if (!config) {
    return null
  }

  const strip = timeseriesChartStripHeight(config, {
    thresholdStrip: hasThresholdStrip,
  })
  const axisHeight = strip + TIMESERIES_CHART_DATE_AXIS_HEIGHT
  const height = fixedHeight ?? chartHeight + TIMESERIES_CHART_PLOT_CHROME_HEIGHT
  const ticks = config.ticks ?? []
  const yDomain = resolveTimeseriesChartYDomain(config, yLines)

  const renderChart = (extraProps: Record<string, unknown>) => (
    <ComposedChart
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
      {ticks.length > 0
        ? ticks.map((entry, index) => {
            if (index === ticks.length - 1) return null
            return (
              <ReferenceArea
                key={`bg-gray-interval-area-${id}-${index}-${entry}`}
                x1={entry}
                x2={ticks[index + 1]}
                fill={index % 2 === 0 ? '#787878' : 'transparent'}
                fillOpacity={0.1}
              />
            )
          })
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
        domain={config.domain ?? ['dataMin', 'dataMax']}
        ticks={config.ticks}
        interval={0}
        height={axisHeight}
        tick={
          <ChartDateTick
            locale={locale}
            timezone={timezone}
            domainEnd={config.domain?.[1]}
          />
        }
        tickLine={strip > 0 ? false : undefined}
        tickSize={strip > 0 ? 0 : undefined}
        tickMargin={strip > 0 ? strip : undefined}
      />
      <YAxis
        domain={yDomain}
        width={36}
        tick={{ fontSize: 10, fill: '#6c757d' }}
        allowDecimals
      />
      <Tooltip cursor={{ stroke: '#2E2E2B' }} content={() => null} />
      <Customized
        component={(props: Record<string, unknown>) => (
          <ChartAxisStrip
            config={config}
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

  return (
    <div className="ip:relative ip:pr-2">
      <div className="ip:px-4 ip:pb-2">
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
            <ChartHoverHeader
              config={config}
              timestamp={hoverTs}
              locale={locale}
              timezone={timezone}
              thresholdLevel={hoverLevel}
            />
          </div>
        </div>
        {subtitle ? (
          <div className="ip:text-[10px] ip:font-normal ip:uppercase ip:opacity-75 ip:dark:text-white">
            {subtitle}
          </div>
        ) : null}
      </div>
      {fixedWidth ? (
        renderChart({ width: fixedWidth, height })
      ) : (
        <div style={{ width: '100%', height }}>
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
