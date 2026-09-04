type UpstreamEnsembleModel = {
  id?: string
  name?: string
  runtimes?: unknown
  members?: unknown
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

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map((item) => String(item)).filter((item) => item.length > 0)
}

/**
 * Upstream members may be a flat list or a map keyed by runtime.
 * Prefer the latest runtime when the payload is keyed.
 */
function toMembers(value: unknown, runtimes: number[]): string[] {
  const fromArray = toStringList(value)
  if (fromArray.length > 0) {
    return fromArray
  }
  if (!value || typeof value !== 'object') {
    return []
  }
  const record = value as Record<string, unknown>
  for (const runtime of runtimes) {
    const atRuntime = record[String(runtime)] ?? record[runtime as unknown as string]
    const list = toStringList(atRuntime)
    if (list.length > 0) {
      return list
    }
  }
  for (const item of Object.values(record)) {
    const list = toStringList(item)
    if (list.length > 0) {
      return list
    }
  }
  return []
}

/**
 * Maps the v1 weather ensemble models payload onto the catalog shape
 * (`slug`, `title`, `runtimes`, `members`, …). Returns a bare array.
 */
export function transformEnsembleModelsResponse(payload: unknown): unknown {
  return extractModels(payload).map((model, index) => {
    const runtimes = toRuntimes(model.runtimes)
    return {
      ...model,
      slug: String(model.id ?? ''),
      title: String(model.name ?? model.id ?? ''),
      runtimes,
      members: toMembers(model.members, runtimes),
      available: true,
      isBeta: Boolean(model.beta),
      sort: index,
    }
  })
}

