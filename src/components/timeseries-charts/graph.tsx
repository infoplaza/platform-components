import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Customized,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DEFAULT_TIMESERIES_CHART_PLOT_HEIGHT,
  TIMESERIES_CHART_PLOT_CHROME_HEIGHT,
} from './defaults'
import type { TimeseriesGraphProps } from './types'
import ChartAxisStrip from './graph/axis-strip'
import ChartLegend from './graph/legend'
import ChartHoverHeader, { formatChartTimestamp } from './graph/tooltip'

function stripHeight(config: NonNullable<TimeseriesGraphProps['config']>) {
  const rows =
    (config.directions.length > 0 ? 1 : 0) +
    (config.values.length > 0 ? 1 : 0) +
    (config.precipitationTypes.length > 0 ? 1 : 0)
  if (rows === 0) {
    return 0
  }
  return rows * 18 + 8
}

export default function TimeseriesGraph({
  id = '',
  title = null,
  titleExtra = null,
  subtitle = null,
  config = null,
  locale = 'en',
  timezone = null,
  plotHeight = DEFAULT_TIMESERIES_CHART_PLOT_HEIGHT,
  fixedWidth = null,
  fixedHeight = null,
}: TimeseriesGraphProps) {
  const [hoverTs, setHoverTs] = useState<number | null>(null)

  const chartHeight = useMemo(() => {
    if (!config) return plotHeight
    return plotHeight + stripHeight(config)
  }, [config, plotHeight])

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

  const bottom = stripHeight(config) + 24
  const height = fixedHeight ?? chartHeight + TIMESERIES_CHART_PLOT_CHROME_HEIGHT

  const renderChart = (extraProps: Record<string, unknown>) => (
    <ComposedChart
      data={config.data}
      margin={{ top: 8, right: 12, left: 0, bottom }}
      onMouseMove={(state) => {
        const label = Number(state?.activeLabel)
        setHoverTs(Number.isFinite(label) ? label : null)
      }}
      onMouseLeave={() => setHoverTs(null)}
      {...extraProps}
    >
      <CartesianGrid stroke="#C5C5C5" vertical />
      {config.lines.map((line) => (
        <Line
          key={`line-${id}-${line.slug}`}
          dataKey={line.slug}
          name={line.title}
          type="linear"
          stroke={line.color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      ))}
      <XAxis
        dataKey="ts"
        type="number"
        domain={config.domain ?? ['dataMin', 'dataMax']}
        ticks={config.ticks}
        tickFormatter={(value: number) =>
          formatChartTimestamp(value, locale, timezone, 'EEEEEE d')
        }
        interval={0}
        tick={{ fontSize: 10, fill: '#6c757d' }}
      />
      <YAxis
        domain={[0, 'auto']}
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
          />
        )}
      />
    </ComposedChart>
  )

  return (
    <div className="ip:relative ip:pr-2">
      <div className="ip:flex ip:flex-wrap ip:items-start ip:justify-between ip:gap-2 ip:px-1">
        <div className="ip:flex ip:flex-col ip:items-start ip:text-xs ip:font-bold ip:uppercase ip:dark:text-white">
          <div className="ip:min-w-52 ip:overflow-hidden ip:truncate">
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
          {subtitle ? (
            <div className="ip:text-[10px] ip:font-normal ip:opacity-75">
              {subtitle}
            </div>
          ) : null}
        </div>
        <ChartHoverHeader
          config={config}
          timestamp={hoverTs}
          locale={locale}
          timezone={timezone}
        />
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
      {/* <div className="ip:pt-1">
        <ChartLegend config={config} />
      </div> */}
    </div>
  )
}
