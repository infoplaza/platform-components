import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Map, type MapRef } from 'react-map-gl/maplibre'
import type { LngLatBoundsLike, Map as MaplibreMap } from 'maplibre-gl'
import { MAP_STYLES } from '../../config/styles'
import type { MapStyle } from '@/@types/map-style.types'
import {
  PlatformMapContext,
  type PlatformMapStyleVariantName,
} from './map-context'

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

export type PlatformMapLoadPayload = {
  map: MaplibreMap
  bounds: ReturnType<MaplibreMap['getBounds']>
  center: ReturnType<MaplibreMap['getCenter']>
  zoom: number
}

export type PlatformMapProps = {
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
  /**
   * Which style variant to resolve. Defaults to `default`. When omitted,
   * `WeatherLayers` (or other children) may update the variant via context.
   */
  styleVariant?: PlatformMapStyleVariantName
  onLoad?: (payload: PlatformMapLoadPayload) => void
  fitBounds?: LngLatBoundsLike
  fitBoundsOptions?: {
    padding?: number
    maxZoom?: number
    duration?: number
  }
}

const DEFAULT_BEFORE_ID = 'lakes-transparent'

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

function getResolvedMapStyle(
  mapStyle: BaseMapStyle | undefined,
  styleVariant: PlatformMapStyleVariantName,
): MapStyleVariant | undefined {
  const fallbackStyle = mapStyle?.styles?.default

  if (styleVariant === 'marine') {
    return mapStyle?.styles?.marine ?? fallbackStyle
  }

  return fallbackStyle
}

const DEFAULT_FIT_BOUNDS_OPTIONS = {
  padding: 48,
  maxZoom: 12,
  duration: 0,
}

export const PlatformMap = forwardRef<MapRef, PlatformMapProps>(
  function PlatformMap(
    {
      viewState,
      style,
      onMove,
      onClickMap,
      children,
      mapStyle,
      mapStyleKey,
      mapStyles = MAP_STYLES,
      styleVariant: styleVariantProp,
      onLoad,
      fitBounds,
      fitBoundsOptions,
    },
    forwardedRef,
  ) {
    const mapRef = useRef<MapRef | null>(null)
    useImperativeHandle(forwardedRef, () => mapRef.current as MapRef, [])

    const [device, setDevice] = useState<{ ready: boolean; isMobile: boolean }>({
      ready: false,
      isMobile: false,
    })
    const [mapInstance, setMapInstance] = useState<MaplibreMap | null>(null)
    const [uncontrolledVariant, setUncontrolledVariant] =
      useState<PlatformMapStyleVariantName>('default')

    const styleVariant = styleVariantProp ?? uncontrolledVariant
    const setStyleVariant = useCallback((variant: PlatformMapStyleVariantName) => {
      setUncontrolledVariant(variant)
    }, [])

    useIsomorphicLayoutEffect(() => {
      setDevice({ ready: true, isMobile: detectIosAndroidPhoneOrTablet() })
    }, [])

    const selectedMapStyle = getSelectedMapStyle(mapStyles, mapStyleKey, mapStyle)
    const resolvedMapStyle = getResolvedMapStyle(selectedMapStyle, styleVariant)
    const resolvedMapSource = style ?? resolvedMapStyle?.source
    const resolvedBeforeId = resolvedMapStyle?.beforeId ?? DEFAULT_BEFORE_ID

    const applyFitBounds = useCallback(
      (map: MaplibreMap) => {
        if (!fitBounds) {
          return
        }

        map.fitBounds(fitBounds, {
          ...DEFAULT_FIT_BOUNDS_OPTIONS,
          ...fitBoundsOptions,
        })
      },
      [fitBounds, fitBoundsOptions],
    )

    const handleLoad = useCallback(() => {
      const map = mapRef.current?.getMap()
      if (!map) {
        return
      }

      setMapInstance(map)
      applyFitBounds(map)
      onLoad?.({
        map,
        bounds: map.getBounds(),
        center: map.getCenter(),
        zoom: map.getZoom(),
      })
    }, [applyFitBounds, onLoad])

    useEffect(() => {
      if (!mapInstance || !fitBounds) {
        return
      }

      mapInstance.fitBounds(fitBounds, {
        ...DEFAULT_FIT_BOUNDS_OPTIONS,
        duration: 300,
        ...fitBoundsOptions,
      })
    }, [fitBounds, fitBoundsOptions, mapInstance])

    const contextValue = useMemo(
      () => ({
        map: mapInstance,
        beforeId: resolvedBeforeId,
        styleVariant,
        setStyleVariant,
      }),
      [mapInstance, resolvedBeforeId, styleVariant, setStyleVariant],
    )

    if (!device.ready) {
      return null
    }

    const renderedChildren =
      typeof children === 'function'
        ? children({ beforeId: resolvedBeforeId })
        : children

    return (
      <PlatformMapContext.Provider value={contextValue}>
        <Map
          ref={mapRef}
          {...(viewState as object)}
          reuseMaps
          interactive
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
          onMove={onMove}
          onClick={onClickMap}
          onLoad={handleLoad}
          canvasContextAttributes={
            device.isMobile
              ? MOBILE_CANVAS_CONTEXT_ATTRIBUTES
              : DESKTOP_CANVAS_CONTEXT_ATTRIBUTES
          }
          mapStyle={resolvedMapSource as never}
        >
          {renderedChildren}
        </Map>
      </PlatformMapContext.Provider>
    )
  },
)

export default PlatformMap
