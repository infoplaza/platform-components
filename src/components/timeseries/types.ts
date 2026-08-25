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

export type TimeseriesModel = {
  slug: string
  title: string
  runtimes: number[]
  available?: boolean
  isBeta?: boolean
  sort?: number
}

export type TimeseriesElementGroup = {
  key: string
  title: string
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>
  items?: Array<{ slug: string; title: string }>
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

export type TimeseriesForecastProps = {
  models: TimeseriesModel[]
  model: string
  onModelChange: (slug: string) => void
  run: TimeseriesRun
  onRunChange: (run: TimeseriesRun) => void
  elementGroups: TimeseriesElementGroup[]
  elementGroup: string
  onElementGroupChange: (key: string) => void
  blocks: TimeseriesBlock[]
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
  onDirectionViewChange?: (view: TimeseriesDirectionView) => void
  loading?: boolean
  className?: string
  children?: ReactNode
}
