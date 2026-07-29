import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ModelInfo, ModelsConfig, ModelsContextValue } from '@/@types/weather.types'

const DEFAULT_BASE_PATH = '/api/platform'
const DEFAULT_API_ENV: NonNullable<ModelsConfig['apiEnv']> = 'prod'

export const ModelsContext = createContext<ModelsContextValue | null>(null)

/**
 * Extracts the model list from the `/models` payload, tolerating the shapes the
 * upstream/auth layer can return (`{ data: { models } }`, `{ data: [...] }` or
 * `{ models: [...] }`).
 */
function extractModels(payload: any): ModelInfo[] {
  if (Array.isArray(payload?.data?.models)) return payload.data.models
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.models)) return payload.models
  return payload
}

/**
 * Fetches the available weather models once and exposes them through context, so
 * consumers no longer have to perform this request themselves on the client.
 */
export const ModelsProvider: React.FC<ModelsConfig & { children: React.ReactNode }> = ({
  apiEnv = DEFAULT_API_ENV,
  betaModels = false,
  basePath = DEFAULT_BASE_PATH,
  children,
}) => {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    const normalizedBase = basePath.replace(/\/+$/, '')
    const params = new URLSearchParams({
      apiEnv,
      betaModels: String(betaModels),
    })

    fetch(`${normalizedBase}/models?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`)
        }

        return response.json()
      })
      .then((data) => {
        setModels(extractModels(data))
        setLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') {
          return
        }

        console.error('Unable to load models', err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [apiEnv, betaModels, basePath])

  const value = useMemo<ModelsContextValue>(
    () => ({ models, loading, error }),
    [models, loading, error],
  )

  return <ModelsContext.Provider value={value}>{children}</ModelsContext.Provider>
}

/**
 * Returns the models context value, or `null` when used outside of a
 * `ModelsProvider`. Useful for components that can operate without the provider.
 */
export function useModelsContext(): ModelsContextValue | null {
  return useContext(ModelsContext)
}

/**
 * Consumes the models context. Throws when used outside of a `ModelsProvider`.
 */
export function useModels(): ModelsContextValue {
  const context = useContext(ModelsContext)
  if (!context) {
    throw new Error('useModels must be used within a ModelsProvider')
  }

  return context
}
