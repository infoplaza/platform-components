import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import type { WeatherConfig } from '@/@types/weather.types'
import { LegendValuesProvider, useLegendValues } from '@/src/providers/legend/legend'
import { LayerSettingsProvider, useLayerSettings } from '@/src/providers/settings/layer-settings'
import { MapIndexProvider, useMapIndex } from '@/src/providers/timestamps/timestamp'
import { WeatherMapProvider, useWeatherMap } from '@/src/providers/weather/weather'
import { store, TimestampProvider } from '@/src/redux/timestamps'

interface ProvidersProps {
  children: React.ReactNode
  weatherConfig: WeatherConfig
  mapIndex?: number
}

/**
 * Composes all provider contexts used by the map stack.
 */
export function Providers({ children, weatherConfig, mapIndex = 0 }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <MapIndexProvider value={mapIndex}>
        <LegendValuesProvider>
          <LayerSettingsProvider>
            <WeatherMapProvider {...weatherConfig}>
              <TimestampProvider>
                {children}
              </TimestampProvider>
            </WeatherMapProvider>
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
    weather: useWeatherMap(),
    legend: useLegendValues(),
    layerSettings: useLayerSettings(),
  }
}
