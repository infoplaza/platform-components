import {
  TIMESERIES_CELL_COLOR_FALLBACK,
  colorForValue,
  type TimeseriesCellColor,
} from './timeseries-cell-color'

export type TimeseriesPointTransformContext = {
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
  palette?: unknown
  pallete?: unknown
}

type TransformedPointCell = {
  timestamp: number
  value: number | null
  color: TimeseriesCellColor
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

function extractPalette(element: unknown): Palette | null {
  const record = asRecord(element)
  const palette = asRecord(record?.palette) ?? asRecord(record?.pallete)
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
      color,
    }
  })
}

/**
 * Maps the v1 weather timeseries point payload onto colored cells the
 * timeseries table can render. Palettes come from each element's
 * `palette` / `pallete` (`colors` + `values`).
 */
export function transformTimeseriesPointForecastResponse(
  payload: unknown,
  context: TimeseriesPointTransformContext,
): unknown {
  const record = extractPointForecastRecord(payload)
  if (!record) {
    return payload
  }

  const elements = Array.isArray(record.elements)
    ? (record.elements as UpstreamPointElement[])
    : []

  return {
    model: asString(record.model) || context.model,
    runtime: asNumber(record.runtime),
    latitude: asNumber(record.latitude) ?? context.lat,
    longitude: asNumber(record.longitude) ?? context.lon,
    elements: elements.map((entry) => ({
      element: asString(entry.element),
      level: asString(entry.level),
      unit: asString(entry.unit),
      data: transformCells(entry.data, extractPalette(entry)),
    })),
  }
}
