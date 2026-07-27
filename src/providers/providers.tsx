import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import type { ModelsConfig, WeatherConfig } from '@/@types/weather.types'
import { LegendValuesProvider, useLegendValues } from '@/src/providers/legend/legend'
import { ModelsProvider, useModels } from '@/src/providers/models/models'
import { LayerSettingsProvider, useLayerSettings } from '@/src/providers/settings/layer-settings'
import { MapIndexProvider, useMapIndex } from '@/src/providers/timestamps/timestamp'
import { WeatherMapProvider, useWeatherMap } from '@/src/providers/weather/weather'
import { store, TimestampProvider } from '@/src/redux/timestamps'

interface ProvidersProps {
  children: React.ReactNode
  weatherConfig: WeatherConfig
  /**
   * Optional configuration for the internal models request. The models are
   * fetched by the `ModelsProvider`, so consumers no longer need to fetch and
   * pass them through `weatherConfig`.
   */
  modelsConfig?: ModelsConfig
  mapIndex?: number
}

/**
 * Composes all provider contexts used by the map stack.
 */
export function Providers({ children, weatherConfig, modelsConfig, mapIndex = 0 }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <MapIndexProvider value={mapIndex}>
        <LegendValuesProvider>
          <LayerSettingsProvider>
            <ModelsProvider {...modelsConfig}>
              <WeatherMapProvider {...weatherConfig}>
                <TimestampProvider>
                  {children}
                </TimestampProvider>
              </WeatherMapProvider>
            </ModelsProvider>
          </LayerSettingsProvider>
        </LegendValuesProvider>
      </MapIndexProvider>
    </ReduxProvider>
  )
}

/**
 * Convenience hook that consumes all provider values at once.
 */
export function useProviders() {
  return {
    mapIndex: useMapIndex(),
    models: useModels(),
    weather: useWeatherMap(),
    legend: useLegendValues(),
    layerSettings: useLayerSettings(),
  }
}
