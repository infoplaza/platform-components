import type {
  EnsembleChartBlock,
  EnsembleElementGroup,
  EnsembleElementItem,
  EnsembleModel,
  EnsembleRow,
  EnsembleRun,
  EnsembleView,
} from './types'
import ensembleUtil from './utils/ensemble'

export type EnsemblePointDatum = {
  time: number
  value: Record<string, number | null>
}

export type EnsemblePointSeries = {
  element: string
  level: string
  unit: string
  data: EnsemblePointDatum[]
}

export type EnsemblePointForecast = {
  model: string
  runtime: number | null
  latitude: number
  longitude: number
  elements: EnsemblePointSeries[]
}

type RequestedItem = {
  item: EnsembleElementItem
  element: string
  level: string
  unit?: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function asNumber(value: unknown): number | null {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function forecastRecord(payload: unknown): Record<string, unknown> {
  const record = asRecord(payload) ?? {}
  const nested = asRecord(record.data)
  if (nested && Array.isArray(nested.elements)) {
    return nested
  }
  return record
}

function normalizeLevel(level: string | null | undefined): string {
  if (level == null || level === '-' || level === 'null') {
    return ''
  }
  return String(level)
}

function formatRuntime(runtime: number | null | undefined): string | undefined {
  if (runtime == null || !Number.isFinite(runtime)) {
    return undefined
  }
  return (
    new Date(runtime * 1000).toISOString().slice(0, 16).replace('T', ' ') + 'Z'
  )
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

function pairKey(element: string, level: string): string {
  return `${element}\0${normalizeLevel(level)}`
}

function requestedItems(group: EnsembleElementGroup): RequestedItem[] {
  const items: RequestedItem[] = []
  for (const item of group.items ?? []) {
    if (!item.element) {
      continue
    }
    items.push({
      item,
      element: item.element,
      level: item.level ?? '',
      unit: item.unit,
    })
  }
  return items
}

function uniquePairs(items: RequestedItem[]): RequestedItem[] {
  const seen = new Set<string>()
  const unique: RequestedItem[] = []
  for (const entry of items) {
    const key = pairKey(entry.element, entry.level)
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    unique.push(entry)
  }
  return unique
}

function toMembers(value: unknown): Record<string, number | null> {
  const record = asRecord(value)
  if (!record) {
    return {}
  }
  const members: Record<string, number | null> = {}
  for (const [key, entry] of Object.entries(record)) {
    if (!key) {
      continue
    }
    members[key] =
      entry == null || entry === ''
        ? null
        : Number.isFinite(Number(entry))
          ? Number(entry)
          : null
  }
  return members
}

function toPointData(value: unknown): EnsemblePointDatum[] {
  if (!Array.isArray(value)) {
    return []
  }
  const points: EnsemblePointDatum[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') {
      continue
    }
    const record = entry as Record<string, unknown>
    const time = asNumber(record.time) ?? asNumber(record.timestamp)
    if (time == null) {
      continue
    }
    points.push({
      time,
      value: toMembers(record.value),
    })
  }
  return points
}

function parsePointForecast(payload: unknown): EnsemblePointForecast {
  const record = forecastRecord(payload)
  const runtime = asNumber(record.runtime)

  return {
    model: String(record.model ?? ''),
    runtime,
    latitude: Number(record.latitude),
    longitude: Number(record.longitude),
    elements: Array.isArray(record.elements)
      ? record.elements.map((entry) => {
          const series = (entry ?? {}) as Record<string, unknown>
          return {
            element: String(series.element ?? ''),
            level: String(series.level ?? ''),
            unit: String(series.unit ?? ''),
            data: toPointData(series.data),
          }
        })
      : [],
  }
}

function findSeries(
  elements: EnsemblePointSeries[],
  element: string,
  level: string,
): EnsemblePointSeries | undefined {
  const wanted = normalizeLevel(level)
  const exact = elements.find(
    (series) =>
      series.element === element && normalizeLevel(series.level) === wanted,
  )
  if (exact) {
    return exact
  }
  if (!wanted) {
    return elements.find((series) => series.element === element)
  }
  return undefined
}

const RESERVED_ROW_KEYS = new Set([
  'datetime',
  'metadata',
  'debug',
  'min',
  'max',
  'median',
  'control',
  'percentile10',
  'percentile25',
  'percentile50',
  'percentile75',
  'percentile90',
  'mean',
])

function memberKeysFromValue(
  value: Record<string, number | null>,
): string[] {
  return Object.keys(value).filter(
    (key) => key.length > 0 && !RESERVED_ROW_KEYS.has(key),
  )
}

function toEnsembleRows(data: EnsemblePointDatum[]): EnsembleRow[] {
  return data.map((entry) => {
    const iso = new Date(entry.time * 1000).toISOString()
    const keys = memberKeysFromValue(entry.value)
    const values = keys.map((key) => entry.value[key] ?? null)
    const numeric = values.filter(
      (value): value is number => value != null && Number.isFinite(value),
    )
    const sorted = [...numeric].sort((a, b) => a - b)
    const median = percentile(sorted, 0.5)
    const firstKey = keys[0]
    const control =
      asNumber(entry.value.control) ??
      (firstKey != null ? asNumber(entry.value[firstKey]) : null) ??
      0

    const record: EnsembleRow = {
      datetime: iso,
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      median,
      control,
      percentile10: percentile(sorted, 0.1),
      percentile25: percentile(sorted, 0.25),
      percentile50: median,
      percentile75: percentile(sorted, 0.75),
      percentile90: percentile(sorted, 0.9),
      metadata: {
        datetime: iso,
        epoch: entry.time,
        sequence: 1,
        rawValue: values,
      },
    }
    keys.forEach((key) => {
      record[key] = entry.value[key]
    })
    return record
  })
}

function memberKeysFromRows(
  rows: EnsembleRow[],
  model: EnsembleModel,
): string[] {
  const fromRows = new Set<string>()
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key.startsWith('member')) {
        fromRows.add(key)
      }
    }
  }
  if (fromRows.size > 0) {
    return [...fromRows].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    )
  }
  return (model.members ?? []).filter((item) => item.startsWith('member'))
}

function buildChart(options: {
  item: EnsembleElementItem
  view: EnsembleView
  model: EnsembleModel
  run: number
  locale: string
  timezone: string | null
  rows: EnsembleRow[]
  subtitle?: string
}): EnsembleChartBlock | null {
  const { item, view, model, run, locale, timezone, rows } = options
  const scenario = item.scenario[view]
  if (!scenario || !item.scenario.available.includes(view)) {
    return null
  }
  if (rows.length === 0) {
    return null
  }

  const adapted = scenario.adapter ? scenario.adapter({ data: rows }) : rows
  const members = memberKeysFromRows(adapted, model)

  const config = ensembleUtil[view].graph({
    slug: item.slug,
    title: item.title,
    titleExtra: item.level,
    subtitle: options.subtitle ?? item.subtitle,
    unit: item.unit,
    config: scenario,
    rows: adapted,
    members: [...members, 'median', 'control'],
    model: model.title,
    run,
    language: locale,
    utcTimezone: timezone === 'UTC',
    timezone,
  })

  return {
    title: item.title,
    subtitle: options.subtitle ?? item.subtitle,
    titleExtra: item.level,
    config,
  }
}

async function pointForecastErrorMessage(response: Response): Promise<string> {
  const fallback = `Failed to fetch ensemble point forecast: ${response.status}`
  try {
    const body = await response.json()
    const record = asRecord(body)
    const error = record?.error
    if (typeof error === 'string' && error.trim()) {
      return error
    }
    if (error && typeof error === 'object') {
      const detail = error as Record<string, unknown>
      const description =
        typeof detail.description === 'string' ? detail.description.trim() : ''
      const message =
        typeof detail.message === 'string' ? detail.message.trim() : ''
      return description || message || fallback
    }
  } catch {
    // Ignore JSON parse failures and use the status fallback.
  }
  return fallback
}

async function fetchPointForecast(options: {
  basePath: string
  lat: number
  lon: number
  model: string
  runtime?: number
  elements: string[]
  levels: string[]
  units?: string[]
  signal?: AbortSignal
}): Promise<EnsemblePointForecast> {
  const params = new URLSearchParams({
    lat: String(options.lat),
    lon: String(options.lon),
    model: options.model,
    elements: options.elements.join(','),
  })
  if (options.levels.length > 0) {
    params.set('levels', options.levels.join(','))
  }
  if (options.runtime != null) {
    params.set('runtime', String(options.runtime))
  }
  if (
    options.units &&
    options.units.length === options.elements.length &&
    options.units.every(Boolean)
  ) {
    params.set('units', options.units.join(','))
  }

  const response = await fetch(
    `${options.basePath.replace(/\/+$/, '')}/ensemble-point-forecast?${params.toString()}`,
    { signal: options.signal },
  )
  if (!response.ok) {
    throw new Error(await pointForecastErrorMessage(response))
  }
  return parsePointForecast(await response.json())
}

function emptyForecast(
  model: string,
  runtime: number | undefined,
  lat: number,
  lon: number,
): EnsemblePointForecast {
  return {
    model,
    runtime: runtime ?? null,
    latitude: lat,
    longitude: lon,
    elements: [],
  }
}

function mergeForecasts(
  forecasts: EnsemblePointForecast[],
): EnsemblePointForecast {
  const primary = forecasts.find((entry) => entry.elements.length > 0)
  const fallback = primary ?? forecasts[0]
  if (!fallback) {
    return {
      model: '',
      runtime: null,
      latitude: Number.NaN,
      longitude: Number.NaN,
      elements: [],
    }
  }
  return {
    ...fallback,
    elements: forecasts.flatMap((entry) => entry.elements),
  }
}

function requestUnits(pairs: RequestedItem[]): string[] | undefined {
  const units = pairs.map((entry) => entry.unit ?? '')
  if (units.length === pairs.length && units.every(Boolean)) {
    return units
  }
  return undefined
}

function assembleCharts(options: {
  forecast: EnsemblePointForecast
  model: EnsembleModel
  items: RequestedItem[]
  view: EnsembleView
  locale: string
  timezone: string | null
  subtitle?: string
}): EnsembleChartBlock[] {
  const runtime = options.forecast.runtime
  const run =
    runtime != null && Number.isFinite(runtime)
      ? runtime
      : Math.max(...options.model.runtimes, 0)

  const charts: EnsembleChartBlock[] = []
  for (const requested of options.items) {
    const series = findSeries(
      options.forecast.elements,
      requested.element,
      requested.level,
    )
    if (!series?.data.length) {
      continue
    }
    const block = buildChart({
      item: requested.item,
      view: options.view,
      model: options.model,
      run,
      locale: options.locale,
      timezone: options.timezone,
      rows: toEnsembleRows(series.data),
      subtitle: options.subtitle,
    })
    if (block) {
      charts.push(block)
    }
  }
  return charts
}

/**
 * Loads ensemble point-forecast series and maps them onto chart blocks for
 * the selected element group. `run === 'all'` fetches one payload per catalog
 * runtime.
 */
export async function fetchEnsembleCharts(options: {
  basePath: string
  lat: number
  lon: number
  model: EnsembleModel
  run: EnsembleRun
  group: EnsembleElementGroup
  view: EnsembleView
  locale: string
  timezone: string | null
  signal?: AbortSignal
}): Promise<EnsembleChartBlock[]> {
  const items = requestedItems(options.group)
  const pairs = uniquePairs(items)
  const runtimes =
    options.run === 'all'
      ? [...options.model.runtimes]
      : typeof options.run === 'number'
        ? [options.run]
        : []

  if (pairs.length === 0) {
    return []
  }

  const withLevels = pairs.filter((entry) =>
    Boolean(normalizeLevel(entry.level)),
  )
  const withoutLevels = pairs.filter(
    (entry) => !normalizeLevel(entry.level),
  )
  const stampRuntime = options.run === 'all'

  const forecasts = await Promise.all(
    (runtimes.length > 0 ? runtimes : [undefined]).map(async (runtime) => {
      const batches = await Promise.all(
        [
          withLevels.length > 0
            ? fetchPointForecast({
                basePath: options.basePath,
                lat: options.lat,
                lon: options.lon,
                model: options.model.slug,
                runtime,
                elements: withLevels.map((entry) => entry.element),
                levels: withLevels.map((entry) => entry.level),
                units: requestUnits(withLevels),
                signal: options.signal,
              })
            : emptyForecast(
                options.model.slug,
                runtime,
                options.lat,
                options.lon,
              ),
          withoutLevels.length > 0
            ? fetchPointForecast({
                basePath: options.basePath,
                lat: options.lat,
                lon: options.lon,
                model: options.model.slug,
                runtime,
                elements: withoutLevels.map((entry) => entry.element),
                levels: [],
                units: requestUnits(withoutLevels),
                signal: options.signal,
              })
            : emptyForecast(
                options.model.slug,
                runtime,
                options.lat,
                options.lon,
              ),
        ],
      )
      return mergeForecasts(batches)
    }),
  )

  return forecasts.flatMap((forecast) =>
    assembleCharts({
      forecast,
      model: options.model,
      items,
      view: options.view,
      locale: options.locale,
      timezone: options.timezone,
      subtitle: stampRuntime
        ? formatRuntime(forecast.runtime)
        : undefined,
    }),
  )
}
