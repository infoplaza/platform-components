import { useMemo } from 'react'
import { formatRun, type SupportedLocale } from '@/src/utilities/date'
import TimeseriesPills from './pills'
import type { TimeseriesModel, TimeseriesRun } from './types'
import { toSupportedLocale } from './utils'

export type TimeseriesToolbarProps = {
  models: TimeseriesModel[]
  model: string
  onModelChange: (slug: string) => void
  run: TimeseriesRun
  onRunChange: (run: TimeseriesRun) => void
  locale?: string
}

export default function TimeseriesToolbar({
  models,
  model,
  onModelChange,
  run,
  onRunChange,
  locale = 'en',
}: TimeseriesToolbarProps) {
  const supportedLocale: SupportedLocale = toSupportedLocale(locale)

  const modelItems = useMemo(() => {
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

  const selectedModel = models.find((item) => item.slug === model)
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

  return (
    <div className="ip:flex ip:items-center ip:justify-between ip:gap-2 ip:bg-white ip:px-2 ip:py-2 ip:dark:bg-dark ip:md:px-4">
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
