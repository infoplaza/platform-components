import React, { useEffect } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import type { ModelsConfig, WeatherConfig } from '@/@types/weather.types'
import { LegendValuesProvider, useLegendValues } from '@/src/providers/legend/legend'
import { ModelsProvider, useModels } from '@/src/providers/models/models'
import { DisplaySettingsProvider, useDisplaySettings } from '@/src/providers/settings/display-settings'
import { LayerSettingsProvider, useLayerSettings } from '@/src/providers/settings/layer-settings'
import { MapIndexProvider, useMapIndex } from '@/src/providers/timestamps/timestamp'
import { WeatherMapProvider, useWeatherMap } from '@/src/providers/weather/weather'
import { usePlatformMapContext } from '@/src/providers/map'
import { store, TimestampProvider } from '@/src/redux/timestamps'

const EMPTY_WEATHER_CONFIG: WeatherConfig = {}
const MARINE_CATEGORIES = ['wave', 'ocean']

/**
 * When `Providers` is mounted under `PlatformMap`, switch the basemap to the
 * marine variant for wave/ocean models. No-ops when there is no map context
 * (e.g. the older `Providers` → `BaseMap` tree, where `BaseMap` handles this).
 */
function MarineStyleSync() {
  const { modelInfo } = useWeatherMap()
  const setStyleVariant = usePlatformMapContext()?.setStyleVariant

  useEffect(() => {
    if (!setStyleVariant) {
      return
    }

    const category = modelInfo?.category?.toLowerCase()
    const isMarine = Boolean(category && MARINE_CATEGORIES.includes(category))
    setStyleVariant(isMarine ? 'marine' : 'default')
  }, [modelInfo?.category, setStyleVariant])

  return null
}

interface ProvidersProps {
  children: React.ReactNode
  /**
   * Initial weather selection. All fields are optional; omitted values fall
   * back to `gfs` / `temperature` / `latest` (member and level are inferred).
   */
  weatherConfig?: WeatherConfig
  /**
   * Optional configuration for the internal models request (`basePath`).
   * Models are fetched by `ModelsProvider`, so consumers no longer need to
   * fetch and pass them through `weatherConfig`.
   */
  modelsConfig?: ModelsConfig
  mapIndex?: number
}

/**
 * Composes all provider contexts used by the map stack.
 */
export function Providers({ children, weatherConfig = EMPTY_WEATHER_CONFIG, modelsConfig, mapIndex = 0 }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <MapIndexProvider value={mapIndex}>
        <LegendValuesProvider>
          <DisplaySettingsProvider>
            <LayerSettingsProvider>
              <ModelsProvider {...modelsConfig}>
                <WeatherMapProvider {...weatherConfig}>
                  <TimestampProvider>
                    <MarineStyleSync />
                    {children}
                  </TimestampProvider>
                </WeatherMapProvider>
              </ModelsProvider>
            </LayerSettingsProvider>
          </DisplaySettingsProvider>
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
    displaySettings: useDisplaySettings(),
  }
}
