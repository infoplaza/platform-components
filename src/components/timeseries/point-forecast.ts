import type {
  TimeseriesBlock,
  TimeseriesCell,
  TimeseriesDomain,
  TimeseriesElementGroup,
  TimeseriesElementItem,
  TimeseriesHiddenRow,
  TimeseriesModel,
  TimeseriesModelElement,
  TimeseriesRow,
  TimeseriesRun,
} from './types'
import { timeseriesPointPath } from './endpoints'

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

export type TimeseriesQueryableItem = {
  title: string
  element?: string
  level?: string
  unit?: string
}

export type TimeseriesRequestedItem<
  T extends TimeseriesQueryableItem = TimeseriesQueryableItem,
> = {
  item: T
  element: string
  level: string
  unit?: string
}

export const TIMESERIES_HIDDEN_REASON = 'Not available for this model'
export const TIMESERIES_NO_DATA_REASON = 'No data'

const HIDDEN_REASON = TIMESERIES_HIDDEN_REASON
const NO_DATA_REASON = TIMESERIES_NO_DATA_REASON

type RequestedItem = TimeseriesRequestedItem<TimeseriesElementItem>

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
  item: Pick<TimeseriesQueryableItem, 'element' | 'level'>,
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

export function resolveTimeseriesItemLevel(
  model: TimeseriesModel,
  item: Pick<TimeseriesQueryableItem, 'element' | 'level'>,
): string {
  if (item.level) {
    return item.level
  }
  return catalogElement(model, item.element ?? '')?.levels?.[0] ?? ''
}

export function formatTimeseriesRuntime(
  runtime: number | null | undefined,
): string | undefined {
  if (runtime == null || !Number.isFinite(runtime)) {
    return undefined
  }
  return (
    new Date(runtime * 1000).toISOString().slice(0, 16).replace('T', ' ') + 'Z'
  )
}

export function partitionTimeseriesGroupItems<T extends TimeseriesQueryableItem>(
  model: TimeseriesModel,
  items: readonly T[] | undefined,
): { available: TimeseriesRequestedItem<T>[]; hidden: TimeseriesHiddenRow[] } {
  const available: TimeseriesRequestedItem<T>[] = []
  const hidden: TimeseriesHiddenRow[] = []

  for (const item of items ?? []) {
    if (!item.element || !isTimeseriesItemAvailable(model, item)) {
      hidden.push({ title: item.title, reason: HIDDEN_REASON })
      continue
    }
    available.push({
      item,
      element: item.element,
      level: resolveTimeseriesItemLevel(model, item),
      unit: item.unit,
    })
  }

  return { available, hidden }
}

function partitionGroupItems(
  model: TimeseriesModel,
  group: TimeseriesElementGroup,
): { available: RequestedItem[]; hidden: TimeseriesHiddenRow[] } {
  return partitionTimeseriesGroupItems(model, group.items)
}

export function normalizeTimeseriesLevel(
  level: string | null | undefined,
): string {
  if (level == null || level === '-' || level === 'null') {
    return ''
  }
  return String(level)
}

export function findTimeseriesSeries(
  elements: TimeseriesPointSeries[],
  element: string,
  level: string,
): TimeseriesPointSeries | undefined {
  const wanted = normalizeTimeseriesLevel(level)
  const exact = elements.find(
    (series) =>
      series.element === element &&
      normalizeTimeseriesLevel(series.level) === wanted,
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
    const series = findTimeseriesSeries(
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
      normalizeTimeseriesLevel(requested.level) ||
      normalizeTimeseriesLevel(series.level)

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
    subtitle: formatTimeseriesRuntime(options.forecast.runtime),
    rows,
    hiddenRows: hiddenRows.length > 0 ? hiddenRows : undefined,
  }
}

export async function fetchTimeseriesPointForecast(options: {
  basePath: string
  lat: number
  lon: number
  model: string
  runtime?: number
  elements: string[]
  levels: string[]
  units?: string[]
  domain?: TimeseriesDomain
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
    `${options.basePath.replace(/\/+$/, '')}/${timeseriesPointPath(options.domain)}?${params.toString()}`,
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
    subtitle: formatTimeseriesRuntime(runtime),
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
  domain?: TimeseriesDomain
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
      fetchTimeseriesPointForecast({
        basePath: options.basePath,
        lat: options.lat,
        lon: options.lon,
        model: options.model.slug,
        runtime,
        elements,
        levels: levelsParam,
        units,
        domain: options.domain,
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
