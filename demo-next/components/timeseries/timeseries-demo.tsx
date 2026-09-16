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
import { DemoExamplesLink } from '../demo/demo-examples-link'
import { INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL } from '../../lib/infoplaza-platform'
import { ViewCodeButton } from '../view-code-dialog'
import {
  CHART_ONLY_FILENAME,
  CHART_ONLY_SOURCE,
  COMPOSED_FILENAME,
  COMPOSED_SOURCE,
  CUSTOM_LOCATION_FILENAME,
  CUSTOM_LOCATION_SOURCE,
  MARINE_FILENAME,
  MARINE_SOURCE,
  PACKAGED_FILENAME,
  PACKAGED_SOURCE,
  PALETTE_FILENAME,
  PALETTE_SOURCE,
} from './examples'
import { AMSTERDAM, NORTH_SEA } from './fixtures'
import { LocationFields } from './location-fields'

function ExampleSection({
  id,
  title,
  description,
  filename,
  source,
  controls,
  children,
}: {
  id: string
  title: string
  description: string
  filename: string
  source: string
  controls?: ReactNode
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
        </div>
        <ViewCodeButton title={`${title} code`} filename={filename} source={source} />
      </div>
      {controls}
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

function MarineExample() {
  return (
    <TimeseriesForecast
      lat={NORTH_SEA.lat}
      lon={NORTH_SEA.lon}
      domain="marine"
      defaultElementGroup="wave"
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

function PaletteToggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <span className="text-sm font-medium text-dark">Palette colors</span>
      <span
        className={
          checked
            ? 'relative h-6 w-10 rounded-full bg-primary'
            : 'relative h-6 w-10 rounded-full bg-cloud-200'
        }
      >
        <span
          className={
            checked
              ? 'absolute top-0.5 left-0.5 h-5 w-5 translate-x-4 rounded-full bg-white'
              : 'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white'
          }
        />
      </span>
    </button>
  )
}

function PaletteExample() {
  const [showPalette, setShowPalette] = useState(false)

  return (
    <ExampleSection
      id="palette"
      title="Palette"
      description="Turn cell palette colors on to color values from the forecast palette. showPalette defaults to false."
      filename={PALETTE_FILENAME}
      source={PALETTE_SOURCE}
      controls={
        <PaletteToggle checked={showPalette} onChange={setShowPalette} />
      }
    >
      <TimeseriesForecast
        lat={AMSTERDAM.lat}
        lon={AMSTERDAM.lon}
        locale="en"
        timezone={null}
        headerFormat={['EEEEEE d MMM', 'HH']}
        scrollToCurrentTime
        showPalette={showPalette}
      />
    </ExampleSection>
  )
}

function CustomLocationExample() {
  const [location, setLocation] = useState(AMSTERDAM)

  return (
    <ExampleSection
      id="custom-location"
      title="Custom location"
      description="Host-owned lat and lon. Pick a place or enter coordinates, then load the forecast for that point."
      filename={CUSTOM_LOCATION_FILENAME}
      source={CUSTOM_LOCATION_SOURCE}
      controls={<LocationFields value={location} onChange={setLocation} />}
    >
      <TimeseriesForecast
        key={`${location.lat},${location.lon}`}
        lat={location.lat}
        lon={location.lon}
        locale="en"
        timezone={null}
        headerFormat={['EEEEEE d MMM', 'HH']}
        scrollToCurrentTime
      />
    </ExampleSection>
  )
}

export default function TimeseriesDemo() {
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
              Timeseries table
            </h1>
            <p className="m-0 text-sm leading-relaxed text-dark/60">
              Use the packaged forecast, hide the toolbar and footer, compose
              ModelsProvider, Provider, Toolbar, Builder, Chart, and Footer, or
              pass your own lat and lon. Toggle palette colors when you want
              default table text and backgrounds. Models and chart rows load
              for the selected point. Marine uses domain=&quot;marine&quot; and
              the North Sea catalog.
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
          description="TimeseriesForecast with toolbar, table, and footer in one component."
          filename={PACKAGED_FILENAME}
          source={PACKAGED_SOURCE}
        >
          <PackagedExample />
        </ExampleSection>

        <ExampleSection
          id="marine"
          title="Marine"
          description="Same packaged table with domain=&quot;marine&quot; for an offshore North Sea point. Catalog and rows load from the marine timeseries auth routes; the Maritime group is selected."
          filename={MARINE_FILENAME}
          source={MARINE_SOURCE}
        >
          <MarineExample />
        </ExampleSection>

        <PaletteExample />

        <CustomLocationExample />

        <ExampleSection
          id="chart-only"
          title="Chart only"
          description="The same packaged forecast with toolbar and footer turned off."
          filename={CHART_ONLY_FILENAME}
          source={CHART_ONLY_SOURCE}
        >
          <ChartOnlyExample />
        </ExampleSection>

        <ExampleSection
          id="composed"
          title="Composed"
          description="TimeseriesModelsProvider with Toolbar, Builder, Chart, and Footer assembled by the host."
          filename={COMPOSED_FILENAME}
          source={COMPOSED_SOURCE}
        >
          <ComposedExample />
        </ExampleSection>

        <footer className="flex flex-wrap items-center gap-4 px-0.5 pb-2 text-xs text-dark/60">
          <span>lat and lon are required · catalog is location-filtered</span>
          <span className="ml-auto">@infoplaza/platform/timeseries</span>
        </footer>
      </div>
    </section>
  )
}
