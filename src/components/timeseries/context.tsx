import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  TimeseriesBlock,
  TimeseriesContextValue,
  TimeseriesDirectionView,
  TimeseriesProviderProps,
  TimeseriesRun,
} from './types'
import { DEFAULT_DIRECTION_VIEW, latestRuntime } from './utils'

const TimeseriesContext = createContext<TimeseriesContextValue | null>(null)
const TimeseriesBlockContext = createContext<TimeseriesBlock | null>(null)

type TimeseriesModelList = NonNullable<TimeseriesProviderProps['models']>

function resolveInitialModel(
  models: TimeseriesModelList,
  model: string | undefined,
  defaultModel: string | undefined,
): string {
  return model ?? defaultModel ?? models[0]?.slug ?? ''
}

function resolveInitialRun(
  models: TimeseriesModelList,
  model: string,
  run: TimeseriesRun | undefined,
  defaultRun: TimeseriesRun | undefined,
): TimeseriesRun {
  return run ?? defaultRun ?? latestRuntime(models, model) ?? 'all'
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
  models: modelsProp,
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
  loading = false,
  children,
}: TimeseriesProviderProps) {
  const models = modelsProp ?? []
  const elementGroups = elementGroupsProp ?? []

  const modelControlled = modelProp !== undefined
  const runControlled = runProp !== undefined
  const elementGroupControlled = elementGroupProp !== undefined
  const directionControlled = directionViewProp !== undefined

  const [internalModel, setInternalModel] = useState(() =>
    resolveInitialModel(models, modelProp, defaultModel),
  )
  const model = modelControlled ? modelProp : internalModel

  const [internalRun, setInternalRun] = useState<TimeseriesRun>(() =>
    resolveInitialRun(models, model, runProp, defaultRun),
  )
  const run = runControlled ? runProp : internalRun

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
      if (!runControlled) {
        setInternalRun(next)
      }
      onRunChangeProp?.(next)
    },
    [onRunChangeProp, runControlled],
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

  const blocks = useMemo(() => {
    if (blocksProp !== undefined) {
      return blocksProp
    }
    if (getBlocks) {
      return getBlocks({ model, run, elementGroup, models })
    }
    return []
  }, [blocksProp, elementGroup, getBlocks, model, models, run])

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
    }),
    [
      blocks,
      directionView,
      elementGroup,
      elementGroups,
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
