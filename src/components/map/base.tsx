import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Map } from 'react-map-gl/maplibre'
import { MAP_STYLES } from '../../config/styles'
import type { MapStyle } from '@/@types/map-style.types'

export type { MapStyle }

export type MapStyleVariant = {
  source?: string | object | null
  beforeId?: string
}

export type BaseMapStyle = {
  styles?: {
    default?: MapStyleVariant
    marine?: MapStyleVariant
  }
}

export type BaseMapModelInfo = {
  description?: {
    category?: string
  }
}

export type BaseMapProps = {
  viewState: Record<string, unknown>
  style?: string | object | null
  onMove?: (event: unknown) => void
  onClickMap?: (event: unknown) => void
  children?: React.ReactNode | ((props: { beforeId: string }) => React.ReactNode)
  /**
   * Explicit style object. When provided it takes precedence over `mapStyleKey`
   * and is used as-is. Mostly kept for backwards compatibility.
   */
  mapStyle?: BaseMapStyle
  /**
   * Key of the style to select from `mapStyles` (e.g. 'dark', 'land', 'sea').
   */
  mapStyleKey?: string
  /**
   * Available styling options to choose from. Defaults to the built-in
   * `MAP_STYLES`. Pass an extended list to add your own options, e.g.
   * `mapStyles={[...MAP_STYLES, myCustomStyle]}`.
   */
  mapStyles?: MapStyle[]
  modelInfo?: BaseMapModelInfo
}

const marineStyles = ['wave', 'ocean']

const DESKTOP_CANVAS_CONTEXT_ATTRIBUTES = {
  antialias: true,
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance' as const,
  failIfMajorPerformanceCaveat: false,
  desynchronized: false,
  contextType: undefined,
}

const MOBILE_CANVAS_CONTEXT_ATTRIBUTES = {
  antialias: false,
  preserveDrawingBuffer: false,
  powerPreference: 'low-power' as const,
  failIfMajorPerformanceCaveat: false,
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function detectIosAndroidPhoneOrTablet() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /(android|iphone|ipad|ipod)/i.test(navigator.userAgent)
}

function getSelectedMapStyle(
  mapStyles: MapStyle[],
  mapStyleKey?: string,
  mapStyle?: BaseMapStyle,
): BaseMapStyle | undefined {
  if (mapStyle) {
    return mapStyle
  }

  if (mapStyleKey) {
    const matched = mapStyles.find((option) => option.key === mapStyleKey)
    if (matched) {
      return matched
    }
  }

  return mapStyles[0]
}

function getResolvedMapStyle(mapStyle?: BaseMapStyle, modelInfo?: BaseMapModelInfo) {
  const category = modelInfo?.description?.category?.toLowerCase()
  const isMarineModel = category ? marineStyles.includes(category) : false
  const fallbackStyle = mapStyle?.styles?.default

  if (isMarineModel) {
    return mapStyle?.styles?.marine ?? fallbackStyle
  }

  return fallbackStyle
}

export default function BaseMap({
  viewState,
  style,
  onMove,
  onClickMap,
  children,
  mapStyle,
  mapStyleKey,
  mapStyles = MAP_STYLES,
  modelInfo,
}: BaseMapProps) {
  const [device, setDevice] = useState<{ ready: boolean; isMobile: boolean }>({
    ready: false,
    isMobile: false,
  })

  useIsomorphicLayoutEffect(() => {
    setDevice({ ready: true, isMobile: detectIosAndroidPhoneOrTablet() })
  }, [])

  const selectedMapStyle = getSelectedMapStyle(mapStyles, mapStyleKey, mapStyle)
  const resolvedMapStyle = getResolvedMapStyle(selectedMapStyle, modelInfo)
  const resolvedMapSource = style ?? resolvedMapStyle?.source
  const resolvedBeforeId = resolvedMapStyle?.beforeId ?? 'lakes-transparent'

  if (!device.ready) {
    return null
  }

  return (
    <Map
      {...(viewState as object)}
      reuseMaps
      interactive
      style={{ width: '100%', height: '100%' }}
      attributionControl={false}
      onMove={onMove}
      onClick={onClickMap}
      canvasContextAttributes={
        device.isMobile
          ? MOBILE_CANVAS_CONTEXT_ATTRIBUTES
          : DESKTOP_CANVAS_CONTEXT_ATTRIBUTES
      }
      mapStyle={resolvedMapSource as never}
    >
      {typeof children === 'function'
        ? children({ beforeId: resolvedBeforeId })
        : children}
    </Map>
  )
}
