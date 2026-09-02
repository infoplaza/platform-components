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
  TimeseriesBlock,
  TimeseriesContextValue,
  TimeseriesDirectionView,
  TimeseriesModel,
  TimeseriesProviderProps,
  TimeseriesRun,
} from './types'
import { DEFAULT_TIMESERIES_ELEMENT_GROUPS } from './defaults'
import { useTimeseriesModels } from './models'
import { fetchTimeseriesBlocks } from './point-forecast'
import { DEFAULT_DIRECTION_VIEW, latestRuntime } from './utils'

const TimeseriesContext = createContext<TimeseriesContextValue | null>(null)
const TimeseriesBlockContext = createContext<TimeseriesBlock | null>(null)

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

function resolveInitialElementGroup(
  elementGroup: string | undefined,
  defaultElementGroup: string | undefined,
  elementGroups: TimeseriesProviderProps['elementGroups'],
): string {
  return (
    elementGroup ??
    defaultElementGroup ??
    elementGroups?.[0]?.key ??
    ''
  )
}

export function TimeseriesProvider({
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
  blocks: blocksProp,
  getBlocks,
  locale = 'en',
  timezone = null,
  headerFormat,
  timestamp = null,
  timestamps,
  onTimestampChange,
  scrollToCurrentTime,
  views,
  getIconSrc,
  directionView: directionViewProp,
  defaultDirectionView,
  onDirectionViewChange: onDirectionViewChangeProp,
  showPalette,
  children,
}: TimeseriesProviderProps) {
  const {
    models,
    loading: catalogLoading,
    error: catalogError,
    lat,
    lon,
    basePath,
  } = useTimeseriesModels()
  const elementGroups = elementGroupsProp ?? DEFAULT_TIMESERIES_ELEMENT_GROUPS
  const hostOwned = blocksProp !== undefined || Boolean(getBlocks)

  const modelControlled = modelProp !== undefined
  const runControlled = runProp !== undefined
  const elementGroupControlled = elementGroupProp !== undefined
  const directionControlled = directionViewProp !== undefined

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

  const [internalElementGroup, setInternalElementGroup] = useState(() =>
    resolveInitialElementGroup(
      elementGroupProp,
      defaultElementGroup,
      elementGroups,
    ),
  )
  const elementGroup = elementGroupControlled
    ? elementGroupProp
    : internalElementGroup

  const [internalDirectionView, setInternalDirectionView] =
    useState<TimeseriesDirectionView>(
      directionViewProp ?? defaultDirectionView ?? DEFAULT_DIRECTION_VIEW,
    )
  const directionView = directionControlled
    ? directionViewProp
    : internalDirectionView

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

  const onElementGroupChange = useCallback(
    (key: string) => {
      if (!elementGroupControlled) {
        setInternalElementGroup(key)
      }
      onElementGroupChangeProp?.(key)
    },
    [elementGroupControlled, onElementGroupChangeProp],
  )

  const onDirectionViewChange = useCallback(
    (view: TimeseriesDirectionView) => {
      if (!directionControlled) {
        setInternalDirectionView(view)
      }
      onDirectionViewChangeProp?.(view)
    },
    [directionControlled, onDirectionViewChangeProp],
  )

  const [forecastBlocks, setForecastBlocks] = useState<TimeseriesBlock[]>([])
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
      setForecastBlocks([])
      setForecastLoading(false)
      setForecastError(null)
      return
    }

    const controller = new AbortController()
    setForecastLoading(true)
    setForecastError(null)

    fetchTimeseriesBlocks({
      basePath,
      lat,
      lon,
      model: selected,
      run,
      group,
      signal: controller.signal,
    })
      .then((next) => {
        setForecastBlocks(next)
        setForecastLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') {
          return
        }
        setForecastError(err instanceof Error ? err : new Error(String(err)))
        setForecastBlocks([])
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
    lon,
    model,
    models,
    run,
  ])

  const blocks = useMemo(() => {
    if (blocksProp !== undefined) {
      return blocksProp
    }
    if (getBlocks) {
      return getBlocks({ model, run, elementGroup, models, elementGroups })
    }
    return forecastBlocks
  }, [
    blocksProp,
    elementGroup,
    elementGroups,
    forecastBlocks,
    getBlocks,
    model,
    models,
    run,
  ])

  const loading = catalogLoading || (!hostOwned && forecastLoading)
  const error = catalogError ?? forecastError

  const value = useMemo<TimeseriesContextValue>(
    () => ({
      models,
      model,
      onModelChange,
      run,
      onRunChange,
      elementGroups,
      elementGroup,
      onElementGroupChange,
      blocks,
      loading,
      error,
      locale,
      timezone,
      headerFormat,
      timestamp,
      timestamps: timestamps ?? [],
      onTimestampChange,
      scrollToCurrentTime,
      views,
      getIconSrc,
      directionView,
      onDirectionViewChange,
      showPalette,
    }),
    [
      blocks,
      directionView,
      elementGroup,
      elementGroups,
      error,
      getIconSrc,
      headerFormat,
      loading,
      locale,
      model,
      models,
      onDirectionViewChange,
      onElementGroupChange,
      onModelChange,
      onRunChange,
      onTimestampChange,
      run,
      scrollToCurrentTime,
      showPalette,
      timestamp,
      timestamps,
      timezone,
      views,
    ],
  )

  return (
    <TimeseriesContext.Provider value={value}>
      {children}
    </TimeseriesContext.Provider>
  )
}

export function useTimeseriesContext(): TimeseriesContextValue | null {
  return useContext(TimeseriesContext)
}

export function useTimeseries(): TimeseriesContextValue {
  const context = useContext(TimeseriesContext)
  if (!context) {
    throw new Error('useTimeseries must be used within a TimeseriesProvider')
  }
  return context
}

export function TimeseriesBlockProvider({
  block,
  children,
}: {
  block: TimeseriesBlock
  children: ReactNode
}) {
  return (
    <TimeseriesBlockContext.Provider value={block}>
      {children}
    </TimeseriesBlockContext.Provider>
  )
}

export function useTimeseriesBlockContext(): TimeseriesBlock | null {
  return useContext(TimeseriesBlockContext)
}

export function useTimeseriesBlock(): TimeseriesBlock {
  const block = useContext(TimeseriesBlockContext)
  if (!block) {
    throw new Error('useTimeseriesBlock must be used within a TimeseriesBuilder')
  }
  return block
}
