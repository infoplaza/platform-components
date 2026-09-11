import React, { useEffect } from 'react'
import type { ModelsConfig, WeatherConfig } from '@/@types/weather.types'
import MapEventsProvider, {
  type EventHandlerType,
} from '@/src/events'
import LayerComposer from '@/src/layers/composer'
import Overlay from '@/src/layers/overlay'
import { Providers } from '@/src/providers'
import { useWeatherMap } from '@/src/providers/weather/weather'
import { MapControlHud, type MapControlHudProps } from '@/src/components/controls/hud'
import { usePlatformMap } from './map-context'

const MARINE_CATEGORIES = ['wave', 'ocean']

const DEFAULT_HUD_PROPS: MapControlHudProps = {
  mapIndex: 0,
  mapsLength: 1,
  isMultipleMapView: false,
  onMapsCount: () => {},
  onExportChange: () => {},
  mapRef: null,
  viewState: {},
}

export type WeatherLayersProps = {
  weatherConfig: WeatherConfig
  modelsConfig?: ModelsConfig
  handler?: EventHandlerType
  interleaved?: boolean
  controller?: boolean
  showHud?: boolean
  hudProps?: Partial<MapControlHudProps>
  children?: React.ReactNode
  mapIndex?: number
}

function MarineStyleSync() {
  const { modelInfo } = useWeatherMap()
  const { setStyleVariant } = usePlatformMap()

  useEffect(() => {
    const category = modelInfo?.category?.toLowerCase()
    const isMarine = Boolean(
      category && MARINE_CATEGORIES.includes(category),
    )
    setStyleVariant(isMarine ? 'marine' : 'default')
  }, [modelInfo?.category, setStyleVariant])

  return null
}

/**
 * Packaged weather layer stack for use under `PlatformMap`.
 * Mounts Providers, map events, Deck.gl overlay, and optionally the control HUD.
 */
export function WeatherLayers({
  weatherConfig,
  modelsConfig,
  handler,
  interleaved = true,
  controller = true,
  showHud = false,
  hudProps,
  children,
  mapIndex = 0,
}: WeatherLayersProps) {
  const { beforeId } = usePlatformMap()
  const resolvedHudProps: MapControlHudProps = {
    ...DEFAULT_HUD_PROPS,
    ...hudProps,
  }

  return (
    <Providers
      weatherConfig={weatherConfig}
      modelsConfig={modelsConfig}
      mapIndex={mapIndex}
    >
      <MarineStyleSync />
      <MapEventsProvider handler={handler}>
        {(mapComponents) => (
          <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
            {({ layers }) => (
              <Overlay
                layers={[...layers]}
                interleaved={interleaved}
                controller={controller}
              />
            )}
          </LayerComposer>
        )}
      </MapEventsProvider>
      {showHud ? <MapControlHud {...resolvedHudProps} /> : null}
      {children}
    </Providers>
  )
}

export default WeatherLayers
