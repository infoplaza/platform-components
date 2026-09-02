type UpstreamEnsembleModel = {
  id?: string
  name?: string
  runtimes?: unknown
  beta?: unknown
  [key: string]: unknown
}

function extractModels(payload: unknown): UpstreamEnsembleModel[] {
  if (Array.isArray(payload)) {
    return payload as UpstreamEnsembleModel[]
  }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (Array.isArray(record.models)) {
      return record.models as UpstreamEnsembleModel[]
    }
    if (record.data && typeof record.data === 'object') {
      const data = record.data as Record<string, unknown>
      if (Array.isArray(data.models)) {
        return data.models as UpstreamEnsembleModel[]
      }
      if (Array.isArray(record.data)) {
        return record.data as UpstreamEnsembleModel[]
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
 * Maps the v1 weather ensemble models payload onto the catalog shape
 * (`slug`, `title`, `runtimes`, …). Returns a bare array.
 */
export function transformEnsembleModelsResponse(payload: unknown): unknown {
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
