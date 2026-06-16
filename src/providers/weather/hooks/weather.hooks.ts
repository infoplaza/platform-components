import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_WEATHER_CONFIG } from '@/src/providers/weather/config'
import {
  buildUnit,
  createLayerId,
  findElementInfo,
  suggestModelLevel,
  suggestModelMember,
  suggestModelRun,
} from '@/src/providers/weather/weather.utils'
import type {
  ElementInfo,
  ModelInfo,
  WeatherConfig,
  WeatherLayersInfo,
  WeatherState,
  WeatherSuggestions,
} from '@/@types/weather.types'

const DEFAULT_GET_UNIT = (key: string) => ({ value: key })

export const useWeatherState = (
  config: WeatherConfig,
): WeatherState & {
  setElement: (element: string) => void
  setModel: (model: string) => void
  setModelRun: (run: string) => void
  setModelMember: (member: string | null) => void
  setModelLevel: (level: string | null) => void
  setMonth: (month: string | null) => void
  setPeriod: (period: string | null) => void
  setMapState: (state: unknown | null) => void
} => {
  const [element, setElement] = useState(
    config.element ?? DEFAULT_WEATHER_CONFIG.element,
  )
  const [model, setModel] = useState(config.model ?? DEFAULT_WEATHER_CONFIG.model)
  const [modelRun, setModelRun] = useState(config.run ?? DEFAULT_WEATHER_CONFIG.run)
  const [modelMember, setModelMember] = useState<string | null>(
    config.member ?? DEFAULT_WEATHER_CONFIG.member,
  )
  const [modelLevel, setModelLevel] = useState<string | null>(
    config.level ?? DEFAULT_WEATHER_CONFIG.level,
  )
  const [month, setMonth] = useState<string | null>(null)
  const [period, setPeriod] = useState<string | null>(null)
  const [mapState, setMapState] = useState<unknown | null>(null)

  useEffect(() => {
    if (model !== config.model) {
      setModel(config.model ?? DEFAULT_WEATHER_CONFIG.model)
    }
    if (element !== config.element) {
      setElement(config.element ?? DEFAULT_WEATHER_CONFIG.element)
    }
    if (modelRun !== config.run) {
      setModelRun(config.run ?? DEFAULT_WEATHER_CONFIG.run)
    }
    if (modelMember !== config.member) {
      setModelMember(config.member ?? DEFAULT_WEATHER_CONFIG.member)
    }
    if (modelLevel !== config.level) {
      setModelLevel(config.level ?? DEFAULT_WEATHER_CONFIG.level)
    }
  }, [config.model, config.element, config.run, config.member, config.level])

  return {
    element,
    setElement,
    model,
    setModel,
    modelRun,
    setModelRun,
    modelMember,
    setModelMember,
    modelLevel,
    setModelLevel,
    month,
    setMonth,
    period,
    setPeriod,
    mapState,
    setMapState,
  }
}

export const useWeatherModels = (models: ModelInfo[] | undefined, model: string) => {
  const modelInfo = useMemo((): ModelInfo | null => {
    return (models ?? []).find((item) => item.slug === model) ?? null
  }, [model, models])

  return { modelInfo }
}

export const useWeatherElements = (modelInfo: ModelInfo | null, element: string) => {
  const elementInfo = useMemo((): ElementInfo | null => {
    return findElementInfo(modelInfo, element)
  }, [modelInfo, element])

  return { elementInfo }
}

export const useWeatherSuggestions = (
  modelInfo: ModelInfo | null,
  elementInfo: ElementInfo | null,
  modelRun: string,
  modelMember: string | null,
  modelLevel: string | null,
): WeatherSuggestions => {
  const suggestedModelRun = useMemo((): string => {
    return suggestModelRun(modelInfo, modelRun)
  }, [modelInfo, modelRun])

  const suggestedModelMember = useMemo((): string => {
    return suggestModelMember(modelInfo, modelMember)
  }, [modelInfo, modelMember])

  const suggestedModelLevel = useMemo((): string => {
    return suggestModelLevel(elementInfo, modelLevel)
  }, [elementInfo, modelLevel])

  return { suggestedModelRun, suggestedModelMember, suggestedModelLevel }
}

export const useWeatherLayers = (
  config: WeatherConfig,
  elementInfo: ElementInfo | null,
  hideLayers: string[],
  suggestedModelRun: string,
  suggestedModelMember: string,
  suggestedModelLevel: string,
) => {
  const getUnit = config.getUnit ?? DEFAULT_GET_UNIT
  const connections = config.connections ?? {}

  const layersInfo = useMemo((): WeatherLayersInfo | null => {
    if (!elementInfo?.layers) {
      return null
    }

    const info: WeatherLayersInfo = {
      run: suggestedModelRun,
      member: suggestedModelMember,
      level: suggestedModelLevel,
      layers: [],
    }

    info.layers = elementInfo.layers.map((layer) => {
      const connection = connections[layer.connection]
      const id = createLayerId(layer.connection, elementInfo, layer.element)
      const isGrayscale = layer.grayscale ?? false

      return {
        ...layer,
        id,
        i18n: layer.i18n ?? elementInfo.i18n ?? '',
        unit: buildUnit(layer, getUnit),
        view: {
          connection,
          key: layer.rendering,
          rendering: Array.isArray(layer.rendering)
            ? layer.rendering
            : [layer.rendering],
        },
        active: !hideLayers.includes(id),
        grayscale: isGrayscale,
      }
    })

    return info.layers.length ? info : null
  }, [
    elementInfo,
    hideLayers,
    suggestedModelRun,
    suggestedModelMember,
    suggestedModelLevel,
    getUnit,
    connections,
  ])

  return { layersInfo }
}
