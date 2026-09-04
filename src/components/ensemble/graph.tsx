import { useMemo, useRef, useState, type ReactElement } from 'react'
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Customized,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import TimeseriesPills from '../timeseries/pills'
import { BeaufortScaleOverrides } from './grades'
import BftReferenceLabel from './graph/labels/bft-reference-label'
import type { EnsembleGraphConfig, EnsembleGraphProps } from './types'
import { isEmpty } from './utils/is-empty'

const WIND_DIRECTION_ARROW_POINTS = '0,-6 -3,4 0,1 3,4'

type OpacityMap = Record<string, number>

function payloadHasData(
  entry: { id: string },
  data: Array<Record<string, unknown>>,
  yConfig: EnsembleGraphConfig['y'],
) {
  if (isEmpty(data)) return false
  const matchedKeys = (yConfig ?? [])
    .filter((y) => y.legend === entry.id || y.dataKey === entry.id)
    .map((y) => y.dataKey)
  const keys = matchedKeys.length ? matchedKeys : [entry.id]
  return data.some((row) =>
    keys.some((key) => {
      const value = row[key]
      if (Array.isArray(value)) {
        return value.some((v) => v !== null && v !== undefined)
      }
      return value !== null && value !== undefined
    }),
  )
}

function getLegendHeight(rowRef: unknown[] | undefined) {
  if (!rowRef || rowRef.length === 0) return 0
  return Math.ceil(rowRef.length / 14) * 16 + 8
}

export default function EnsembleGraph({
  id = '',
  title = null,
  titleExtra = null,
  subtitle = null,
  config = null,
  fixedWidth = null,
  fixedHeight = null,
}: EnsembleGraphProps) {
  const [enabledBFT, setEnabledBFT] = useState(true)
  const chartRef = useRef<HTMLDivElement>(null)
  const [opacity, setOpacity] = useState<OpacityMap>(() =>
    (config?.legend?.payload ?? []).reduce<OpacityMap>((acc, item) => {
      acc[item.id] = 1
      return acc
    }, {}),
  )

  const ticks = config?.x?.[0]?.ticks ?? []

  const bftOptions = useMemo(
    () => [
      { title: 'Bft', value: 'bft', active: enabledBFT },
      { title: 'Unit', value: 'unit', active: !enabledBFT },
    ],
    [enabledBFT],
  )

  const legendPayload = useMemo(() => {
    if (!config || isEmpty(config.legend?.payload)) return null
    return config.legend.payload
      ?.filter((entry) =>
        payloadHasData(entry, config.data, config.y),
      )
      .map((entry) => ({
        ...entry,
        opacity: opacity[entry.id] ?? 1,
      }))
  }, [config, opacity])

  const chartBlockHeight =
    fixedHeight ?? (getLegendHeight(config?.y) + (config?.height ?? 256))

  if (config && config.data.length === 0) {
    return (
      <div className="ip:flex ip:w-full ip:flex-col ip:gap-2">
        <div className="ip:flex ip:flex-col ip:items-start ip:p-1 ip:text-xs ip:font-bold ip:uppercase">
          <div className="ip:min-w-52">{title ?? ''}</div>
          {subtitle ? (
            <div className="ip:text-[10px] ip:font-normal ip:opacity-75">
              {subtitle}
            </div>
          ) : null}
        </div>
        <div className="ip:flex ip:min-h-56 ip:grow ip:items-center ip:justify-center ip:rounded ip:bg-gray-600/5 ip:dark:bg-white/10">
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

  const handleOnClick = (event: { id?: string }) => {
    const seriesId = event.id
    if (!seriesId) return
    setOpacity((op) => ({
      ...op,
      [seriesId]: op[seriesId] === 1 ? 0.1 : 1,
    }))
  }

  const renderComposedChart = (extraProps: Record<string, unknown>) => (
    <ComposedChart
      data={config.data}
      barCategoryGap={0}
      margin={{ top: 12, right: config.yAxis2 ? 20 : 0, left: 0, bottom: 0 }}
      {...extraProps}
    >
      {config.reference?.enableBFTLines && enabledBFT
        ? config.reference.enableBFTLines.map((entry, index) => (
            <ReferenceArea
              key={`bg-bft-area-${title}-${index}-${entry.name}`}
              y1={Number(entry.min)}
              y2={Number(entry.max)}
              fill={entry.color}
              fillOpacity={1}
            />
          ))
        : null}

      {config.reference?.alternateArea && ticks.length > 0
        ? ticks.map((entry, index) => {
            if (index === ticks.length - 1) return null
            return (
              <ReferenceArea
                key={`bg-gray-interval-area-${title}-${index}-${entry}`}
                x1={entry}
                x2={ticks[index + 1]}
                fill={index % 2 === 0 ? '#787878' : 'transparent'}
                fillOpacity={0.1}
              />
            )
          })
        : null}

      {!isEmpty(config.reference?.xLines)
        ? config.reference.xLines?.map((entry, index) => (
            <ReferenceLine
              key={`ref-x-baseline-${id}-${index}-${entry}`}
              x={entry}
              stroke="#0000001a"
              strokeWidth={0.5}
            />
          ))
        : null}

      {config.legend?.active ? (
        <Legend
          height={getLegendHeight(config.legend?.payload ?? config.y)}
          content={(config.legend?.content as never) ?? undefined}
          payload={(legendPayload ?? undefined) as never}
          onClick={config.legend?.enableOnClick ? handleOnClick : undefined}
          verticalAlign={config.legend?.verticalAlign}
          align={config.legend?.align}
        />
      ) : null}

      <CartesianGrid
        stroke="#C5C5C5"
        vertical={config.reference?.cartesianGrid?.vertical ?? true}
      />

      {config.y.map((y, i) => {
        if (y.display === 'area') {
          const bftOverride =
            config.reference?.enableBFTLines && enabledBFT
              ? BeaufortScaleOverrides.basic.graph.y[y.dataKey]
              : undefined
          return (
            <Area
              key={`chart_y_area_${id}_${i}_${y.dataKey}`}
              dataKey={y.dataKey}
              name={y.name}
              type="monotone"
              fill={y.fill}
              stroke={y.stroke}
              strokeWidth={y.strokeWidth}
              dot={false}
              opacity={opacity[y.dataKey] ?? y.opacity}
              {...bftOverride}
            />
          )
        }

        if (y.display === 'line') {
          const bftOverride =
            config.reference?.enableBFTLines && enabledBFT
              ? BeaufortScaleOverrides.basic.graph.y[y.dataKey]
              : undefined
          return (
            <Line
              key={`chart_y_line_${id}_${i}_${y.dataKey}`}
              dataKey={y.dataKey}
              name={y.name}
              type="linear"
              stroke={y.stroke}
              strokeWidth={y.strokeWidth}
              dot={false}
              activeDot={y.activeDot as never}
              strokeDasharray={y.strokeDasharray}
              strokeOpacity={opacity[y.legend ?? y.dataKey] ?? 1}
              {...bftOverride}
            />
          )
        }

        if (y.display === 'bar') {
          return (
            <Bar
              key={`chart_y_bar_${id}_${i}_${y.dataKey}`}
              dataKey={y.dataKey}
              name={y.name}
              stackId={y.stackId}
              fill={y.fill}
              activeBar={y.activeBar as never}
              shape={y.shape as never}
            >
              {config.data.map((d, ii) => (
                <Cell
                  key={`cell_${id}_${ii}`}
                  fill={y.fill ?? (d[y.colorKey ?? ''] as string | undefined)}
                  {...(ii === 0 ? { width: 0 } : {})}
                  fillOpacity={opacity[y.legend ?? y.dataKey] ?? 1}
                />
              ))}
            </Bar>
          )
        }

        return null
      })}

      {config.x.map((x, i) => (
        <XAxis
          dataKey={x.key}
          xAxisId={i}
          hide={x.hide}
          key={`chart_x_${id}_${i}_${x.key}`}
          domain={x.domain}
          type={x.type ?? 'number'}
          width={10}
          ticks={x.ticks}
          tickFormatter={(value: number) => x.formatter?.(value) ?? String(value)}
          label={
            x.label && i === 0
              ? {
                  value: x.label,
                  position: 'insideBottomRight',
                  offset: 0,
                  style: { fontSize: 10, fill: '#999' },
                }
              : undefined
          }
        />
      ))}

      <YAxis
        allowDecimals={false}
        interval={config.yAxis?.interval as never}
        domain={(config.yAxis?.domain as never) ?? [0, 'auto']}
        ticks={config.yAxis?.ticks ?? undefined}
        allowDataOverflow
        label={
          config.yAxis?.label
            ? {
                value: config.yAxis.label,
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 10, fill: '#999' },
              }
            : undefined
        }
      />
      {config.yAxis2 ? (
        <YAxis
          yAxisId="right"
          orientation="right"
          allowDecimals={false}
          interval={config.yAxis2?.interval as never}
          domain={(config.yAxis2?.domain as never) ?? [0, 'auto']}
          ticks={config.yAxis2?.ticks ?? undefined}
          allowDataOverflow
          label={
            config.yAxis2?.label
              ? {
                  value: config.yAxis2.label,
                  angle: 90,
                  position: 'insideRight',
                  style: { textAnchor: 'middle', fontSize: 10, fill: '#999' },
                }
              : undefined
          }
        />
      ) : null}

      {!isEmpty(config.reference?.yLines)
        ? config.reference.yLines?.map((entry, index) => (
            <ReferenceLine
              key={`ref-y-baseline-${id}-${index}-${entry.line}`}
              y={entry.line}
              label={entry.label as string | undefined}
              strokeDasharray={entry.strokeDasharray}
              stroke={entry.stroke ?? '#666666'}
              isFront
              strokeWidth={1.5}
            />
          ))
        : null}

      {!isEmpty(config.reference?.highPriority?.xLines)
        ? config.reference.highPriority?.xLines?.map((entry, index) => (
            <ReferenceLine
              key={`ref-x-high-${id}-${index}-${entry.value}`}
              x={entry.value}
              label={entry.label as never}
              strokeDasharray={entry.strokeDasharray ?? '3 3'}
              stroke={entry.stroke ?? '#666666'}
              isFront
              strokeWidth={entry.strokeWidth ?? 1}
            />
          ))
        : null}

      {config.reference?.enableBFTLines && enabledBFT
        ? config.reference.enableBFTLines.map((entry, index) => (
            <ReferenceArea
              key={`bg-bft-label-area-${title}-${index}-${entry.name}`}
              y1={Number(entry.min)}
              y2={Number(entry.max)}
              isFront
              label={<BftReferenceLabel label={`${entry.scale} Bft`} />}
              fillOpacity={0}
            />
          ))
        : null}

      {config.reference?.windArrows && config.reference.windArrows.length > 0 ? (
        <Customized
          component={({
            xAxisMap,
            offset,
          }: {
            xAxisMap?: Record<string, { scale?: (value: number) => number }>
            offset?: { top?: number }
          }) => {
            const xScale = xAxisMap?.[0]?.scale
            if (!xScale) return null
            const arrowY = (offset?.top ?? 0) + 12
            return (
              <g>
                {config.reference.windArrows?.map(({ ms, direction }, idx) => {
                  const x = xScale(ms)
                  if (!Number.isFinite(x)) return null
                  return (
                    <g
                      key={idx}
                      transform={`translate(${x},${arrowY}) rotate(${direction + 180})`}
                    >
                      <polygon
                        points={WIND_DIRECTION_ARROW_POINTS}
                        fill="#6c757d"
                        fillOpacity={0.75}
                      />
                    </g>
                  )
                })}
              </g>
            )
          }}
        />
      ) : null}

      <Tooltip
        labelFormatter={config.tooltip.labelFormatter}
        content={config.tooltip.content as ReactElement | undefined}
        cursor={config.tooltip.cursor ?? { stroke: '#2E2E2B' }}
        formatter={config.tooltip.formatter as never}
        wrapperStyle={config.tooltip.wrapperStyle ?? {}}
        animationDuration={150}
      />
    </ComposedChart>
  )

  return (
    <div ref={chartRef} className="ip:relative ip:pr-2">
      <div className="ip:flex ip:justify-between">
        <div className="ip:flex ip:flex-col ip:items-start ip:p-1 ip:text-xs ip:font-bold ip:uppercase ip:dark:text-white">
          <div className="ip:min-w-56 ip:overflow-hidden ip:truncate">
            {title ?? ''}
            {titleExtra ? (
              <span className="ip:ml-2 ip:text-[10px] ip:font-light ip:truncate">
                {titleExtra}
              </span>
            ) : null}
            {config.reference?.unit ? (
              <span className="ip:ml-2 ip:truncate ip:text-[10px] ip:font-light ip:text-gray-500 ip:dark:text-white/50">
                {config.reference.unit}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <div className="ip:flex ip:items-center ip:gap-1 ip:text-[10px] ip:font-normal ip:opacity-75">
              <span>{subtitle}</span>
            </div>
          ) : null}
        </div>
        {config.reference?.enableBFTLines ? (
          <div className="ip:flex ip:items-center ip:gap-2">
            <TimeseriesPills
              items={bftOptions}
              onChange={(value) => setEnabledBFT(value === 'bft')}
              resize={false}
              minItems={0}
              maxItems={2}
            />
          </div>
        ) : null}
      </div>
      <div className="ip:mt-2 ip:text-[11px]">
        {fixedWidth != null
          ? renderComposedChart({
              width: fixedWidth,
              height: chartBlockHeight,
            })
          : (
              <ResponsiveContainer
                width="100%"
                height={chartBlockHeight}
                debounce={50}
                minWidth={0}
              >
                {renderComposedChart({})}
              </ResponsiveContainer>
            )}
      </div>
    </div>
  )
}
