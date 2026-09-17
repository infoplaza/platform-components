import type { ComponentType, CSSProperties, ReactNode } from 'react'
import type {
  TimeseriesDomain,
  TimeseriesModel,
  TimeseriesRun,
} from '../timeseries/types'

export type { TimeseriesDomain, TimeseriesModel, TimeseriesRun }

export type TimeseriesChartHourInterval = 1 | 3 | 6

export type TimeseriesChartView =
  | 'LINE'
  | 'DIRECTION'
  | 'VALUE'
  | 'PRECIPITATION_TYPE'

export type TimeseriesChartElementItem = {
  slug: string
  title: string
  element?: string
  level?: string
  unit?: string
  unitKey?: string
  view: TimeseriesChartView
  color?: string
  decimals?: number
  stripLabel?: string
}

export type TimeseriesChartElementGroup = {
  key: string
  title: string
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>
  items?: TimeseriesChartElementItem[]
}

export type TimeseriesChartLineSeries = {
  slug: string
  title: string
  element?: string
  unit?: string
  color: string
  decimals?: number
}

export type TimeseriesChartThresholdOperator =
  | 'greater-than'
  | 'greater-than-or-equal'
  | 'less-than'
  | 'less-than-or-equal'
  | 'between'
  | 'equal'

export type TimeseriesChartThresholdLevel = 'none' | 'yellow' | 'orange' | 'red'

export type TimeseriesChartThresholdRow = {
  elementId: string
  operator: TimeseriesChartThresholdOperator | (string & {})
  from: number | null
  to: number | null
  unit?: string
}

export type TimeseriesChartThresholdGroup = {
  rows: TimeseriesChartThresholdRow[]
}

export type TimeseriesChartThresholds = {
  conditions?: {
    yellow?: TimeseriesChartThresholdGroup[]
    orange?: TimeseriesChartThresholdGroup[]
    red?: TimeseriesChartThresholdGroup[]
  }
  ignored_hours?: number[]
}

export type TimeseriesChartDirectionPoint = {
  ts: number
  direction: number
}

export type TimeseriesChartDirectionOverlay = {
  slug: string
  title: string
  points: TimeseriesChartDirectionPoint[]
}

export type TimeseriesChartValuePoint = {
  ts: number
  value: number | null
  label: string
}

export type TimeseriesChartValueOverlay = {
  slug: string
  title: string
  unit?: string
  stripLabel?: string
  points: TimeseriesChartValuePoint[]
}

export type TimeseriesChartPrecipitationTypePoint = {
  ts: number
  value: number
  title: string
}

export type TimeseriesChartPrecipitationTypeOverlay = {
  slug: string
  title: string
  points: TimeseriesChartPrecipitationTypePoint[]
}

export type TimeseriesChartGraphConfig = {
  data: Array<Record<string, unknown>>
  lines: TimeseriesChartLineSeries[]
  directions: TimeseriesChartDirectionOverlay[]
  values: TimeseriesChartValueOverlay[]
  precipitationTypes: TimeseriesChartPrecipitationTypeOverlay[]
  unit?: string
  domain?: [number, number]
  ticks?: number[]
}

export type TimeseriesChartBlock = {
  key: string
  title: string
  subtitle?: string
  titleExtra?: string
  groupKey: string
  config: TimeseriesChartGraphConfig
}

export type TimeseriesChartsGetChartsOptions = {
  model: string
  run: TimeseriesRun
  models: readonly TimeseriesModel[]
  elementGroups: TimeseriesChartElementGroup[]
  visibleGroups: string[]
  locale: string
  timezone: string | null
}

export type TimeseriesChartsContextValue = {
  models: readonly TimeseriesModel[]
  model: string
  onModelChange: (slug: string) => void
  run: TimeseriesRun
  onRunChange: (run: TimeseriesRun) => void
  elementGroups: TimeseriesChartElementGroup[]
  visibleGroups: string[]
  onVisibleGroupsChange: (keys: string[]) => void
  charts: TimeseriesChartBlock[]
  loading: boolean
  error: Error | null
  locale: string
  timezone: string | null
  plotHeight: number
  hourInterval: TimeseriesChartHourInterval
  thresholds: TimeseriesChartThresholds | null
}

export type TimeseriesChartsProviderProps = {
  model?: string
  defaultModel?: string
  onModelChange?: (slug: string) => void
  run?: TimeseriesRun
  defaultRun?: TimeseriesRun
  onRunChange?: (run: TimeseriesRun) => void
  elementGroups?: TimeseriesChartElementGroup[]
  visibleGroups?: string[]
  defaultVisibleGroups?: string[]
  onVisibleGroupsChange?: (keys: string[]) => void
  charts?: TimeseriesChartBlock[]
  getCharts?: (options: TimeseriesChartsGetChartsOptions) => TimeseriesChartBlock[]
  locale?: string
  timezone?: string | null
  plotHeight?: number
  hourInterval?: TimeseriesChartHourInterval
  thresholds?: TimeseriesChartThresholds | null
  children?: ReactNode
}

export type TimeseriesChartsForecastProps = TimeseriesChartsProviderProps & {
  lat: number
  lon: number
  basePath?: string
  domain?: TimeseriesDomain
  showToolbar?: boolean
  showFooter?: boolean
  className?: string
}

export type TimeseriesChartsBuilderProps = {
  children?: ReactNode
}

export type TimeseriesGraphProps = {
  id?: string
  title?: string | null
  titleExtra?: string | null
  subtitle?: string | null
  config?: TimeseriesChartGraphConfig | null
  locale?: string
  timezone?: string | null
  plotHeight?: number
  hourInterval?: TimeseriesChartHourInterval
  thresholds?: TimeseriesChartThresholds | null
  fixedWidth?: number | null
  fixedHeight?: number | null
}

export type TimeseriesChartsChartProps = Partial<TimeseriesGraphProps>
