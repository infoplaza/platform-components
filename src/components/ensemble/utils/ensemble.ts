import * as Option from './recharts'
import type {
  EnsembleGraphConfig,
  EnsembleModel,
  EnsembleRow,
  EnsembleYConfig,
} from '../types'
import { isEmpty } from './is-empty'

export const hoursToMilliseconds = (hours: number) => hours * 60 * 60 * 1000

function getStartOfDayTimestamp(timestamp: number, isUTC = false) {
  const date = new Date(timestamp)
  if (isUTC) {
    date.setUTCHours(0, 0, 0, 0)
  } else {
    date.setHours(0, 0, 0, 0)
  }
  return date
}

function createIntervals(start: number, end: number, intervalMs: number) {
  const intervals: number[] = []
  let current = start
  while (current <= end) {
    intervals.push(current)
    current += intervalMs
  }
  return intervals
}

function generateIntervals(
  config: { data: Array<{ datetime: number }>; x: Array<{ ticks?: number[] }> },
  intervalInHours: number,
) {
  const intervalMs = hoursToMilliseconds(intervalInHours)
  const dateTimeList = config.data.map(({ datetime }) => datetime)
  const startTimestamp = getStartOfDayTimestamp(Math.min(...dateTimeList))
  const endTimestamp = Math.max(...dateTimeList)
  const intervals = createIntervals(
    startTimestamp.getTime(),
    endTimestamp,
    intervalMs,
  )
  return intervals.filter((ts) => !config.x[0]?.ticks?.includes(ts))
}

function processRows(
  rows: EnsembleRow[],
  yConfig: EnsembleYConfig[],
  isUTC = false,
) {
  return rows.map((entry) => {
    let datetime: number
    if (isUTC) {
      const date = new Date(entry.datetime)
      datetime = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds(),
      )
    } else {
      datetime = new Date(entry.datetime).getTime()
    }
    const dataPoint: Record<string, unknown> = { ...entry, datetime }
    yConfig.forEach((y) => {
      y?.dataSet2?.(dataPoint, entry)
    })
    return dataPoint
  })
}

function generateTicks(startTime: number, endTime: number, isUTC = false) {
  const ticks: number[] = []
  const current = getStartOfDayTimestamp(startTime, isUTC)
  ticks.push(startTime)
  ticks.push(endTime)
  while (current.getTime() < endTime) {
    if (current.getTime() > startTime) {
      ticks.push(current.getTime())
    }
    let dayDuration = 86400000
    const nextTime = new Date(current.getTime() + dayDuration)
    if (!isUTC) {
      if (current.getTimezoneOffset() < nextTime.getTimezoneOffset()) {
        dayDuration += 3600000
      }
      if (current.getTimezoneOffset() > nextTime.getTimezoneOffset()) {
        dayDuration -= 3600000
      }
    }
    current.setTime(current.getTime() + dayDuration)
  }
  return ticks
}

function generateMidDayTicks(data: Array<{ datetime: number }>) {
  if (!data || data.length === 0) return []
  const dailyTicks = data.map((d) => d.datetime)
  const medianTicks: number[] = []
  for (let i = 0; i < dailyTicks.length; i++) {
    const current = dailyTicks[i]
    const next = dailyTicks[i + 1]
    if (next == null) {
      medianTicks.push(current)
      continue
    }
    medianTicks.push(current + (next - current) / 2)
  }
  return medianTicks
}

function generateTickFormatter(
  tickType: string,
  startTime: number,
  endTime: number,
  data: Array<{ datetime: number }>,
  options: { isUTC?: boolean } = { isUTC: false },
) {
  switch (tickType) {
    case 'number':
      return generateTicks(startTime, endTime, options?.isUTC ?? false)
    case 'category':
      return data.map((d) => d.datetime)
    default:
      return data.map((d) => d.datetime)
  }
}

function configureXAxis(
  xAxes: EnsembleGraphConfig['x'],
  data: Array<{ datetime: number }>,
  options: EnsembleGraphConfig['reference'],
) {
  if (isEmpty(data)) return xAxes
  const tickType = options.xLineOptions?.tickType ?? 'number'
  const firstEntry = data[0]
  const startTime = firstEntry?.datetime
  const endTime = data[data.length - 1].datetime
  const ticks = generateTickFormatter(tickType, startTime, endTime, data, {
    isUTC: options.isUTC,
  })

  return xAxes.map((x, index) => ({
    ...x,
    xAxisId: index,
    domain: [
      startTime - (options.xLineOptions?.domainOffset ?? 0),
      endTime + (options.xLineOptions?.domainOffset ?? 0),
    ] as [number, number],
    ticks,
    type: options.xLineOptions?.type ?? 'number',
  }))
}

function generateXLines(
  mode: string,
  config: { data: Array<{ datetime: number }>; x: Array<{ ticks?: number[] }> },
  data: Array<{ datetime: number }>,
  xLineOptions?: { interval?: number },
) {
  switch (mode) {
    case 'midDay':
      return generateMidDayTicks(data)
    case 'default':
    default:
      return generateIntervals(config, xLineOptions?.interval ?? 6)
  }
}

export function graphConfig({
  config,
  rows,
  utcTimezone,
}: {
  config: EnsembleGraphConfig
  rows: EnsembleRow[]
  utcTimezone?: boolean
}): EnsembleGraphConfig {
  const newConfig = { ...config }
  if (!newConfig.reference) {
    newConfig.reference = {}
  }
  const isUTC = utcTimezone ?? newConfig.reference?.isUTC ?? false
  newConfig.reference.isUTC = isUTC
  newConfig.data = processRows(rows, newConfig.y, isUTC)
  newConfig.x = configureXAxis(
    newConfig.x,
    newConfig.data as Array<{ datetime: number }>,
    newConfig.reference,
  )
  const enabledXLines = !(newConfig.reference?.xLineOptions?.hideXLines ?? false)
  if (enabledXLines) {
    const xLineMode = newConfig.reference?.xLineOptions?.mode ?? 'default'
    newConfig.reference.xLines = generateXLines(
      xLineMode,
      newConfig as unknown as {
        data: Array<{ datetime: number }>
        x: Array<{ ticks?: number[] }>
      },
      newConfig.data as Array<{ datetime: number }>,
      newConfig.reference?.xLineOptions,
    )
  }
  return newConfig
}

type GraphProps = {
  model?: EnsembleModel | string
  config?: { chart?: 'plume' | 'line' | 'bar' }
  rows: EnsembleRow[]
  members?: string[]
  utcTimezone?: boolean
  [key: string]: unknown
}

const BASIC_MEMBERS = [
  'min',
  'max',
  'median',
  'percentile10',
  'percentile25',
  'percentile75',
  'percentile90',
]

const ensembleUtil = {
  basic: {
    members: (props: { model: EnsembleModel }) => {
      const { model } = props
      return BASIC_MEMBERS.filter((m) => (model.members ?? []).includes(m))
    },
    graph: (props: GraphProps) => {
      const view = props?.config?.chart ?? 'plume'
      const factory = Option[view]
      const configBase = factory({ ...props, view: 'basic' }) as EnsembleGraphConfig
      return graphConfig({
        config: configBase,
        rows: props.rows,
        utcTimezone: props.utcTimezone,
      })
    },
  },
  expert: {
    members: (_props: { model: EnsembleModel }) => {
      return ['all', 'median', 'control']
    },
    graph: (props: GraphProps) => {
      const { rows, members = [] } = props
      const membersList = members.filter(
        (m) => m.indexOf('member') === 0 || m === 'median',
      )
      const view = props?.config?.chart ?? 'line'
      const factory = Option[view]
      const configBase = factory({
        ...props,
        membersList,
        view: 'expert',
      }) as EnsembleGraphConfig
      return graphConfig({
        config: configBase,
        rows,
        utcTimezone: props.utcTimezone,
      })
    },
  },
}

export default ensembleUtil
