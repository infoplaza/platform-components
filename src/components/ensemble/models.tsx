import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  EnsembleModel,
  EnsembleModelsContextValue,
  EnsembleModelsProviderProps,
} from './types'

const DEFAULT_BASE_PATH = '/api/platform'

const EnsembleModelsContext =
  createContext<EnsembleModelsContextValue | null>(null)

function extractModels(payload: unknown): EnsembleModel[] {
  if (Array.isArray(payload)) {
    return payload as EnsembleModel[]
  }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (Array.isArray(record.models)) {
      return record.models as EnsembleModel[]
    }
    if (Array.isArray(record.data)) {
      return record.data as EnsembleModel[]
    }
  }
  return []
}

function freezeCatalog(
  models: EnsembleModel[],
): readonly EnsembleModel[] {
  return Object.freeze(
    models.map((model) =>
      Object.freeze({
        ...model,
        runtimes: Object.freeze([...(model.runtimes ?? [])]),
        members: Object.freeze([...(model.members ?? [])]),
      }),
    ),
  )
}

/**
 * Fetches the location-filtered ensemble models catalog and exposes it as a
 * read-only context. There is no setter and no `models` prop override.
 */
export function EnsembleModelsProvider({
  lat,
  lon,
  basePath = DEFAULT_BASE_PATH,
  children,
}: EnsembleModelsProviderProps) {
  const [models, setModels] = useState<readonly EnsembleModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setModels([])
      setLoading(false)
      setError(new Error('lat and lon are required'))
      return
    }

    setLoading(true)
    setError(null)

    const normalizedBase = basePath.replace(/\/+$/, '')
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
    })

    fetch(`${normalizedBase}/ensemble-models?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ensemble models: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        setModels(freezeCatalog(extractModels(data)))
        setLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') {
          return
        }
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [basePath, lat, lon])

  const value = useMemo<EnsembleModelsContextValue>(
    () => ({ models, loading, error, lat, lon, basePath }),
    [basePath, error, lat, loading, lon, models],
  )

  return (
    <EnsembleModelsContext.Provider value={value}>
      {children}
    </EnsembleModelsContext.Provider>
  )
}

export function useEnsembleModelsContext(): EnsembleModelsContextValue | null {
  return useContext(EnsembleModelsContext)
}

export function useEnsembleModels(): EnsembleModelsContextValue {
  const context = useContext(EnsembleModelsContext)
  if (!context) {
    throw new Error(
      'useEnsembleModels must be used within an EnsembleModelsProvider',
    )
  }
  return context
}
