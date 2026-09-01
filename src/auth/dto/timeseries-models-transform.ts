type UpstreamTimeseriesModel = {
  id?: string
  name?: string
  runtimes?: unknown
  beta?: unknown
  [key: string]: unknown
}

function extractModels(payload: unknown): UpstreamTimeseriesModel[] {
  if (Array.isArray(payload)) {
    return payload as UpstreamTimeseriesModel[]
  }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (Array.isArray(record.models)) {
      return record.models as UpstreamTimeseriesModel[]
    }
    if (record.data && typeof record.data === 'object') {
      const data = record.data as Record<string, unknown>
      if (Array.isArray(data.models)) {
        return data.models as UpstreamTimeseriesModel[]
      }
      if (Array.isArray(record.data)) {
        return record.data as UpstreamTimeseriesModel[]
      }
    }
  }
  return []
}

function toRuntimes(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item))
    .sort((a, b) => b - a)
}

/**
 * Maps the v1 weather timeseries models payload onto the catalog shape
 * Timeseries consumes (`slug`, `title`, `runtimes`, …). Returns a bare array.
 */
export function transformTimeseriesModelsResponse(payload: unknown): unknown {
  return extractModels(payload).map((model, index) => ({
    ...model,
    slug: String(model.id ?? ''),
    title: String(model.name ?? model.id ?? ''),
    runtimes: toRuntimes(model.runtimes),
    available: true,
    isBeta: Boolean(model.beta),
    sort: index,
  }))
}
