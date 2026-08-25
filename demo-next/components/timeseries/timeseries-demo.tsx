'use client'

import { useMemo, useState } from 'react'
import {
  TimeseriesForecast,
  type TimeseriesRun,
} from '@infoplaza/platform/timeseries'
import {
  getTimeseriesBlocks,
  TIMESERIES_ELEMENT_GROUPS,
  TIMESERIES_MODELS,
  withRuntimes,
} from './fixtures'

export default function TimeseriesDemo() {
  const models = useMemo(() => withRuntimes(TIMESERIES_MODELS), [])
  const [model, setModel] = useState(models[0]?.slug ?? 'harmonie')
  const [run, setRun] = useState<TimeseriesRun>(
    models[0]?.runtimes[0] ?? 'all',
  )
  const [elementGroup, setElementGroup] = useState(
    TIMESERIES_ELEMENT_GROUPS[0]?.key ?? 'overview',
  )

  const blocks = useMemo(
    () => getTimeseriesBlocks({ model, run, elementGroup, models }),
    [elementGroup, model, models, run],
  )

  return (
    <section className="flex h-full min-h-0 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <header className="max-w-xl">
          <p className="mb-1.5 text-2xs font-semibold uppercase tracking-widest text-primary">
            I&apos;m Weather
          </p>
          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-dark">
            Timeseries table
          </h1>
          <p className="m-0 text-sm leading-relaxed text-dark/60">
            A portable forecast table from I&apos;m Weather — the same chrome you
            would drop into your own app. Hosts supply already-shaped rows.
          </p>
        </header>
        <code className="rounded-md bg-dark/5 px-2.5 py-1.5 text-2xs text-dark/70">
          {"import { TimeseriesForecast } from '@infoplaza/platform/timeseries'"}
        </code>
      </div>

      <div className="ip-platform min-h-70 flex-1 overflow-auto rounded-2xl border border-cloud/10 bg-white">
        <TimeseriesForecast
          models={models}
          model={model}
          onModelChange={(slug) => {
            setModel(slug)
            const next = models.find((item) => item.slug === slug)
            if (next?.runtimes[0]) {
              setRun(next.runtimes[0])
            }
          }}
          run={run}
          onRunChange={setRun}
          elementGroups={TIMESERIES_ELEMENT_GROUPS}
          elementGroup={elementGroup}
          onElementGroupChange={setElementGroup}
          blocks={blocks}
          locale="en"
          timezone={null}
          headerFormat={['EEEEEE d MMM', 'HH']}
          scrollToCurrentTime
        />
      </div>

      <footer className="flex flex-wrap items-center gap-4 px-0.5 text-xs text-dark/60">
        <span>Fixture data · Amsterdam</span>
        <span className="ml-auto">@infoplaza/platform/timeseries</span>
      </footer>
    </section>
  )
}
