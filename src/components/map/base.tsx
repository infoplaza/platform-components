import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Map } from 'react-map-gl/maplibre'

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
  mapStyle?: BaseMapStyle
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
  modelInfo,
}: BaseMapProps) {
  const [device, setDevice] = useState<{ ready: boolean; isMobile: boolean }>({
    ready: false,
    isMobile: false,
  })

  useIsomorphicLayoutEffect(() => {
    setDevice({ ready: true, isMobile: detectIosAndroidPhoneOrTablet() })
  }, [])

  const resolvedMapStyle = getResolvedMapStyle(mapStyle, modelInfo)
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
