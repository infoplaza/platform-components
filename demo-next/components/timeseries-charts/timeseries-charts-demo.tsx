'use client'

import { type ReactNode, useState } from 'react'
import {
  TimeseriesChartsBuilder,
  TimeseriesChartsChart,
  TimeseriesChartsForecast,
  TimeseriesChartsProvider,
  TimeseriesChartsToolbar,
  TimeseriesModelsProvider,
  useTimeseriesCharts,
} from '@infoplaza/platform/timeseries-charts'
import { DemoExamplesLink } from '../demo/demo-examples-link'
import { INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL } from '../../lib/infoplaza-platform'
import { ViewCodeButton } from '../view-code-dialog'
import {
  CHART_ONLY_FILENAME,
  CHART_ONLY_SOURCE,
  COMPOSED_FILENAME,
  COMPOSED_SOURCE,
  MARINE_FILENAME,
  MARINE_SOURCE,
  PACKAGED_FILENAME,
  PACKAGED_SOURCE,
} from './examples'

type DemoLocation = {
  lat: number
  lon: number
  place: string
}

const AMSTERDAM: DemoLocation = {
  lat: 52.3676,
  lon: 4.9041,
  place: 'Amsterdam',
}

const NORTH_SEA: DemoLocation = {
  lat: 55.551448725742,
  lon: 4.0444930642829116,
  place: 'North Sea',
}

function locationLabel(location: DemoLocation) {
  return `${location.place} · lat ${location.lat} · lon ${location.lon}`
}

function LocationCaption({ location }: { location: DemoLocation }) {
  return (
    <p className="m-0 text-xs tabular-nums text-dark/50">
      Forecast point: {locationLabel(location)}
    </p>
  )
}

function ExampleSection({
  id,
  title,
  description,
  filename,
  source,
  location,
  children,
}: {
  id: string
  title: string
  description: string
  filename: string
  source: string
  location: DemoLocation
  children: ReactNode
}) {
  return (
    <article id={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 text-base font-semibold tracking-tight text-dark">
            {title}
          </h2>
          <p className="m-0 mt-1 text-sm leading-relaxed text-dark/60">
            {description}
          </p>
          <div className="mt-1.5">
            <LocationCaption location={location} />
          </div>
        </div>
        <ViewCodeButton title={`${title} code`} filename={filename} source={source} />
      </div>
      <div className="ip-platform overflow-auto rounded-2xl border border-cloud/10 bg-white">
        {children}
      </div>
    </article>
  )
}

function ExamplePlaceholder({
  id,
  title,
  description,
}: {
  id: string
  title: string
  description: string
}) {
  return (
    <article id={id} className="flex scroll-mt-4 flex-col gap-3">
      <div>
        <h2 className="m-0 text-base font-semibold tracking-tight text-dark">
          {title}
        </h2>
        <p className="m-0 mt-1 text-sm leading-relaxed text-dark/60">
          {description}
        </p>
      </div>
      <div className="flex min-h-100 items-center justify-center overflow-hidden rounded-2xl border border-cloud/10 bg-cloud-100">
        <p className="m-0 text-sm text-dark/60">… in progress</p>
      </div>
    </article>
  )
}

function PackagedExample() {
  return (
    <TimeseriesChartsForecast
      lat={AMSTERDAM.lat}
      lon={AMSTERDAM.lon}
      model="gfs"
      locale="en"
      timezone={null}
    />
  )
}

function MarineExample() {
  return (
    <TimeseriesChartsForecast
      lat={NORTH_SEA.lat}
      lon={NORTH_SEA.lon}
      domain="marine"
      model="gfswave"
      locale="en"
      timezone={null}
    />
  )
}

function ChartOnlyExample() {
  return (
    <TimeseriesChartsForecast
      lat={AMSTERDAM.lat}
      lon={AMSTERDAM.lon}
      locale="en"
      model="gfs"
      timezone={null}
      showToolbar={false}
    />
  )
}

function ComposedBody() {
  const { error } = useTimeseriesCharts()

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-white dark:bg-dark/90">
      {error ? (
        <div className="px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error.message}
        </div>
      ) : null}
      <TimeseriesChartsToolbar />
      <div className="min-h-0 flex-1 overflow-auto">
        <TimeseriesChartsBuilder>
          <TimeseriesChartsChart />
        </TimeseriesChartsBuilder>
      </div>
    </div>
  )
}

function ComposedExample() {
  return (
    <TimeseriesModelsProvider lat={AMSTERDAM.lat} lon={AMSTERDAM.lon}>
      <TimeseriesChartsProvider locale="en" timezone={null}>
        <ComposedBody />
      </TimeseriesChartsProvider>
    </TimeseriesModelsProvider>
  )
}

export default function TimeseriesChartsDemo() {
  const [fullWidth, setFullWidth] = useState(true)

  return (
    <section className="p-4 md:p-6">
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
              Timeseries charts
            </h1>
            <p className="m-0 text-sm leading-relaxed text-dark/60">
              Point-forecast series as Recharts composed charts. Each config
              group is one chart: LINE series in the plot, DIRECTION arrows,
              VALUE labels, and PRECIPITATION_TYPE icons in the axis strip.
              Packaged examples use{' '}
              {locationLabel(AMSTERDAM)}; the marine example uses an offshore
              North Sea point.
            </p>
            <DemoExamplesLink href={INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL} />
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
          id="packaged"
          title="Packaged"
          description="TimeseriesChartsForecast with toolbar and stacked group charts."
          filename={PACKAGED_FILENAME}
          source={PACKAGED_SOURCE}
          location={AMSTERDAM}
        >
          <PackagedExample />
        </ExampleSection>

        <ExampleSection
          id="marine"
          title="Marine"
          description="The same packaged wind and wave charts for an offshore North Sea point, with domain=&quot;marine&quot; so models and series load from the marine timeseries auth routes."
          filename={MARINE_FILENAME}
          source={MARINE_SOURCE}
          location={NORTH_SEA}
        >
          <MarineExample />
        </ExampleSection>

        <ExampleSection
          id="chart-only"
          title="Chart only"
          description="The same packaged forecast with the toolbar turned off."
          filename={CHART_ONLY_FILENAME}
          source={CHART_ONLY_SOURCE}
          location={AMSTERDAM}
        >
          <ChartOnlyExample />
        </ExampleSection>

        <ExampleSection
          id="composed"
          title="Composed"
          description="TimeseriesModelsProvider with Toolbar, Builder, and Chart assembled by the host."
          filename={COMPOSED_FILENAME}
          source={COMPOSED_SOURCE}
          location={AMSTERDAM}
        >
          <ComposedExample />
        </ExampleSection>

        <ExamplePlaceholder
          id="custom-elements"
          title="Custom elements"
          description="Host-owned elementGroups — pick which series appear in each composed chart."
        />

        <footer className="flex flex-wrap items-center gap-4 px-0.5 pb-2 text-xs text-dark/60">
          <span>
            lat and lon are required · catalog is location-filtered · live point
            forecast
          </span>
          <span className="ml-auto">@infoplaza/platform/timeseries-charts</span>
        </footer>
      </div>
    </section>
  )
}
