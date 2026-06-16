import type { ReactNode } from 'react'

export type UnitResolver = (key: string) => { value: string }

export type ConnectionMap = Record<string, unknown>

export interface LayerInfoBase {
  connection: string
  element: string
  rendering: string | string[]
  unit?: string
  units?: string[]
  unitKey?: string
  i18n?: string
  grayscale?: boolean
  [key: string]: unknown
}

export interface WeatherConfig {
  model?: string
  element?: string
  run?: string
  member?: string
  level?: string
  models?: ModelInfo[]
  hideLayers?: string[]
  children?: ReactNode
  connections?: ConnectionMap
  getUnit?: UnitResolver
}

export interface WeatherState {
  element: string
  model: string
  modelRun: string
  modelMember: string | null
  modelLevel: string | null
  month: string | null
  period: string | null
  mapState: unknown | null
}

export interface ModelInfo {
  slug: string
  name: string
  title?: string
  runtimes: string[]
  members: string[]
  elementGroups: ElementGroup[]
  type: string
  description?: unknown
  available?: boolean
}

export interface ElementGroup {
  name: string
  items: ElementInfo[]
}

export interface ElementInfo {
  slug: string
  name: string
  description?: string
  layers: LayerInfoBase[]
  levels?: string[]
  group?: ElementGroup
  i18n?: string
  available?: boolean
  [key: string]: unknown
}

export interface LayerViewConfig {
  connection: unknown
  key: string | string[]
  rendering: string[]
}

export interface LayerInfo extends LayerInfoBase {
  id: string
  unit: string
  view: LayerViewConfig
  active: boolean
}

export interface WeatherLayersInfo {
  run: string
  member: string
  level: string
  layers: LayerInfo[]
}

export interface WeatherContextValue extends WeatherState {
  setElement: (element: string) => void
  setModel: (model: string) => void
  setModelRun: (run: string) => void
  setModelMember: (member: string | null) => void
  setModelLevel: (level: string | null) => void
  setMonth: (month: string | null) => void
  setPeriod: (period: string | null) => void
  setMapState: (state: unknown | null) => void
  modelInfo: ModelInfo | null
  selectedModelInfo?: ModelInfo | null
  elementInfo: ElementInfo | null
  layersInfo: WeatherLayersInfo | null
  hideLayers: string[]
}

export interface WeatherSuggestions {
  suggestedModelRun: string
  suggestedModelMember: string
  suggestedModelLevel: string
}
