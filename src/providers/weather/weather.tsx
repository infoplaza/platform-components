import React, { createContext, useContext, useMemo } from 'react'
import { resolveAvailableModel } from '@/src/providers/weather/utils'
import { useWeatherElements, useWeatherLayers, useWeatherModels, useWeatherState, useWeatherSuggestions } from '@/src/providers/weather/hooks'
import { useModelsContext } from '@/src/providers/models/models'
import type { WeatherConfig, WeatherContextValue } from '@/@types/weather.types'

export const WeatherMapContext = createContext<WeatherContextValue | null>(null)

export const WeatherMapProvider: React.FC<WeatherConfig> = ({ children, ...config }) => {
  const modelsContext = useModelsContext()
  // Models are now fetched internally by the `ModelsProvider`. A `models` value
  // passed through the config still takes precedence for backwards compatibility.
  const models = useMemo(
    () => config.models ?? modelsContext?.models ?? [],
    [config.models, modelsContext?.models],
  )

  const weatherState = useWeatherState(config)
  const { modelInfo: selectedModelInfo } = useWeatherModels(
    models,
    weatherState.model,
  )
  const modelInfo = useMemo(() => {
    return resolveAvailableModel(models, weatherState.model)
  }, [models, weatherState.model])
  const { elementInfo } = useWeatherElements(modelInfo, weatherState.element)

  const suggestions = useWeatherSuggestions(
    modelInfo,
    elementInfo,
    weatherState.modelRun,
    weatherState.modelMember,
    weatherState.modelLevel,
  )

  const hideLayers = useMemo(() => config.hideLayers ?? [], [config.hideLayers])

  const { layersInfo } = useWeatherLayers(
    config,
    elementInfo,
    hideLayers,
    suggestions.suggestedModelRun,
    suggestions.suggestedModelMember,
    suggestions.suggestedModelLevel,
  )

  const state = useMemo(
    (): WeatherContextValue => ({
      ...weatherState,
      models,
      modelInfo,
      selectedModelInfo,
      elementInfo,
      layersInfo,
      hideLayers,
    }),
    [
      weatherState.element,
      weatherState.model,
      weatherState.modelRun,
      weatherState.modelMember,
      weatherState.modelLevel,
      weatherState.month,
      weatherState.period,
      weatherState.mapState,
      models,
      modelInfo,
      selectedModelInfo,
      elementInfo,
      layersInfo,
      hideLayers,
    ],
  )

  return (
    <WeatherMapContext.Provider value={state}>
      {children}
    </WeatherMapContext.Provider>
  )
}

export function useWeatherMap(): WeatherContextValue {
  const context = useContext(WeatherMapContext)
  if (!context) {
    throw new Error('useWeatherMap must be used within a WeatherMapProvider')
  }

  return context
}
