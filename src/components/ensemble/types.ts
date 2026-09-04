import type { ComponentType, CSSProperties, ReactNode } from 'react'

export type EnsembleView = 'basic' | 'expert'
export type EnsembleChartKind = 'plume' | 'line' | 'bar'
export type EnsembleRun = number | 'all'

export type EnsembleModel = {
  slug: string
  title: string
  runtimes: readonly number[]
  members?: readonly string[]
  available?: boolean
  isBeta?: boolean
  sort?: number
}

export type EnsembleRange = {
  min?: number
  max?: number | null
}

export type EnsembleBarSeries = {
  dataKey: string
  stackId: string
  name: string
  fill: string
  unit?: string
  translatable?: boolean
}

export type EnsemblePlumeSeriesOption = {
  type: 'area' | 'line'
  dataKeys?: string[]
  dataKey?: string
  name: string
  color: string
  textColor?: string
  width?: number
}

export type EnsembleRow = {
  datetime: string | number
  metadata: {
    datetime: string
    epoch: number
    sequence?: number
    offset?: number
    rawValue: Array<number | null>
  }
  debug?: unknown
  [key: string]: unknown
}

export type EnsembleAdapter = (args: { data: EnsembleRow[] }) => EnsembleRow[]

export type EnsembleScenarioViewConfig = {
  chart: EnsembleChartKind
  members?: string[]
  adapter?: EnsembleAdapter
  options?: {
    y?: EnsemblePlumeSeriesOption[]
    legend?: {
      payload?: Array<{
        value: string
        type: 'area' | 'line' | 'bar'
        id: string
        color: string
      }>
    }
  }
  bar?: {
    reverse?: boolean
    yAxis?: {
      domain?: [number | 'auto', number | 'auto']
    }
    y: EnsembleBarSeries[]
    reference?: Record<string, unknown>
  }
  line?: {
    yAxis?: {
      domain?: [number | 'auto', number | 'auto']
    }
  }
  type?: string
  tooltip?: Record<string, unknown>
}

export type EnsembleElementItem = {
  slug: string
  title: string
  element: string
  level?: string
  unit?: string
  unitKey?: string
  subtitle?: string
  decimals?: number
  scenario: {
    available: EnsembleView[]
    basic?: EnsembleScenarioViewConfig
    expert?: EnsembleScenarioViewConfig
  }
}

export type EnsembleElementGroup = {
  key: string
  title: string
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>
  items: EnsembleElementItem[]
}

export type EnsembleYConfig = {
  display: 'area' | 'line' | 'bar'
  dataKey: string
  legend?: string
  name?: string
  unit?: string
  type?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  dot?: boolean
  activeDot?: unknown
  strokeDasharray?: string
  stackId?: string
  translatable?: boolean
  width?: number | ((data: EnsembleRow) => number | undefined)
  shape?: unknown
  activeBar?: unknown
  colorKey?: string
  dataSet?: (data: Record<string, unknown>, index: number, rows: unknown) => void
  dataSet2?: (data: Record<string, unknown>, row: EnsembleRow) => void
}

export type EnsembleXConfig = {
  key: string
  formatter?: (value: number) => string | null
  hide?: boolean
  domain?: [number, number]
  ticks?: number[]
  type?: 'number' | 'category'
  label?: string
  xAxisId?: number
}

export type EnsembleGraphConfig = {
  data: Array<Record<string, unknown>>
  x: EnsembleXConfig[]
  y: EnsembleYConfig[]
  yAxis?: {
    ticks?: number[] | null
    domain?: unknown
    interval?: unknown
    label?: string
  }
  yAxis2?: {
    ticks?: number[] | null
    domain?: unknown
    interval?: unknown
    label?: string
  }
  legend: {
    active: boolean
    verticalAlign?: 'top' | 'bottom'
    align?: 'left' | 'center' | 'right'
    enableOnClick?: boolean
    content?: unknown
    payload?: Array<{
      value: string
      type: string
      id: string
      color: string
      translatable?: boolean
      opacity?: number
    }>
  }
  tooltip: {
    labelFormatter?: (value: unknown) => ReactNode
    content?: unknown
    wrapperStyle?: CSSProperties
    formatter?: unknown
    cursor?: unknown
  }
  reference: {
    xLines?: number[]
    alternateArea?: boolean
    yLines?: Array<{
      line: number
      stroke?: string
      strokeDasharray?: string
      label?: unknown
    }>
    enableBFTLines?: Array<{
      scale: number
      name: string
      color: string
      unit?: string
      min: string | number
      max: string | number
    }>
    isUTC?: boolean
    unit?: string
    slug?: string
    runWatermark?: string
    filename?: string
    query?: unknown
    cartesianGrid?: { vertical?: boolean }
    highPriority?: {
      xLines?: Array<{
        value: number
        label?: unknown
        strokeDasharray?: string
        stroke?: string
        strokeWidth?: number
      }>
    }
    xLineOptions?: {
      tickType?: 'number' | 'category'
      domainOffset?: number
      type?: 'number' | 'category'
      hideXLines?: boolean
      mode?: 'midDay' | 'default'
      interval?: number
    }
    windArrows?: Array<{ ms: number; direction: number }>
  }
  height?: number
}

export type EnsembleChartBlock = {
  title: string
  subtitle?: string
  titleExtra?: string
  config: EnsembleGraphConfig
}

export type EnsembleGetChartsOptions = {
  model: string
  run: EnsembleRun
  elementGroup: string
  view: EnsembleView
  models: readonly EnsembleModel[]
  elementGroups: EnsembleElementGroup[]
  locale: string
  timezone: string | null
}

export type EnsembleContextValue = {
  models: readonly EnsembleModel[]
  model: string
  onModelChange: (slug: string) => void
  run: EnsembleRun
  onRunChange: (run: EnsembleRun) => void
  elementGroups: EnsembleElementGroup[]
  elementGroup: string
  onElementGroupChange: (key: string) => void
  view: EnsembleView
  onViewChange: (view: EnsembleView) => void
  charts: EnsembleChartBlock[]
  loading: boolean
  error: Error | null
  locale: string
  timezone: string | null
}

export type EnsembleModelsContextValue = {
  models: readonly EnsembleModel[]
  loading: boolean
  error: Error | null
  lat: number
  lon: number
  basePath: string
}

export type EnsembleModelsProviderProps = {
  lat: number
  lon: number
  basePath?: string
  children?: ReactNode
}

export type EnsembleProviderProps = {
  model?: string
  defaultModel?: string
  onModelChange?: (slug: string) => void
  run?: EnsembleRun
  defaultRun?: EnsembleRun
  onRunChange?: (run: EnsembleRun) => void
  elementGroups?: EnsembleElementGroup[]
  elementGroup?: string
  defaultElementGroup?: string
  onElementGroupChange?: (key: string) => void
  view?: EnsembleView
  defaultView?: EnsembleView
  onViewChange?: (view: EnsembleView) => void
  charts?: EnsembleChartBlock[]
  getCharts?: (options: EnsembleGetChartsOptions) => EnsembleChartBlock[]
  locale?: string
  timezone?: string | null
  children?: ReactNode
}

export type EnsembleForecastProps = EnsembleProviderProps & {
  lat: number
  lon: number
  basePath?: string
  showToolbar?: boolean
  showFooter?: boolean
  className?: string
}

export type EnsembleBuilderProps = {
  children?: ReactNode
}

export type EnsembleGraphProps = {
  id?: string
  title?: string | null
  titleExtra?: string | null
  subtitle?: string | null
  config?: EnsembleGraphConfig | null
  fixedWidth?: number | null
  fixedHeight?: number | null
}

export type EnsembleChartProps = Partial<EnsembleGraphProps>
