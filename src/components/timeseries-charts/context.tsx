import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { TimeseriesModel, TimeseriesRun } from '../timeseries/types'
import { useTimeseriesModels } from '../timeseries/models'
import { latestRuntime } from '../timeseries/utils'
import {
  DEFAULT_TIMESERIES_CHART_HOUR_INTERVAL,
  DEFAULT_TIMESERIES_CHART_PLOT_HEIGHT,
  defaultTimeseriesChartGroups,
} from './defaults'
import { fetchTimeseriesCharts } from './point-forecast'
import type {
  TimeseriesChartBlock,
  TimeseriesChartsContextValue,
  TimeseriesChartsProviderProps,
} from './types'

const TimeseriesChartsContext =
  createContext<TimeseriesChartsContextValue | null>(null)
const TimeseriesChartBlockContext = createContext<TimeseriesChartBlock | null>(
  null,
)

function catalogSlug(
  models: readonly TimeseriesModel[],
  slug: string | undefined,
): string {
  if (slug && models.some((item) => item.slug === slug)) {
    return slug
  }
  return models[0]?.slug ?? ''
}

function catalogRun(
  models: readonly TimeseriesModel[],
  slug: string,
  run: TimeseriesRun | undefined,
): TimeseriesRun {
  const selected = models.find((item) => item.slug === slug)
  if (!selected?.runtimes.length) {
    return 'all'
  }
  if (run === 'all') {
    return 'all'
  }
  if (typeof run === 'number' && selected.runtimes.includes(run)) {
    return run
  }
  return latestRuntime(models, slug) ?? 'all'
}

function clampVisibleGroups(
  groups: TimeseriesChartsProviderProps['elementGroups'],
  keys: string[] | undefined,
): string[] {
  const allKeys = (groups ?? []).map((group) => group.key)
  if (!keys || keys.length === 0) {
    return allKeys
  }
  const allowed = new Set(allKeys)
  const next = keys.filter((key) => allowed.has(key))
  return next.length > 0 ? next : allKeys
}

export function TimeseriesChartsProvider({
  model: modelProp,
  defaultModel,
  onModelChange: onModelChangeProp,
  run: runProp,
  defaultRun,
  onRunChange: onRunChangeProp,
  elementGroups: elementGroupsProp,
  visibleGroups: visibleGroupsProp,
  defaultVisibleGroups,
  onVisibleGroupsChange: onVisibleGroupsChangeProp,
  charts: chartsProp,
  getCharts,
  locale = 'en',
  timezone = null,
  plotHeight = DEFAULT_TIMESERIES_CHART_PLOT_HEIGHT,
  hourInterval = DEFAULT_TIMESERIES_CHART_HOUR_INTERVAL,
  thresholds = null,
  children,
}: TimeseriesChartsProviderProps) {
  const {
    models,
    loading: catalogLoading,
    error: catalogError,
    lat,
    lon,
    basePath,
    domain,
  } = useTimeseriesModels()
  const elementGroups =
    elementGroupsProp ?? defaultTimeseriesChartGroups(domain)
  const hostOwned = chartsProp !== undefined || Boolean(getCharts)

  const modelControlled =
    modelProp !== undefined && onModelChangeProp !== undefined
  const runControlled = runProp !== undefined
  const visibleControlled = visibleGroupsProp !== undefined

  const [internalModel, setInternalModel] = useState(
    () => modelProp ?? defaultModel ?? '',
  )
  const requestedModel = modelControlled ? modelProp : internalModel
  const model = catalogSlug(models, requestedModel)

  const [internalRun, setInternalRun] = useState<TimeseriesRun | undefined>(
    () => runProp ?? defaultRun,
  )
  const requestedRun = runControlled ? runProp : internalRun
  const run = catalogRun(models, model, requestedRun)

  const [internalVisibleGroups, setInternalVisibleGroups] = useState(() =>
    clampVisibleGroups(
      elementGroups,
      visibleGroupsProp ?? defaultVisibleGroups,
    ),
  )
  const visibleGroups = clampVisibleGroups(
    elementGroups,
    visibleControlled ? visibleGroupsProp : internalVisibleGroups,
  )

  const onModelChange = useCallback(
    (slug: string) => {
      if (!models.some((item) => item.slug === slug)) {
        return
      }
      if (!modelControlled) {
        setInternalModel(slug)
        if (!runControlled) {
          const nextRun = latestRuntime(models, slug)
          if (nextRun != null) {
            setInternalRun(nextRun)
          }
        }
      }
      onModelChangeProp?.(slug)
    },
    [modelControlled, models, onModelChangeProp, runControlled],
  )

  const onRunChange = useCallback(
    (next: TimeseriesRun) => {
      const selected = models.find((item) => item.slug === model)
      if (
        next !== 'all' &&
        (typeof next !== 'number' || !selected?.runtimes.includes(next))
      ) {
        return
      }
      if (!runControlled) {
        setInternalRun(next)
      }
      onRunChangeProp?.(next)
    },
    [model, models, onRunChangeProp, runControlled],
  )

  const onVisibleGroupsChange = useCallback(
    (keys: string[]) => {
      const next = clampVisibleGroups(elementGroups, keys)
      if (!visibleControlled) {
        setInternalVisibleGroups(next)
      }
      onVisibleGroupsChangeProp?.(next)
    },
    [elementGroups, onVisibleGroupsChangeProp, visibleControlled],
  )

  const [forecastCharts, setForecastCharts] = useState<TimeseriesChartBlock[]>(
    [],
  )
  const [forecastLoading, setForecastLoading] = useState(() => !hostOwned)
  const [forecastError, setForecastError] = useState<Error | null>(null)

  useEffect(() => {
    if (hostOwned) {
      return
    }

    if (catalogLoading) {
      return
    }

    const selected = models.find((item) => item.slug === model)

    if (
      !selected ||
      elementGroups.length === 0 ||
      !model ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      setForecastCharts([])
      setForecastLoading(false)
      setForecastError(null)
      return
    }

    const controller = new AbortController()
    setForecastLoading(true)
    setForecastError(null)

    fetchTimeseriesCharts({
      basePath,
      lat,
      lon,
      model: selected,
      run,
      groups: elementGroups,
      domain,
      signal: controller.signal,
    })
      .then((next) => {
        setForecastCharts(next)
        setForecastLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') {
          return
        }
        setForecastError(err instanceof Error ? err : new Error(String(err)))
        setForecastCharts([])
        setForecastLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [
    basePath,
    catalogLoading,
    domain,
    elementGroups,
    hostOwned,
    lat,
    lon,
    model,
    models,
    run,
  ])

  const charts = useMemo(() => {
    if (chartsProp !== undefined) {
      return chartsProp
    }
    if (getCharts) {
      return getCharts({
        model,
        run,
        models,
        elementGroups,
        visibleGroups,
        locale,
        timezone,
      })
    }
    const visible = new Set(visibleGroups)
    return forecastCharts.filter((block) => visible.has(block.groupKey))
  }, [
    chartsProp,
    elementGroups,
    forecastCharts,
    getCharts,
    locale,
    model,
    models,
    run,
    timezone,
    visibleGroups,
  ])

  const loading = catalogLoading || (!hostOwned && forecastLoading)
  const error = catalogError ?? forecastError

  const value = useMemo<TimeseriesChartsContextValue>(
    () => ({
      models,
      model,
      onModelChange,
      run,
      onRunChange,
      elementGroups,
      visibleGroups,
      onVisibleGroupsChange,
      charts,
      loading,
      error,
      locale,
      timezone,
      plotHeight,
      hourInterval,
      thresholds,
    }),
    [
      charts,
      elementGroups,
      error,
      hourInterval,
      loading,
      locale,
      model,
      models,
      onModelChange,
      onRunChange,
      onVisibleGroupsChange,
      plotHeight,
      run,
      thresholds,
      timezone,
      visibleGroups,
    ],
  )

  return (
    <TimeseriesChartsContext.Provider value={value}>
      {children}
    </TimeseriesChartsContext.Provider>
  )
}

export function useTimeseriesChartsContext(): TimeseriesChartsContextValue | null {
  return useContext(TimeseriesChartsContext)
}

export function useTimeseriesCharts(): TimeseriesChartsContextValue {
  const context = useContext(TimeseriesChartsContext)
  if (!context) {
    throw new Error(
      'useTimeseriesCharts must be used within a TimeseriesChartsProvider',
    )
  }
  return context
}

export function TimeseriesChartBlockProvider({
  block,
  children,
}: {
  block: TimeseriesChartBlock
  children: ReactNode
}) {
  return (
    <TimeseriesChartBlockContext.Provider value={block}>
      {children}
    </TimeseriesChartBlockContext.Provider>
  )
}

export function useTimeseriesChartBlockContext(): TimeseriesChartBlock | null {
  return useContext(TimeseriesChartBlockContext)
}

export function useTimeseriesChartBlock(): TimeseriesChartBlock {
  const block = useContext(TimeseriesChartBlockContext)
  if (!block) {
    throw new Error(
      'useTimeseriesChartBlock must be used within a TimeseriesChartsBuilder',
    )
  }
  return block
}
