import { createContext, useContext } from 'react'
import type { Map as MaplibreMap } from 'maplibre-gl'

export type PlatformMapStyleVariantName = 'default' | 'marine'

export type PlatformMapContextValue = {
  map: MaplibreMap | null
  beforeId: string
  styleVariant: PlatformMapStyleVariantName
  setStyleVariant: (variant: PlatformMapStyleVariantName) => void
}

export const PlatformMapContext = createContext<PlatformMapContextValue | null>(null)

export function usePlatformMapContext(): PlatformMapContextValue | null {
  return useContext(PlatformMapContext)
}

export function usePlatformMap(): PlatformMapContextValue {
  const value = useContext(PlatformMapContext)
  if (!value) {
    throw new Error('usePlatformMap must be used within a PlatformMap')
  }
  return value
}
