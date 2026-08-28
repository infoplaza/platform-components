'use client'

import { type ReactNode } from 'react'
import {
  TimeseriesBuilder,
  TimeseriesChart,
  TimeseriesFooter,
  TimeseriesForecast,
  TimeseriesModelsProvider,
  TimeseriesProvider,
  TimeseriesToolbar,
  useTimeseries,
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
import { AMSTERDAM } from './fixtures'

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
      <div className="ip-platform  overflow-auto rounded-2xl border border-cloud/10 bg-white">
        {children}
      </div>
    </article>
  )
}

function PackagedExample() {
  return (
    <TimeseriesForecast
      lat={AMSTERDAM.lat}
      lon={AMSTERDAM.lon}
      locale="en"
      timezone={null}
      headerFormat={['EEEEEE d MMM', 'HH']}
      scrollToCurrentTime
    />
  )
}

function ChartOnlyExample() {
  return (
    <TimeseriesForecast
      lat={AMSTERDAM.lat}
      lon={AMSTERDAM.lon}
      locale="en"
      timezone={null}
      headerFormat={['EEEEEE d MMM', 'HH']}
      scrollToCurrentTime
      showToolbar={false}
      showFooter={false}
    />
  )
}

function ComposedBody() {
  const { error } = useTimeseries()

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-white dark:bg-dark/90">
      {error ? (
        <div className="px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error.message}
        </div>
      ) : null}
      <TimeseriesToolbar />
      <div className="min-h-0 flex-1 overflow-auto">
        <TimeseriesBuilder>
          <TimeseriesChart />
        </TimeseriesBuilder>
      </div>
      <TimeseriesFooter />
    </div>
  )
}

function ComposedInner() {
  return (
    <TimeseriesProvider
      locale="en"
      timezone={null}
      headerFormat={['EEEEEE d MMM', 'HH']}
      scrollToCurrentTime
    >
      <ComposedBody />
    </TimeseriesProvider>
  )
}

function ComposedExample() {
  return (
    <TimeseriesModelsProvider lat={AMSTERDAM.lat} lon={AMSTERDAM.lon}>
      <ComposedInner />
    </TimeseriesModelsProvider>
  )
}

export default function TimeseriesDemo() {
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
            ModelsProvider, Provider, Toolbar, Builder, Chart, and Footer.
            Models and chart rows are loaded for Amsterdam.
          </p>
        </header>

        <ExampleSection
          title="Packaged"
          description="TimeseriesForecast with toolbar, table, and footer in one component."
          filename={PACKAGED_FILENAME}
          source={PACKAGED_SOURCE}
        >
          <PackagedExample />
        </ExampleSection>

        <ExampleSection
          title="Chart only"
          description="The same packaged forecast with toolbar and footer turned off."
          filename={CHART_ONLY_FILENAME}
          source={CHART_ONLY_SOURCE}
        >
          <ChartOnlyExample />
        </ExampleSection>

        <ExampleSection
          title="Composed"
          description="TimeseriesModelsProvider with Toolbar, Builder, Chart, and Footer assembled by the host."
          filename={COMPOSED_FILENAME}
          source={COMPOSED_SOURCE}
        >
          <ComposedExample />
        </ExampleSection>

        <footer className="flex flex-wrap items-center gap-4 px-0.5 pb-2 text-xs text-dark/60">
          <span>Amsterdam · 52.3676, 4.9041</span>
          <span className="ml-auto">@infoplaza/platform/timeseries</span>
        </footer>
      </div>
    </section>
  )
}
