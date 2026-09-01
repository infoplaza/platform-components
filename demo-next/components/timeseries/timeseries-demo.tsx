'use client'

import { type ReactNode, useState } from 'react'
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
  const [fullWidth, setFullWidth] = useState(false)

  return (
    <section className="h-full overflow-auto p-4 md:p-6">
      <div
        className={
          fullWidth
            ? 'mx-auto flex w-full flex-col gap-10'
            : 'mx-auto flex max-w-7xl flex-col gap-10'
        }
      >
        <div className="flex flex-wrap items-end justify-between gap-5">
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
          <button
            type="button"
            role="switch"
            aria-checked={fullWidth}
            onClick={() => setFullWidth((value) => !value)}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <span className="text-sm font-medium text-dark">Full width</span>
            <span
              className={
                fullWidth
                  ? 'relative h-6 w-10 rounded-full bg-primary'
                  : 'relative h-6 w-10 rounded-full bg-cloud-200'
              }
            >
              <span
                className={
                  fullWidth
                    ? 'absolute top-0.5 left-0.5 h-5 w-5 translate-x-4 rounded-full bg-white'
                    : 'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white'
                }
              />
            </span>
          </button>
        </div>

        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-gold/35 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-dark"
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-gold"
          >
            <path
              d="M8 1.75a6.25 6.25 0 1 1 0 12.5 6.25 6.25 0 0 1 0-12.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8 7.25V11M8 5.25v.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <p className="m-0">
            Visualization data color is in progress and will be available in the
            next release.
          </p>
        </div>

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
