'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  TimeseriesBuilder,
  TimeseriesChart,
  TimeseriesFooter,
  TimeseriesForecast,
  TimeseriesProvider,
  TimeseriesToolbar,
  type TimeseriesModel,
  type TimeseriesRun,
} from '@infoplaza/platform/timeseries'
import { ViewCodeButton } from '../view-code-dialog'
import {
  CHART_ONLY_FILENAME,
  CHART_ONLY_SOURCE,
  COMPOSED_FILENAME,
  COMPOSED_SOURCE,
  PACKAGED_FILENAME,
  PACKAGED_SOURCE,
} from './examples'
import {
  getTimeseriesBlocks,
  TIMESERIES_ELEMENT_GROUPS,
  TIMESERIES_MODELS,
  withRuntimes,
} from './fixtures'

function useFixtureModels() {
  return useMemo(() => withRuntimes(TIMESERIES_MODELS), [])
}

function ExampleSection({
  title,
  description,
  filename,
  source,
  children,
}: {
  title: string
  description: string
  filename: string
  source: string
  children: ReactNode
}) {
  return (
    <article className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 text-base font-semibold tracking-tight text-dark">
            {title}
          </h2>
          <p className="m-0 mt-1 text-sm leading-relaxed text-dark/60">
            {description}
          </p>
        </div>
        <ViewCodeButton title={`${title} code`} filename={filename} source={source} />
      </div>
      <div className="ip-platform min-h-70 overflow-auto rounded-2xl border border-cloud/10 bg-white">
        {children}
      </div>
    </article>
  )
}

function PackagedExample({ models }: { models: TimeseriesModel[] }) {
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
    <TimeseriesForecast
      models={models}
      model={model}
      onModelChange={(slug: string) => {
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
  )
}

function ChartOnlyExample({ models }: { models: TimeseriesModel[] }) {
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
    <TimeseriesForecast
      models={models}
      model={model}
      onModelChange={setModel}
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
      showToolbar={false}
      showFooter={false}
    />
  )
}

function ComposedExample({ models }: { models: TimeseriesModel[] }) {
  return (
    <TimeseriesProvider
      models={models}
      elementGroups={TIMESERIES_ELEMENT_GROUPS}
      getBlocks={getTimeseriesBlocks}
      locale="en"
      timezone={null}
      headerFormat={['EEEEEE d MMM', 'HH']}
      scrollToCurrentTime
    >
      <div className="flex h-full min-h-0 w-full flex-col bg-white dark:bg-dark/90">
        <TimeseriesToolbar />
        <div className="min-h-0 flex-1 overflow-auto">
          <TimeseriesBuilder>
            <TimeseriesChart />
          </TimeseriesBuilder>
        </div>
        <TimeseriesFooter />
      </div>
    </TimeseriesProvider>
  )
}

export default function TimeseriesDemo() {
  const models = useFixtureModels()

  return (
    <section className="h-full overflow-auto p-4 md:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="max-w-xl">
          <p className="mb-1.5 text-2xs font-semibold uppercase tracking-widest text-primary">
            I&apos;m Weather
          </p>
          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-dark">
            Timeseries table
          </h1>
          <p className="m-0 text-sm leading-relaxed text-dark/60">
            Use the packaged forecast, hide the toolbar and footer, or compose
            Provider, Toolbar, Builder, Chart, and Footer yourself. Hosts
            supply already-shaped rows.
          </p>
        </header>

        <ExampleSection
          title="Packaged"
          description="TimeseriesForecast with toolbar, table, and footer in one component."
          filename={PACKAGED_FILENAME}
          source={PACKAGED_SOURCE}
        >
          <PackagedExample models={models} />
        </ExampleSection>

        <ExampleSection
          title="Chart only"
          description="The same packaged forecast with toolbar and footer turned off."
          filename={CHART_ONLY_FILENAME}
          source={CHART_ONLY_SOURCE}
        >
          <ChartOnlyExample models={models} />
        </ExampleSection>

        <ExampleSection
          title="Composed"
          description="TimeseriesProvider with Toolbar, Builder, Chart, and Footer assembled by the host."
          filename={COMPOSED_FILENAME}
          source={COMPOSED_SOURCE}
        >
          <ComposedExample models={models} />
        </ExampleSection>

        <footer className="flex flex-wrap items-center gap-4 px-0.5 pb-2 text-xs text-dark/60">
          <span>Fixture data · Amsterdam</span>
          <span className="ml-auto">@infoplaza/platform/timeseries</span>
        </footer>
      </div>
    </section>
  )
}
