import { ReactNode } from 'react'
import type { Layer, LayerConfigSettings } from '@/@types/layer.types'
import type Connection from '../../connections/connection'

/**
 * Weather Context Type Definitions
 */

export interface WeatherConfig {
  model?: string
  element?: string
  run?: string
  member?: string
  level?: string
  /**
   * @deprecated Models are now fetched internally by the `ModelsProvider`.
   * Passing them here is only kept for backwards compatibility and, when
   * provided, takes precedence over the internally fetched models.
   */
  models?: ModelInfo[]
  hideLayers?: string[]
  children?: ReactNode
}

/**
 * Configuration for the internal models request performed by `ModelsProvider`.
 */
export interface ModelsConfig {
  /** Upstream environment to request models for. Defaults to `prod`. */
  apiEnv?: 'prod' | 'test'
  /** Whether to include beta models. Defaults to `false`. */
  betaModels?: boolean
  /**
   * Base path where the platform auth handler is mounted. The models request is
   * sent to `${basePath}/models`. Defaults to `/api/platform`.
   */
  basePath?: string
}

export interface ModelsContextValue {
  models: ModelInfo[]
  loading: boolean
  error: Error | null
}

export interface WeatherState {
  element: string
  model: string
  modelRun: string
  modelMember: string | null
  modelLevel: string | null
  month: string | null
  period: string | null
  mapState: MapState | null
}

export interface ModelInfo {
  format?: 'forecast' | 'nowcast' | 'grade' | 'stormtrack' | 'climate'
  slug: string
  name: string
  title?: string
  title_i18n?: string
  runtimes: string[]
  members: string[]
  elementGroups: ElementGroup[]
  type: string
  group?: ModelGroup
  description?: any
  available?: boolean
  regionCategory?: string
}

export interface ModelGroup {
  slug?: string
  i18n?: string | null
  title?: string
  sort?: number
}

export interface ElementGroup {
  name: string
  items: ElementInfo[]
}

export interface ElementInfo {
  slug: string
  name: string
  description?: string
  layers: Layer[]
  levels?: string[]
  lightning?: boolean
  group?: ElementGroup
  i18n?: string
  available?: boolean
  live?: boolean
  refresh?: number
  preloading?: boolean
  options?: {
    legend?: {
      type?: string
      position?: string
      size?: string
      color?: string
    }
    timebar?: {
      acceptedMinutes?: string[]
    }
  }
}

export interface LayerConfig {
  element: string
  rendering: string
  unit?: string
  units?: string[]
  unitKey?: string
  palette?: any
  model?: string
  period?: string
  i18n?: string
  grayscale?: boolean
}

export interface LayerInfo extends Layer {
  id: string
  view: ViewConfig
}

export interface ViewConfig {
  key: string | string[]
  rendering: string[]
  [key: string]: any
}

export interface TimestampInfo {
  index?: number
  loaded?: boolean
  timestamp: number
  active: boolean
  url: boolean
  procent: number
}

export interface AggregatedLayer {
  timestamp: string
  urls: string[]
  datetime: string
}

export interface WeatherLayersInfo {
  isMixedLayers?: boolean
  run: string
  member: string
  level: string
  layers: LayerInfo[]
  legends?: LegendInfo[] // deprecated, should be removed in the future
}

export interface LegendInfo {
  i18n: string
  slug: string
  unitKey?: string
  unit?: string
  visualization: {
    databounds: any
    labels?: string[]
    datalabels: any
    colors: any
  }
}

export interface MapState {
  layers: MapLayer[]
}

export interface MapLayer {
  id?: string
  active?: boolean
  preloading?: boolean
  rendering?: string | string[]
  palettesUrl?: string
  data?: {
    layers?: LayerData[]
    features?: GeoJSON.Feature[]
    element?: {
      composite?: boolean
      isLogscale?: boolean
      unit?: string
      level?: string
      fillvalue?: number
      databounds: any
      datalabels: any
      labels?: string[]
      visualization: any
      palette?: {
        png: string
        jpg: string
        webp: string
      }
    }
    elementdescription?: {
      unit?: string
      visualization?: {
        databounds: any
        datalabels: any
        labels?: string[]
        colors: any
      }
    }
    rundescription?: {
      region_category?: string
    }
  }
  view?: {
    legend?: boolean
  }
  palette?: string
  isAlphaImage?: boolean
  fillvalue?: number
  grayscale?: boolean
  imageStride?: number
  name?: string
  i18n?: string
  settings?: LayerConfigSettings
  element?: string,
  level?: string,
  unitKey?: string
  unit?: string
  boundingBox?:  {
    west: number
    south: number
    east: number
    north: number
  }
  layersApi?: string
}

export interface LayerData {
  timestamp: string
  url: string
  datetime: string
}

export interface WeatherContextValue extends WeatherState {
  // State setters
  setElement: (element: string) => void
  setModel: (model: string) => void
  setModelRun: (run: string) => void
  setModelMember: (member: string | null) => void
  setModelLevel: (level: string | null) => void
  setMonth: (month: string | null) => void
  setPeriod: (period: string | null) => void
  setMapState: (state: MapState | null) => void
  
  // Computed values
  models: ModelInfo[]
  modelInfo: ModelInfo | null
  selectedModelInfo?: ModelInfo | null
  elementInfo: ElementInfo | null
  layersInfo: WeatherLayersInfo | null
  
  // Config values
  hideLayers: string[]
}

export interface WeatherSuggestions {
  suggestedModelRun: string
  suggestedModelMember: string
  suggestedModelLevel: string
}

export interface EnrichedMapLayer extends MapLayer {
  connection: Connection
  getLayersUrl: (args: any) => string
  layersUrl?: string
}
