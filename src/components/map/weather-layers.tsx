import React from 'react'
import type { ModelsConfig, WeatherConfig } from '@/@types/weather.types'
import MapEventsProvider, {
  type EventHandlerType,
} from '@/src/events'
import { LayerComposer, LayerOverlay } from '@/src/layers'
import { Providers } from '@/src/providers'
import { MapControlHud, type MapControlHudProps } from '@/src/components/controls/hud'
import { usePlatformMap } from '@/src/providers/map'
import { Layer } from '@deck.gl/core'

const EMPTY_WEATHER_CONFIG: WeatherConfig = {}

export type WeatherLayersProps = {
  /** Initial weather selection. Omitted fields use the packaged defaults. */
  weatherConfig?: WeatherConfig
  modelsConfig?: ModelsConfig
  handler?: EventHandlerType
  interleaved?: boolean
  controller?: boolean
  showHud?: boolean
  hudProps?: MapControlHudProps
  children?: React.ReactNode
  mapIndex?: number
}

/**
 * Packaged weather layer stack for use under `PlatformMap`.
 * Mounts Providers, map events, Deck.gl overlay, and optionally the control HUD.
 */
export function WeatherLayers({
  weatherConfig = EMPTY_WEATHER_CONFIG,
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

  return (
    <Providers
      weatherConfig={weatherConfig}
      modelsConfig={modelsConfig}
      mapIndex={mapIndex}
    >
      <MapEventsProvider handler={handler}>
        {(mapComponents) => (
          <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
            {({ layers }: { layers: Layer[] }) => (
              <LayerOverlay
                layers={[...layers]}
                interleaved={interleaved}
                controller={controller}
                beforeId={beforeId}
              />
            )}
          </LayerComposer>
        )}
      </MapEventsProvider>
      {showHud ? <MapControlHud {...hudProps} /> : null}
      {children}
    </Providers>
  )
}

export default WeatherLayers
