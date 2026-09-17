import type {
  TimeseriesChartGraphConfig,
  TimeseriesChartLineSeries,
  TimeseriesChartThresholdGroup,
  TimeseriesChartThresholdLevel,
  TimeseriesChartThresholdOperator,
  TimeseriesChartThresholdRow,
  TimeseriesChartThresholds,
} from './types'

export const TIMESERIES_CHART_THRESHOLD_COLORS = {
  none: '#22c55e',
  yellow: '#EAB308',
  orange: '#ff9300',
  red: '#E63A48',
} as const

export const TIMESERIES_CHART_THRESHOLD_LABELS = {
  yellow: 'Watch',
  orange: 'Caution',
  red: 'Critical',
} as const

const SEVERITY_LEVELS = ['red', 'orange', 'yellow'] as const

const Y_LINE_SCALE_FACTOR = 1.25

export type TimeseriesChartThresholdYLine = {
  y: number
  level: Exclude<TimeseriesChartThresholdLevel, 'none'>
  color: string
  direction: 'up' | 'down' | null
}

export type TimeseriesChartThresholdSegment = {
  startTs: number
  endTs: number
  level: TimeseriesChartThresholdLevel
  color: string
}

export function lineMatchesElement(
  line: TimeseriesChartLineSeries,
  elementId: string,
): boolean {
  if (line.element === elementId || line.slug === elementId) {
    return true
  }
  return line.slug.endsWith(`_${elementId}`)
}

function groupIsApplicable(
  group: TimeseriesChartThresholdGroup | undefined,
  lines: TimeseriesChartLineSeries[],
): boolean {
  const rows = group?.rows ?? []
  if (rows.length === 0) {
    return false
  }
  return rows.every((row) =>
    lines.some((line) => lineMatchesElement(line, row.elementId)),
  )
}

export function applicableThresholdGroups(
  thresholds: TimeseriesChartThresholds | null | undefined,
  lines: TimeseriesChartLineSeries[],
): {
  yellow: TimeseriesChartThresholdGroup[]
  orange: TimeseriesChartThresholdGroup[]
  red: TimeseriesChartThresholdGroup[]
} | null {
  if (!thresholds?.conditions || lines.length === 0) {
    return null
  }

  const yellow = (thresholds.conditions.yellow ?? []).filter((group) =>
    groupIsApplicable(group, lines),
  )
  const orange = (thresholds.conditions.orange ?? []).filter((group) =>
    groupIsApplicable(group, lines),
  )
  const red = (thresholds.conditions.red ?? []).filter((group) =>
    groupIsApplicable(group, lines),
  )

  if (yellow.length === 0 && orange.length === 0 && red.length === 0) {
    return null
  }

  return { yellow, orange, red }
}

function matchesOperator(
  value: number,
  operator: TimeseriesChartThresholdOperator | (string & {}),
  from: number | null,
  to: number | null,
): boolean {
  switch (operator) {
    case 'greater-than':
      return from != null && value > from
    case 'greater-than-or-equal':
      return from != null && value >= from
    case 'less-than':
      return from != null && value < from
    case 'less-than-or-equal':
      return from != null && value <= from
    case 'between':
      return from != null && to != null && value >= from && value <= to
    case 'equal':
      return from != null && value === from
    default:
      return false
  }
}

function numericRowValue(raw: unknown): number | null {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null
  }
  if (raw == null || raw === '') {
    return null
  }
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function valuesByElement(
  row: Record<string, unknown>,
  lines: TimeseriesChartLineSeries[],
): Map<string, number> {
  const values = new Map<string, number>()
  for (const line of lines) {
    const value = numericRowValue(row[line.slug])
    if (value == null) {
      continue
    }
    if (line.element && !values.has(line.element)) {
      values.set(line.element, value)
    }
    if (!values.has(line.slug)) {
      values.set(line.slug, value)
    }
  }
  return values
}

function rowMatches(
  row: TimeseriesChartThresholdRow,
  values: Map<string, number>,
  lines: TimeseriesChartLineSeries[],
): boolean {
  const line = lines.find((entry) => lineMatchesElement(entry, row.elementId))
  const value =
    values.get(row.elementId) ??
    (line?.element ? values.get(line.element) : undefined) ??
    (line ? values.get(line.slug) : undefined)
  if (value == null) {
    return false
  }
  return matchesOperator(value, row.operator, row.from, row.to)
}

function groupMatches(
  group: TimeseriesChartThresholdGroup,
  values: Map<string, number>,
  lines: TimeseriesChartLineSeries[],
): boolean {
  const rows = group.rows ?? []
  if (rows.length === 0) {
    return false
  }
  return rows.every((row) => rowMatches(row, values, lines))
}

function colorMatches(
  groups: TimeseriesChartThresholdGroup[],
  values: Map<string, number>,
  lines: TimeseriesChartLineSeries[],
): boolean {
  return groups.some((group) => groupMatches(group, values, lines))
}

export function hourOfDay(timestamp: number, timezone: string | null): number {
  if (!timezone) {
    return new Date(timestamp).getHours()
  }
  const formatted = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hourCycle: 'h23',
    timeZone: timezone,
  }).format(new Date(timestamp))
  const hour = Number.parseInt(formatted, 10)
  return Number.isFinite(hour) ? hour : new Date(timestamp).getHours()
}

export function evaluateThresholdLevel(
  row: Record<string, unknown>,
  groups: NonNullable<ReturnType<typeof applicableThresholdGroups>>,
  lines: TimeseriesChartLineSeries[],
  ignoredHours: number[],
  timezone: string | null,
): TimeseriesChartThresholdLevel | null {
  const values = valuesByElement(row, lines)
  if (values.size === 0) {
    return null
  }

  const ts = Number(row.ts)
  if (Number.isFinite(ts) && ignoredHours.includes(hourOfDay(ts, timezone))) {
    return 'none'
  }

  if (colorMatches(groups.red, values, lines)) {
    return 'red'
  }
  if (colorMatches(groups.orange, values, lines)) {
    return 'orange'
  }
  if (colorMatches(groups.yellow, values, lines)) {
    return 'yellow'
  }
  return 'none'
}

function dataMaxForLines(config: TimeseriesChartGraphConfig): number {
  let max = Number.NEGATIVE_INFINITY
  for (const row of config.data) {
    for (const line of config.lines) {
      const value = numericRowValue(row[line.slug])
      if (value != null && value > max) {
        max = value
      }
    }
  }
  return max
}

function thresholdDirection(
  operator: TimeseriesChartThresholdOperator | (string & {}),
  y: number,
  from: number | null,
  to: number | null,
): 'up' | 'down' | null {
  switch (operator) {
    case 'greater-than':
    case 'greater-than-or-equal':
      return 'up'
    case 'less-than':
    case 'less-than-or-equal':
      return 'down'
    case 'between':
      if (from != null && y === from) {
        return 'up'
      }
      if (to != null && y === to) {
        return 'down'
      }
      return null
    default:
      return null
  }
}

function yValuesForRow(row: TimeseriesChartThresholdRow): Array<{
  y: number
  direction: 'up' | 'down' | null
}> {
  const values: Array<{ y: number; direction: 'up' | 'down' | null }> = []
  if (row.from != null && Number.isFinite(row.from)) {
    values.push({
      y: row.from,
      direction: thresholdDirection(row.operator, row.from, row.from, row.to),
    })
  }
  if (
    row.operator === 'between' &&
    row.to != null &&
    Number.isFinite(row.to)
  ) {
    values.push({
      y: row.to,
      direction: thresholdDirection(row.operator, row.to, row.from, row.to),
    })
  }
  return values
}

export function thresholdYLines(
  config: TimeseriesChartGraphConfig,
  thresholds: TimeseriesChartThresholds | null | undefined,
): TimeseriesChartThresholdYLine[] {
  const groups = applicableThresholdGroups(thresholds, config.lines)
  if (!groups) {
    return []
  }

  const max = dataMaxForLines(config)
  const cap = Number.isFinite(max) && max > 0 ? max * Y_LINE_SCALE_FACTOR : 0
  const seen = new Set<string>()
  const lines: TimeseriesChartThresholdYLine[] = []

  for (const level of SEVERITY_LEVELS) {
    for (const group of groups[level]) {
      for (const row of group.rows ?? []) {
        if (!config.lines.some((line) => lineMatchesElement(line, row.elementId))) {
          continue
        }
        for (const entry of yValuesForRow(row)) {
          if (cap > 0 && entry.y > cap) {
            continue
          }
          const key = `${level}:${entry.y}:${entry.direction ?? 'none'}`
          if (seen.has(key)) {
            continue
          }
          seen.add(key)
          lines.push({
            y: entry.y,
            level,
            color: TIMESERIES_CHART_THRESHOLD_COLORS[level],
            direction: entry.direction,
          })
        }
      }
    }
  }

  return lines.sort((a, b) => a.y - b.y)
}

export function thresholdStripSegments(
  config: TimeseriesChartGraphConfig,
  thresholds: TimeseriesChartThresholds | null | undefined,
  timezone: string | null,
): TimeseriesChartThresholdSegment[] {
  const groups = applicableThresholdGroups(thresholds, config.lines)
  if (!groups || config.data.length === 0) {
    return []
  }

  const ignoredHours = thresholds?.ignored_hours ?? []
  const domainEnd = config.domain?.[1]
  const segments: TimeseriesChartThresholdSegment[] = []

  for (let index = 0; index < config.data.length; index += 1) {
    const row = config.data[index]
    const startTs = Number(row.ts)
    if (!Number.isFinite(startTs)) {
      continue
    }
    const nextTs = Number(config.data[index + 1]?.ts)
    const endTs = Number.isFinite(nextTs)
      ? nextTs
      : Number.isFinite(domainEnd)
        ? (domainEnd as number)
        : startTs
    const level = evaluateThresholdLevel(
      row,
      groups,
      config.lines,
      ignoredHours,
      timezone,
    )
    if (level == null) {
      continue
    }
    const previous = segments[segments.length - 1]
    if (previous && previous.level === level && previous.endTs === startTs) {
      previous.endTs = endTs
      continue
    }
    segments.push({
      startTs,
      endTs,
      level,
      color: TIMESERIES_CHART_THRESHOLD_COLORS[level],
    })
  }

  return segments
}

export function thresholdLevelAtTimestamp(
  config: TimeseriesChartGraphConfig,
  thresholds: TimeseriesChartThresholds | null | undefined,
  timestamp: number | null,
  timezone: string | null,
): TimeseriesChartThresholdLevel | null {
  if (timestamp == null) {
    return null
  }
  const groups = applicableThresholdGroups(thresholds, config.lines)
  if (!groups) {
    return null
  }
  const row = config.data.find((entry) => Number(entry.ts) === timestamp)
  if (!row) {
    return null
  }
  return evaluateThresholdLevel(
    row,
    groups,
    config.lines,
    thresholds?.ignored_hours ?? [],
    timezone,
  )
}

export function thresholdLegendLevels(
  lines: TimeseriesChartThresholdYLine[],
): Array<Exclude<TimeseriesChartThresholdLevel, 'none'>> {
  const seen = new Set<Exclude<TimeseriesChartThresholdLevel, 'none'>>()
  const order: Array<Exclude<TimeseriesChartThresholdLevel, 'none'>> = [
    'yellow',
    'orange',
    'red',
  ]
  for (const line of lines) {
    seen.add(line.level)
  }
  return order.filter((level) => seen.has(level))
}

export function thresholdYAxisMax(
  config: TimeseriesChartGraphConfig,
  lines: TimeseriesChartThresholdYLine[],
): number | 'auto' {
  if (lines.length === 0) {
    return 'auto'
  }
  const dataMax = dataMaxForLines(config)
  const lineMax = Math.max(...lines.map((line) => line.y))
  if (Number.isFinite(dataMax) && dataMax >= lineMax) {
    return 'auto'
  }
  const max = Math.max(Number.isFinite(dataMax) ? dataMax : 0, lineMax)
  return max > 0 ? max : 'auto'
}
