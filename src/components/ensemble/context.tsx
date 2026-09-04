import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  EnsembleChartBlock,
  EnsembleContextValue,
  EnsembleProviderProps,
  EnsembleRun,
  EnsembleView,
  EnsembleModel,
} from './types'
import {
  DEFAULT_ENSEMBLE_ELEMENT_GROUPS,
  DEFAULT_ENSEMBLE_MODEL,
} from './defaults'
import { useEnsembleModels } from './models'
import { fetchEnsembleCharts } from './point-forecast'

const EnsembleContext = createContext<EnsembleContextValue | null>(null)
const EnsembleChartBlockContext = createContext<EnsembleChartBlock | null>(null)

function preferredCatalogSlug(
  models: readonly EnsembleModel[],
): string {
  const preferred = models.find(
    (item) =>
      item.slug === DEFAULT_ENSEMBLE_MODEL ||
      item.title.toLowerCase() === 'ecmwf ensemble global',
  )
  return preferred?.slug ?? models[0]?.slug ?? ''
}

function catalogSlug(
  models: readonly EnsembleModel[],
  slug: string | undefined,
): string {
  if (slug && models.some((item) => item.slug === slug)) {
    return slug
  }
  return preferredCatalogSlug(models)
}

function latestRuntime(
  models: readonly EnsembleModel[],
  slug: string | undefined,
): EnsembleRun | undefined {
  if (!slug) return undefined
  const selected = models.find((item) => item.slug === slug)
  if (!selected?.runtimes.length) return undefined
  return Math.max(...selected.runtimes)
}

function catalogRun(
  models: readonly EnsembleModel[],
  slug: string,
  run: EnsembleRun | undefined,
): EnsembleRun {
  const selected = models.find((item) => item.slug === slug)
  if (!selected?.runtimes.length) {
    return 'all'
  }
  if (run === 'all') return 'all'
  if (typeof run === 'number' && selected.runtimes.includes(run)) {
    return run
  }
  return latestRuntime(models, slug) ?? 'all'
}

export function EnsembleProvider({
  model: modelProp,
  defaultModel,
  onModelChange: onModelChangeProp,
  run: runProp,
  defaultRun,
  onRunChange: onRunChangeProp,
  elementGroups: elementGroupsProp,
  elementGroup: elementGroupProp,
  defaultElementGroup,
  onElementGroupChange: onElementGroupChangeProp,
  view: viewProp,
  defaultView,
  onViewChange: onViewChangeProp,
  charts: chartsProp,
  getCharts,
  locale = 'en',
  timezone = null,
  children,
}: EnsembleProviderProps) {
  const {
    models,
    loading: catalogLoading,
    error: catalogError,
    lat,
    lon,
    basePath,
  } = useEnsembleModels()
  const elementGroups = elementGroupsProp ?? DEFAULT_ENSEMBLE_ELEMENT_GROUPS
  const hostOwned = chartsProp !== undefined || Boolean(getCharts)

  const modelControlled = modelProp !== undefined
  const runControlled = runProp !== undefined
  const elementGroupControlled = elementGroupProp !== undefined
  const viewControlled = viewProp !== undefined

  const [internalModel, setInternalModel] = useState(
    () => modelProp ?? defaultModel ?? DEFAULT_ENSEMBLE_MODEL,
  )
  const requestedModel = modelControlled ? modelProp : internalModel
  const model = catalogSlug(models, requestedModel)

  const [internalRun, setInternalRun] = useState<EnsembleRun | undefined>(
    () => runProp ?? defaultRun,
  )
  const requestedRun = runControlled ? runProp : internalRun
  const run = catalogRun(models, model, requestedRun)

  const [internalElementGroup, setInternalElementGroup] = useState(
    () =>
      elementGroupProp ??
      defaultElementGroup ??
      elementGroups[0]?.key ??
      '',
  )
  const elementGroup = elementGroupControlled
    ? elementGroupProp
    : internalElementGroup

  const [internalView, setInternalView] = useState<EnsembleView>(
    () => viewProp ?? defaultView ?? 'basic',
  )
  const view = viewControlled ? viewProp : internalView

  const onModelChange = useCallback(
    (slug: string) => {
      if (!models.some((item) => item.slug === slug)) return
      if (!modelControlled) {
        setInternalModel(slug)
        if (!runControlled) {
          const nextRun = latestRuntime(models, slug)
          if (nextRun != null) setInternalRun(nextRun)
        }
      }
      onModelChangeProp?.(slug)
    },
    [modelControlled, models, onModelChangeProp, runControlled],
  )

  const onRunChange = useCallback(
    (next: EnsembleRun) => {
      const selected = models.find((item) => item.slug === model)
      if (
        next !== 'all' &&
        (typeof next !== 'number' || !selected?.runtimes.includes(next))
      ) {
        return
      }
      if (!runControlled) setInternalRun(next)
      onRunChangeProp?.(next)
    },
    [model, models, onRunChangeProp, runControlled],
  )

  const onElementGroupChange = useCallback(
    (key: string) => {
      if (!elementGroupControlled) setInternalElementGroup(key)
      onElementGroupChangeProp?.(key)
    },
    [elementGroupControlled, onElementGroupChangeProp],
  )

  const onViewChange = useCallback(
    (next: EnsembleView) => {
      if (!viewControlled) setInternalView(next)
      onViewChangeProp?.(next)
    },
    [onViewChangeProp, viewControlled],
  )

  const [forecastCharts, setForecastCharts] = useState<EnsembleChartBlock[]>(
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
    const group =
      elementGroups.find((entry) => entry.key === elementGroup) ??
      elementGroups[0]

    if (
      !selected ||
      !group ||
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

    fetchEnsembleCharts({
      basePath,
      lat,
      lon,
      model: selected,
      run,
      group,
      view,
      locale,
      timezone,
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
    elementGroup,
    elementGroups,
    hostOwned,
    lat,
    locale,
    lon,
    model,
    models,
    run,
    timezone,
    view,
  ])

  const charts = useMemo(() => {
    if (chartsProp !== undefined) {
      return chartsProp
    }
    if (getCharts) {
      return getCharts({
        model,
        run,
        elementGroup,
        view,
        models,
        elementGroups,
        locale,
        timezone,
      })
    }
    return forecastCharts
  }, [
    chartsProp,
    elementGroup,
    elementGroups,
    forecastCharts,
    getCharts,
    locale,
    model,
    models,
    run,
    timezone,
    view,
  ])

  const loading = catalogLoading || (!hostOwned && forecastLoading)
  const error = catalogError ?? forecastError

  const value = useMemo<EnsembleContextValue>(
    () => ({
      models,
      model,
      onModelChange,
      run,
      onRunChange,
      elementGroups,
      elementGroup,
      onElementGroupChange,
      view,
      onViewChange,
      charts,
      loading,
      error,
      locale,
      timezone,
    }),
    [
      charts,
      elementGroup,
      elementGroups,
      error,
      loading,
      locale,
      model,
      models,
      onElementGroupChange,
      onModelChange,
      onRunChange,
      onViewChange,
      run,
      timezone,
      view,
    ],
  )

  return (
    <EnsembleContext.Provider value={value}>{children}</EnsembleContext.Provider>
  )
}

export function useEnsembleContext(): EnsembleContextValue | null {
  return useContext(EnsembleContext)
}

export function useEnsemble(): EnsembleContextValue {
  const context = useContext(EnsembleContext)
  if (!context) {
    throw new Error('useEnsemble must be used within an EnsembleProvider')
  }
  return context
}

export function EnsembleChartBlockProvider({
  block,
  children,
}: {
  block: EnsembleChartBlock
  children: ReactNode
}) {
  return (
    <EnsembleChartBlockContext.Provider value={block}>
      {children}
    </EnsembleChartBlockContext.Provider>
  )
}

export function useEnsembleChartBlockContext(): EnsembleChartBlock | null {
  return useContext(EnsembleChartBlockContext)
}

export function useEnsembleChartBlock(): EnsembleChartBlock {
  const block = useContext(EnsembleChartBlockContext)
  if (!block) {
    throw new Error(
      'useEnsembleChartBlock must be used within an EnsembleBuilder',
    )
  }
  return block
}
