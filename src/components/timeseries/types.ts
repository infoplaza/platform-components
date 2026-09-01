import type { ComponentType, CSSProperties, ReactNode } from 'react'

export type TimeseriesCellView =
  | 'VALUE'
  | 'VALUE_ROUND'
  | 'DIRECTION'
  | 'PRECIPITATION_TYPE'
  | 'ICON'

export type TimeseriesCell = {
  timestamp: number
  value: number | null
  im_color: string
  im_textcolor: string
}

export type TimeseriesRowConfig = {
  element?: string
  decimals?: number
}

export type TimeseriesRow = {
  title: string
  subtitle?: string
  titleExtra?: string
  view?: TimeseriesCellView
  unit?: string
  config?: TimeseriesRowConfig
  data: TimeseriesCell[]
  info?: string
  beta?: boolean
  highlighted?: boolean
}

export type TimeseriesHiddenRow = {
  title: string
  reason?: string
  beta?: boolean
}

export type TimeseriesBlock = {
  title?: string
  subtitle?: string
  titleExtra?: string
  rows: TimeseriesRow[]
  hiddenRows?: TimeseriesHiddenRow[]
}

export type TimeseriesDirectionView = {
  arrow: boolean
  degrees: boolean
  compass: boolean
}

export type TimeseriesCellComponentProps = {
  data: TimeseriesCell
  config?: TimeseriesRowConfig
  unit?: string
  getIconSrc?: (value: number | null) => string | null
  directionView?: TimeseriesDirectionView
  onDirectionViewChange?: (view: TimeseriesDirectionView) => void
}

export type TimeseriesCellViewMap = Partial<
  Record<TimeseriesCellView, ComponentType<TimeseriesCellComponentProps>>
>

export type TimeseriesModelElement = {
  id: string
  name?: string
  units?: string[]
  levels?: string[]
  unitDefault?: string
}

export type TimeseriesModel = {
  slug: string
  title: string
  runtimes: readonly number[]
  available?: boolean
  isBeta?: boolean
  sort?: number
  type?: string
  region?: string
  category?: string
  elements?: readonly TimeseriesModelElement[]
}

export type TimeseriesElementItem = {
  slug: string
  title: string
  element?: string
  level?: string
  unit?: string
  unitKey?: string
  view?: TimeseriesCellView
  decimals?: number
}

export type TimeseriesElementGroup = {
  key: string
  title: string
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>
  items?: TimeseriesElementItem[]
}

export type TimeseriesRun = number | 'all'

export type TimeseriesPillItem = {
  value: string
  title: string
  active?: boolean
  disabled?: boolean
  beta?: boolean
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>
}

export type TimeseriesTableProps = {
  rows: TimeseriesRow[]
  hiddenRows?: TimeseriesHiddenRow[]
  locale?: string
  timezone?: string | null
  timestamp?: number | null
  timestamps?: number[]
  onTimestampChange?: (timestamp: number) => void
  title?: string
  titleExtra?: string
  subtitle?: string
  headerFormat?: string[]
  scrollToCurrentTime?: boolean
  hideEmptyRows?: boolean
  scrollbar?: boolean
  views?: TimeseriesCellViewMap
  getIconSrc?: (value: number | null) => string | null
  directionView?: TimeseriesDirectionView
  onDirectionViewChange?: (view: TimeseriesDirectionView) => void
}

export type TimeseriesGetBlocksOptions = {
  model: string
  run: TimeseriesRun
  elementGroup: string
  models: readonly TimeseriesModel[]
  elementGroups: TimeseriesElementGroup[]
}

export type TimeseriesContextValue = {
  models: readonly TimeseriesModel[]
  model: string
  onModelChange: (slug: string) => void
  run: TimeseriesRun
  onRunChange: (run: TimeseriesRun) => void
  elementGroups: TimeseriesElementGroup[]
  elementGroup: string
  onElementGroupChange: (key: string) => void
  blocks: TimeseriesBlock[]
  loading: boolean
  error: Error | null
  locale: string
  timezone: string | null
  headerFormat?: string[]
  timestamp: number | null
  timestamps: number[]
  onTimestampChange?: (timestamp: number) => void
  scrollToCurrentTime?: boolean
  views?: TimeseriesCellViewMap
  getIconSrc?: (value: number | null) => string | null
  directionView: TimeseriesDirectionView
  onDirectionViewChange: (view: TimeseriesDirectionView) => void
}

export type TimeseriesModelsContextValue = {
  models: readonly TimeseriesModel[]
  loading: boolean
  error: Error | null
  lat: number
  lon: number
  basePath: string
}

export type TimeseriesModelsProviderProps = {
  lat: number
  lon: number
  basePath?: string
  children?: ReactNode
}

export type TimeseriesProviderProps = {
  model?: string
  defaultModel?: string
  onModelChange?: (slug: string) => void
  run?: TimeseriesRun
  defaultRun?: TimeseriesRun
  onRunChange?: (run: TimeseriesRun) => void
  elementGroups?: TimeseriesElementGroup[]
  elementGroup?: string
  defaultElementGroup?: string
  onElementGroupChange?: (key: string) => void
  blocks?: TimeseriesBlock[]
  getBlocks?: (options: TimeseriesGetBlocksOptions) => TimeseriesBlock[]
  locale?: string
  timezone?: string | null
  headerFormat?: string[]
  timestamp?: number | null
  timestamps?: number[]
  onTimestampChange?: (timestamp: number) => void
  scrollToCurrentTime?: boolean
  views?: TimeseriesCellViewMap
  getIconSrc?: (value: number | null) => string | null
  directionView?: TimeseriesDirectionView
  defaultDirectionView?: TimeseriesDirectionView
  onDirectionViewChange?: (view: TimeseriesDirectionView) => void
  children?: ReactNode
}

export type TimeseriesForecastProps = TimeseriesProviderProps & {
  lat: number
  lon: number
  basePath?: string
  showToolbar?: boolean
  showFooter?: boolean
  className?: string
}

export type TimeseriesBuilderProps = {
  children?: ReactNode
}

export type TimeseriesChartProps = Partial<TimeseriesTableProps>
