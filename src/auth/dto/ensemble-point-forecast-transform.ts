export type EnsemblePointTransformContext = {
  lat: number
  lon: number
  model: string
  runtime?: string
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

function transformMembers(value: unknown): Record<string, number | null> {
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

function transformData(
  data: unknown,
): { time: number; value: Record<string, number | null> }[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map((entry: UpstreamPointDatum) => ({
    time: asNumber(entry?.time) ?? asNumber(entry?.timestamp) ?? 0,
    value: transformMembers(entry?.value),
  }))
}

/**
 * Maps the v1 weather ensemble point payload onto a stable shape: model,
 * runtime, coordinates, and elements whose `data[].value` is a member map.
 */
export function transformEnsemblePointForecastResponse(
  payload: unknown,
  context: EnsemblePointTransformContext,
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
      data: transformData(entry.data),
    })),
  }
}
