import {
  TIMESERIES_CELL_COLOR_FALLBACK,
  colorForValue,
  type TimeseriesCellColor,
} from './timeseries-cell-color'

export type TimeseriesPointTransformContext = {
  mapsBaseUrl: string
  apiKey: string
  lat: number
  lon: number
  model: string
  runtime?: string
}

type Palette = {
  colors: string[]
  values: (number | null)[]
}

type UpstreamPointDatum = {
  time?: unknown
  timestamp?: unknown
  value?: unknown
}

type UpstreamPointElement = {
  element?: unknown
  level?: unknown
  unit?: unknown
  data?: unknown
}

type TransformedPointCell = TimeseriesCellColor & {
  timestamp: number
  value: number | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function asString(value: unknown): string {
  return value == null ? '' : String(value)
}

function asNumber(value: unknown): number | null {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function toPaletteValues(value: unknown): (number | null)[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map((entry) => {
    if (entry == null || entry === '') {
      return null
    }
    const numeric = Number(entry)
    return Number.isFinite(numeric) ? numeric : null
  })
}

function toPaletteColors(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter((entry): entry is string => typeof entry === 'string')
}

function extractPointForecastRecord(
  payload: unknown,
): Record<string, unknown> | null {
  const record = asRecord(payload)
  if (!record) {
    return null
  }
  if (Array.isArray(record.elements)) {
    return record
  }
  const nested = asRecord(record.data)
  if (nested && Array.isArray(nested.elements)) {
    return nested
  }
  return null
}

function extractPalette(payload: unknown): Palette | null {
  const record = asRecord(payload)
  const palette = asRecord(record?.palette)
  if (!palette) {
    return null
  }

  const colors = toPaletteColors(palette.colors)
  const values = toPaletteValues(palette.values)
  if (colors.length === 0 || values.length === 0) {
    return null
  }

  return { colors, values }
}

function clampLat(value: number): number {
  return Math.min(90, Math.max(-90, value))
}

function clampLon(value: number): number {
  return Math.min(180, Math.max(-180, value))
}

async function fetchElementPalette(
  context: TimeseriesPointTransformContext,
  element: string,
  run: string,
): Promise<Palette | null> {
  const base = context.mapsBaseUrl.replace(/\/+$/, '')
  const target = new URL(`${base}/layers`)
  target.searchParams.set('model', context.model)
  target.searchParams.set('run', run)
  target.searchParams.set('element', element)
  target.searchParams.set('zoom', '3')
  target.searchParams.set('north', String(clampLat(context.lat + 0.5)))
  target.searchParams.set('south', String(clampLat(context.lat - 0.5)))
  target.searchParams.set('east', String(clampLon(context.lon + 0.5)))
  target.searchParams.set('west', String(clampLon(context.lon - 0.5)))
  target.searchParams.set('api_key', context.apiKey)

  try {
    const response = await fetch(target.toString())
    if (!response.ok) {
      return null
    }
    return extractPalette(await response.json())
  } catch {
    return null
  }
}

async function loadPalettesByElement(
  payload: Record<string, unknown>,
  context: TimeseriesPointTransformContext,
): Promise<Map<string, Palette | null>> {
  const elements = Array.isArray(payload.elements) ? payload.elements : []
  const unique = [
    ...new Set(
      elements
        .map((entry) => asString(asRecord(entry)?.element))
        .filter(Boolean),
    ),
  ]

  const run =
    asString(payload.runtime) ||
    context.runtime ||
    'latest'

  const entries = await Promise.all(
    unique.map(async (element) => {
      const palette = await fetchElementPalette(context, element, run)
      return [element, palette] as const
    }),
  )

  return new Map(entries)
}

function transformCells(
  data: unknown,
  palette: Palette | null,
): TransformedPointCell[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map((entry: UpstreamPointDatum) => {
    const timestamp = asNumber(entry?.time) ?? asNumber(entry?.timestamp) ?? 0
    const raw = entry?.value
    const value =
      raw == null || raw === ''
        ? null
        : Number.isFinite(Number(raw))
          ? Number(raw)
          : null
    const color = palette
      ? colorForValue(value, palette.colors, palette.values)
      : TIMESERIES_CELL_COLOR_FALLBACK

    return {
      timestamp,
      value,
      im_color: color.im_color,
      im_textcolor: color.im_textcolor,
    }
  })
}

/**
 * Maps the v1 weather timeseries point payload onto colored cells the
 * timeseries table can render. Palettes come from maps layers for the same
 * model + element.
 */
export async function transformTimeseriesPointForecastResponse(
  payload: unknown,
  context: TimeseriesPointTransformContext,
): Promise<unknown> {
  const record = extractPointForecastRecord(payload)
  if (!record) {
    return payload
  }

  const palettes = await loadPalettesByElement(
    {
      ...record,
      runtime: record.runtime ?? context.runtime,
    },
    {
      ...context,
      model: asString(record.model) || context.model,
      lat: asNumber(record.latitude) ?? context.lat,
      lon: asNumber(record.longitude) ?? context.lon,
    },
  )

  const elements = Array.isArray(record.elements)
    ? (record.elements as UpstreamPointElement[])
    : []

  return {
    model: asString(record.model) || context.model,
    runtime: asNumber(record.runtime),
    latitude: asNumber(record.latitude) ?? context.lat,
    longitude: asNumber(record.longitude) ?? context.lon,
    elements: elements.map((entry) => {
      const element = asString(entry.element)
      return {
        element,
        level: asString(entry.level),
        unit: asString(entry.unit),
        data: transformCells(entry.data, palettes.get(element) ?? null),
      }
    }),
  }
}
