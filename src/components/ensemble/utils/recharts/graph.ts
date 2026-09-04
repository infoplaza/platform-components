import { formatDate } from '@/src/utilities/date'
import type { EnsembleRow, EnsembleYConfig } from '../../types'
import { toSupportedLocale } from '../locale'

type GraphDefaultProps = {
  language?: string
  timezone?: string | null
}

export function graphDefault({
  language,
  timezone = null,
}: GraphDefaultProps) {
  const locale = toSupportedLocale(language)
  return {
    x: [
      {
        key: 'datetime',
        formatter: (date: number) => {
          const dt = new Date(date)
          return formatDate(dt, 'EEEEEE d', locale, timezone ?? undefined)
        },
      },
    ],
    y: [] as EnsembleYConfig[],
    yAxis: {
      ticks: null as number[] | null,
    },
    legend: {
      active: true,
      verticalAlign: 'top' as const,
      align: 'center' as const,
      enableOnClick: true,
    },
    tooltip: {
      labelFormatter: (val: unknown) => {
        const dt = new Date(val as number)
        return formatDate(
          dt,
          'EEEEEE d MMM yyyy, HH:mm',
          locale,
          timezone ?? undefined,
        )
      },
      content: null as unknown,
      wrapperStyle: null as unknown,
    },
    data: [] as Array<Record<string, unknown>>,
    reference: {
      xLines: [] as number[],
      alternateArea: true,
      yLines: [] as Array<{
        line: number
        stroke?: string
        strokeDasharray?: string
      }>,
    },
  }
}

export function getMinMaxValues(rows: EnsembleRow[], _modelApi?: string) {
  const allValues = rows.flatMap((row) =>
    (row.metadata?.rawValue ?? []).filter(
      (entry): entry is number => entry != null,
    ),
  )
  const minValue = Math.floor(Math.min(...allValues))
  const maxValue = Math.ceil(Math.max(...allValues))
  return { minValue, maxValue }
}

function graphValue(key: string, i: number, rows: unknown): unknown {
  if (!Array.isArray(rows)) return null
  const row = rows.find(
    (item) =>
      item && typeof item === 'object' && 'title' in item && item.title === key,
  ) as { data?: Array<{ value?: unknown }> } | undefined
  if (row) {
    return row.data?.[i]?.value ?? null
  }
  return null
}

export function graphArea({
  dataKeys,
  name,
  unit,
  color,
  textColor,
  opacity = 1,
}: {
  dataKeys: string[]
  name: string
  unit?: string
  color: string
  textColor?: string
  opacity?: number
}): EnsembleYConfig {
  return {
    display: 'area',
    dataKey: dataKeys.join('_'),
    dataSet: (data, index, rows) => {
      data[dataKeys.join('_')] = dataKeys.map((k) => graphValue(k, index, rows))
    },
    dataSet2: (data, rows) => {
      data[dataKeys.join('_')] = dataKeys.map((k) => rows[k])
    },
    name,
    unit,
    type: 'monotone',
    fill: color,
    stroke: textColor,
    strokeWidth: 0,
    opacity,
    dot: false,
  }
}

export function graphLine({
  dataKey,
  name,
  unit,
  color,
  type = 'monotone',
  width = 1,
  strokeDasharray = '0',
  activeDot,
  legend,
}: {
  dataKey: string
  name: string
  unit?: string
  color: string
  type?: string
  width?: number
  strokeDasharray?: string
  activeDot?: unknown
  legend?: string
}): EnsembleYConfig {
  return {
    display: 'line',
    legend: legend ?? dataKey,
    dataKey,
    name,
    unit,
    dataSet: (data, index, rows) => {
      data[dataKey] = graphValue(dataKey, index, rows)
    },
    type,
    stroke: color,
    strokeWidth: width,
    opacity: 1,
    dot: false,
    activeDot: activeDot ?? true,
    strokeDasharray,
  }
}

export function graphBar({
  dataKey,
  stackId,
  name,
  unit,
  fill,
  width,
  translatable = false,
  shape,
  activeBar,
  type = 'number',
}: {
  dataKey: string
  stackId: string
  name: string
  unit?: string
  fill: string
  width?: number | ((data: EnsembleRow) => number | undefined)
  translatable?: boolean
  shape?: unknown
  activeBar?: unknown
  type?: string
}): EnsembleYConfig {
  return {
    display: 'bar',
    legend: dataKey,
    dataKey,
    stackId,
    name,
    unit,
    fill,
    type,
    translatable,
    width: width as EnsembleYConfig['width'],
    shape,
    activeBar,
    dataSet: (data, index, rows) => {
      data[dataKey] = graphValue(dataKey, index, rows)
    },
  }
}
