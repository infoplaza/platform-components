'use client'

import { type ReactNode, useState } from 'react'
import {
  EnsembleBuilder,
  EnsembleChart,
  EnsembleFooter,
  EnsembleForecast,
  EnsembleModelsProvider,
  EnsembleProvider,
  EnsembleToolbar,
  useEnsemble,
} from '@infoplaza/platform/ensemble'
import { ViewCodeButton } from '../view-code-dialog'
import {
  CHART_ONLY_FILENAME,
  CHART_ONLY_SOURCE,
  COMPOSED_FILENAME,
  COMPOSED_SOURCE,
  PACKAGED_FILENAME,
  PACKAGED_SOURCE,
} from './examples'

const AMSTERDAM = { lat: 52.3676, lon: 4.9041 }

function ExampleSection({
  title,
  description,
  filename,
  source,
  controls,
  children,
}: {
  title: string
  description: string
  filename: string
  source: string
  controls?: ReactNode
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
      {controls}
      <div className="ip-platform overflow-auto rounded-2xl border border-cloud/10 bg-white">
        {children}
      </div>
    </article>
  )
}

function PackagedExample() {
  return (
    <EnsembleForecast
      lat={AMSTERDAM.lat}
      lon={AMSTERDAM.lon}
      locale="en"
      timezone={null}
    />
  )
}

function ChartOnlyExample() {
  return (
    <EnsembleForecast
      lat={AMSTERDAM.lat}
      lon={AMSTERDAM.lon}
      locale="en"
      timezone={null}
      showToolbar={false}
      showFooter={false}
    />
  )
}

function ComposedBody() {
  const { error } = useEnsemble()

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-white dark:bg-dark/90">
      {error ? (
        <div className="px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error.message}
        </div>
      ) : null}
      <EnsembleToolbar />
      <div className="min-h-0 flex-1 overflow-auto">
        <EnsembleBuilder>
          <EnsembleChart />
        </EnsembleBuilder>
      </div>
      <EnsembleFooter />
    </div>
  )
}

function ComposedExample() {
  return (
    <EnsembleModelsProvider lat={AMSTERDAM.lat} lon={AMSTERDAM.lon}>
      <EnsembleProvider locale="en" timezone={null}>
        <ComposedBody />
      </EnsembleProvider>
    </EnsembleModelsProvider>
  )
}

export default function EnsembleDemo() {
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
              Ensemble charts
            </h1>
            <p className="m-0 text-sm leading-relaxed text-dark/60">
              Use the packaged forecast, hide the toolbar and footer, or compose
              ModelsProvider, Provider, Toolbar, Builder, Chart, and Footer.
              Models and chart series load from PlatformAuth for the selected
              point. Switch Basic / Expert in the footer.
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

        <ExampleSection
          title="Packaged"
          description="EnsembleForecast with toolbar, charts, and footer in one component. Models and chart series load from PlatformAuth."
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
          description="EnsembleModelsProvider with Toolbar, Builder, Chart, and Footer assembled by the host."
          filename={COMPOSED_FILENAME}
          source={COMPOSED_SOURCE}
        >
          <ComposedExample />
        </ExampleSection>

        <footer className="flex flex-wrap items-center gap-4 px-0.5 pb-2 text-xs text-dark/60">
          <span>lat and lon are required · catalog is location-filtered · live point forecast</span>
          <span className="ml-auto">@infoplaza/platform/ensemble</span>
        </footer>
      </div>
    </section>
  )
}
