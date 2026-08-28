import { useMemo } from 'react'
import { formatRun, type SupportedLocale } from '@/src/utilities/date'
import { useTimeseriesContext } from './context'
import TimeseriesPills from './pills'
import type { TimeseriesRun } from './types'
import { toSupportedLocale } from './utils'

export type TimeseriesToolbarProps = {
  model?: string
  onModelChange?: (slug: string) => void
  run?: TimeseriesRun
  onRunChange?: (run: TimeseriesRun) => void
  locale?: string
}

export default function TimeseriesToolbar({
  model: modelProp,
  onModelChange: onModelChangeProp,
  run: runProp,
  onRunChange: onRunChangeProp,
  locale: localeProp,
}: TimeseriesToolbarProps) {
  const ctx = useTimeseriesContext()
  const models = ctx?.models
  const model = modelProp ?? ctx?.model
  const onModelChange = onModelChangeProp ?? ctx?.onModelChange
  const run = runProp ?? ctx?.run
  const onRunChange = onRunChangeProp ?? ctx?.onRunChange
  const locale = localeProp ?? ctx?.locale ?? 'en'

  const supportedLocale: SupportedLocale = toSupportedLocale(locale)

  const modelItems = useMemo(() => {
    if (!models || model == null) {
      return []
    }
    return [...models]
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((item) => ({
        title: item.title,
        value: item.slug,
        active: item.slug === model,
        disabled: item.available === false,
        beta: item.isBeta,
      }))
  }, [model, models])

  const selectedModel = models?.find((item) => item.slug === model)
  const runtimes = selectedModel?.runtimes ?? []

  const runItems = useMemo(() => {
    const sorted = [...runtimes].sort((a, b) => b - a)
    return [
      ...(sorted.length > 1
        ? [
            {
              title: 'All',
              value: 'all',
              active: run === 'all',
            },
          ]
        : []),
      ...sorted.map((runtime) => ({
        title: formatRun(runtime, supportedLocale) ?? String(runtime),
        value: String(runtime),
        active: run !== 'all' && Number(run) === runtime,
      })),
    ]
  }, [run, runtimes, supportedLocale])

  if (
    !models ||
    model == null ||
    !onModelChange ||
    run === undefined ||
    !onRunChange
  ) {
    return null
  }

  return (
    <div className="ip:flex ip:items-center ip:justify-between ip:gap-2 ip:bg-white ip:px-2 ip:py-2 ip:dark:bg-dark">
      <TimeseriesPills
        items={modelItems}
        onChange={onModelChange}
        minItems={0}
        maxItems={5}
      />
      {runItems.length > 0 ? (
        <TimeseriesPills
          items={runItems}
          onChange={(value) =>
            onRunChange(value === 'all' ? 'all' : Number(value))
          }
          minItems={0}
          maxItems={2}
        />
      ) : null}
    </div>
  )
}
