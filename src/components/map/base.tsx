import React from 'react'
import { useWeatherMap } from '@/src/providers/weather/weather'
import PlatformMap, {
  type BaseMapStyle,
  type MapStyle,
  type MapStyleVariant,
  type PlatformMapProps,
} from './platform-map'

export type { MapStyle, MapStyleVariant, BaseMapStyle }

const MARINE_CATEGORIES = ['wave', 'ocean']

export type BaseMapProps = Omit<
  PlatformMapProps,
  'styleVariant' | 'onLoad' | 'fitBounds' | 'fitBoundsOptions'
>

function resolveMarineStyleVariant(
  category: string | undefined | null,
): 'default' | 'marine' {
  const normalized = category?.toLowerCase()
  if (normalized && MARINE_CATEGORIES.includes(normalized)) {
    return 'marine'
  }
  return 'default'
}

/**
 * Weather-aware map shell. Must be rendered inside `Providers`. Prefer
 * `PlatformMap` + `WeatherLayers` for new integrations.
 */
export default function BaseMap({
  viewState,
  style,
  onMove,
  onClickMap,
  children,
  mapStyle,
  mapStyleKey,
  mapStyles,
}: BaseMapProps) {
  const { modelInfo } = useWeatherMap()
  const styleVariant = resolveMarineStyleVariant(modelInfo?.category)

  return (
    <PlatformMap
      viewState={viewState}
      style={style}
      onMove={onMove}
      onClickMap={onClickMap}
      mapStyle={mapStyle}
      mapStyleKey={mapStyleKey}
      mapStyles={mapStyles}
      styleVariant={styleVariant}
    >
      {children}
    </PlatformMap>
  )
}
