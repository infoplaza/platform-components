import type {
  TimeseriesBlock,
  TimeseriesCell,
  TimeseriesElementGroup,
  TimeseriesElementItem,
  TimeseriesHiddenRow,
  TimeseriesModel,
  TimeseriesModelElement,
  TimeseriesRow,
  TimeseriesRun,
} from './types'

const HIDDEN_REASON = 'Not available for this model'
const NO_DATA_REASON = 'No data'

export type TimeseriesPointSeries = {
  element: string
  level: string
  unit: string
  data: TimeseriesCell[]
}

export type TimeseriesPointForecast = {
  model: string
  runtime: number | null
  latitude: number
  longitude: number
  elements: TimeseriesPointSeries[]
}

type RequestedItem = {
  item: TimeseriesElementItem
  element: string
  level: string
  unit?: string
}

function catalogElement(
  model: TimeseriesModel,
  id: string,
): TimeseriesModelElement | undefined {
  return model.elements?.find((entry) => entry.id === id)
}

function hasRestrictedLevels(levels: readonly string[] | undefined): boolean {
  return Array.isArray(levels) && levels.length > 0
}

export function isTimeseriesItemAvailable(
  model: TimeseriesModel,
  item: TimeseriesElementItem,
): boolean {
  if (!item.element) {
    return false
  }
  const catalog = catalogElement(model, item.element)
  if (!catalog) {
    return false
  }
  if (!item.level || !hasRestrictedLevels(catalog.levels)) {
    return true
  }
  return catalog.levels?.includes(item.level) === true
}

function resolveItemLevel(
  model: TimeseriesModel,
  item: TimeseriesElementItem,
): string {
  if (item.level) {
    return item.level
  }
  return catalogElement(model, item.element ?? '')?.levels?.[0] ?? ''
}

function formatRuntime(runtime: number | null | undefined): string | undefined {
  if (runtime == null || !Number.isFinite(runtime)) {
    return undefined
  }
  return (
    new Date(runtime * 1000).toISOString().slice(0, 16).replace('T', ' ') + 'Z'
  )
}

function partitionGroupItems(
  model: TimeseriesModel,
  group: TimeseriesElementGroup,
): { available: RequestedItem[]; hidden: TimeseriesHiddenRow[] } {
  const available: RequestedItem[] = []
  const hidden: TimeseriesHiddenRow[] = []

  for (const item of group.items ?? []) {
    if (!item.element || !isTimeseriesItemAvailable(model, item)) {
      hidden.push({ title: item.title, reason: HIDDEN_REASON })
      continue
    }
    available.push({
      item,
      element: item.element,
      level: resolveItemLevel(model, item),
      unit: item.unit,
    })
  }

  return { available, hidden }
}

function normalizeLevel(level: string | null | undefined): string {
  if (level == null || level === '-' || level === 'null') {
    return ''
  }
  return String(level)
}

function findSeries(
  elements: TimeseriesPointSeries[],
  element: string,
  level: string,
): TimeseriesPointSeries | undefined {
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

const CELL_COLOR_FALLBACK = {
  background: 'transparent',
  text: '#111111',
} as const

function forecastRecord(payload: unknown): Record<string, unknown> {
  const record =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : {}
  const nested =
    record.data && typeof record.data === 'object' && !Array.isArray(record.data)
      ? (record.data as Record<string, unknown>)
      : null
  if (nested && Array.isArray(nested.elements)) {
    return nested
  }
  return record
}

function toCells(value: unknown): TimeseriesCell[] {
  if (!Array.isArray(value)) {
    return []
  }

  const cells: TimeseriesCell[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') {
      continue
    }
    const record = entry as Record<string, unknown>
    const timestamp = Number(record.timestamp ?? record.time)
    if (!Number.isFinite(timestamp)) {
      continue
    }

    const raw = record.value
    const cellValue =
      raw == null || raw === ''
        ? null
        : Number.isFinite(Number(raw))
          ? Number(raw)
          : null

    const colorRecord =
      record.color && typeof record.color === 'object' && !Array.isArray(record.color)
        ? (record.color as Record<string, unknown>)
        : null
    const background =
      typeof colorRecord?.background === 'string'
        ? colorRecord.background
        : CELL_COLOR_FALLBACK.background
    const text =
      typeof colorRecord?.text === 'string'
        ? colorRecord.text
        : CELL_COLOR_FALLBACK.text

    cells.push({
      timestamp,
      value: cellValue,
      color: { background, text },
    })
  }
  return cells
}

async function pointForecastErrorMessage(response: Response): Promise<string> {
  const fallback = `Failed to fetch timeseries point forecast: ${response.status}`
  try {
    const body = await response.json()
    const record =
      body && typeof body === 'object' ? (body as Record<string, unknown>) : null
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

function parsePointForecast(payload: unknown): TimeseriesPointForecast {
  const record = forecastRecord(payload)
  const runtime = Number(record.runtime)

  return {
    model: String(record.model ?? ''),
    runtime: Number.isFinite(runtime) ? runtime : null,
    latitude: Number(record.latitude),
    longitude: Number(record.longitude),
    elements: Array.isArray(record.elements)
      ? record.elements.map((entry) => {
          const series = (entry ?? {}) as Record<string, unknown>
          return {
            element: String(series.element ?? ''),
            level: String(series.level ?? ''),
            unit: String(series.unit ?? ''),
            data: toCells(series.data),
          }
        })
      : [],
  }
}

function assembleBlock(options: {
  forecast: TimeseriesPointForecast
  model: TimeseriesModel
  available: RequestedItem[]
  hidden: TimeseriesHiddenRow[]
  titleExtra?: string
}): TimeseriesBlock {
  const rows: TimeseriesRow[] = []
  const hiddenRows = [...options.hidden]

  for (const requested of options.available) {
    const series = findSeries(
      options.forecast.elements,
      requested.element,
      requested.level,
    )
    if (!series?.data.length) {
      hiddenRows.push({
        title: requested.item.title,
        reason: series ? NO_DATA_REASON : HIDDEN_REASON,
      })
      continue
    }

    const level =
      normalizeLevel(requested.level) || normalizeLevel(series.level)

    rows.push({
      title: requested.item.title,
      titleExtra: level || undefined,
      view: requested.item.view,
      unit: series.unit || requested.item.unit,
      config: {
        element: requested.item.element,
        decimals: requested.item.decimals,
      },
      data: series.data,
    })
  }

  return {
    title: options.model.title,
    titleExtra: options.titleExtra,
    subtitle: formatRuntime(options.forecast.runtime),
    rows,
    hiddenRows: hiddenRows.length > 0 ? hiddenRows : undefined,
  }
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
}): Promise<TimeseriesPointForecast> {
  const params = new URLSearchParams({
    lat: String(options.lat),
    lon: String(options.lon),
    model: options.model,
    elements: options.elements.join(','),
    levels: options.levels.join(','),
  })
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
    `${options.basePath.replace(/\/+$/, '')}/timeseries-point-forecast?${params.toString()}`,
    { signal: options.signal },
  )
  if (!response.ok) {
    throw new Error(await pointForecastErrorMessage(response))
  }
  return parsePointForecast(await response.json())
}

function emptyBlocks(
  model: TimeseriesModel,
  run: TimeseriesRun,
  runtimes: number[],
  hidden: TimeseriesHiddenRow[],
): TimeseriesBlock[] {
  const hiddenRows = hidden.length > 0 ? hidden : undefined
  if (runtimes.length === 0) {
    return [
      {
        title: model.title,
        rows: [],
        hiddenRows,
      },
    ]
  }

  return runtimes.map((runtime, index) => ({
    title: model.title,
    titleExtra: run === 'all' && index === 0 ? 'latest' : undefined,
    subtitle: formatRuntime(runtime),
    rows: [],
    hiddenRows,
  }))
}

/**
 * Loads colored point-forecast series and maps them onto the selected
 * element group. `run === 'all'` fetches one payload per catalog runtime.
 */
export async function fetchTimeseriesBlocks(options: {
  basePath: string
  lat: number
  lon: number
  model: TimeseriesModel
  run: TimeseriesRun
  group: TimeseriesElementGroup
  signal?: AbortSignal
}): Promise<TimeseriesBlock[]> {
  const { available, hidden } = partitionGroupItems(options.model, options.group)
  const runtimes =
    options.run === 'all'
      ? [...options.model.runtimes]
      : typeof options.run === 'number'
        ? [options.run]
        : []

  if (available.length === 0) {
    return emptyBlocks(options.model, options.run, runtimes, hidden)
  }

  const elements = available.map((entry) => entry.element)
  const levels = available.map((entry) => entry.level)
  const levelsParam = levels.every((level) => !level)
    ? levels.map(() => '-')
    : levels
  const units = available.map((entry) => entry.unit ?? '')

  const forecasts = await Promise.all(
    (runtimes.length > 0 ? runtimes : [undefined]).map((runtime) =>
      fetchPointForecast({
        basePath: options.basePath,
        lat: options.lat,
        lon: options.lon,
        model: options.model.slug,
        runtime,
        elements,
        levels: levelsParam,
        units,
        signal: options.signal,
      }),
    ),
  )

  return forecasts.map((forecast, index) =>
    assembleBlock({
      forecast,
      model: options.model,
      available,
      hidden,
      titleExtra:
        options.run === 'all' && index === 0 ? 'latest' : undefined,
    }),
  )
}
