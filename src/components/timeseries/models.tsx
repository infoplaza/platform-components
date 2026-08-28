import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  TimeseriesModel,
  TimeseriesModelsContextValue,
  TimeseriesModelsProviderProps,
} from './types'

const DEFAULT_BASE_PATH = '/api/platform'

const TimeseriesModelsContext =
  createContext<TimeseriesModelsContextValue | null>(null)

function extractModels(payload: unknown): TimeseriesModel[] {
  if (Array.isArray(payload)) {
    return payload as TimeseriesModel[]
  }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (Array.isArray(record.models)) {
      return record.models as TimeseriesModel[]
    }
    if (Array.isArray(record.data)) {
      return record.data as TimeseriesModel[]
    }
  }
  return []
}

function freezeCatalog(
  models: TimeseriesModel[],
): readonly TimeseriesModel[] {
  return Object.freeze(
    models.map((model) =>
      Object.freeze({
        ...model,
        runtimes: Object.freeze([...(model.runtimes ?? [])]),
      }),
    ),
  )
}

/**
 * Fetches the location-filtered timeseries models catalog and exposes it as a
 * read-only context. There is no setter and no `models` prop override.
 */
export function TimeseriesModelsProvider({
  lat,
  lon,
  basePath = DEFAULT_BASE_PATH,
  children,
}: TimeseriesModelsProviderProps) {
  const [models, setModels] = useState<readonly TimeseriesModel[]>([])
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

    fetch(`${normalizedBase}/timeseries-models?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch timeseries models: ${response.status}`)
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

  const value = useMemo<TimeseriesModelsContextValue>(
    () => ({ models, loading, error }),
    [error, loading, models],
  )

  return (
    <TimeseriesModelsContext.Provider value={value}>
      {children}
    </TimeseriesModelsContext.Provider>
  )
}

export function useTimeseriesModelsContext(): TimeseriesModelsContextValue | null {
  return useContext(TimeseriesModelsContext)
}

export function useTimeseriesModels(): TimeseriesModelsContextValue {
  const context = useContext(TimeseriesModelsContext)
  if (!context) {
    throw new Error(
      'useTimeseriesModels must be used within a TimeseriesModelsProvider',
    )
  }
  return context
}
