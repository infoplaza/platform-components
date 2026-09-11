'use client'

import { type ReactNode, useState } from 'react'
import {
  MAP_STYLES,
  PlatformMap,
  WeatherLayers,
  usePlatformMap,
} from '@infoplaza/platform/components'
import { ViewCodeButton } from '../view-code-dialog'
import {
  BARE_MAP_FILENAME,
  BARE_MAP_SOURCE,
  WEATHER_MAP_FILENAME,
  WEATHER_MAP_SOURCE,
} from './examples'
import { StylePicker } from './style-picker'

const customStyle = {
  key: 'demotiles',
  title: 'MapLibre Demo',
  styles: {
    default: {
      source: 'https://demotiles.maplibre.org/style.json',
      beforeId: '',
    },
    marine: {
      source: 'https://demotiles.maplibre.org/style.json',
      beforeId: '',
    },
  },
}

const mapStyles = [...MAP_STYLES, customStyle]

const DEFAULT_VIEW_STATE = {
  longitude: 4.9041,
  latitude: 52.3676,
  zoom: 7,
}

const WEATHER_CONFIG = {
  model: 'optimal',
  element: 'temperature',
  run: 'latest',
  member: '0',
  level: '2m',
} as const

function resolveMoveViewState(event: unknown): typeof DEFAULT_VIEW_STATE | null {
  if (typeof event !== 'object' || event === null || !('viewState' in event)) {
    return null
  }

  const viewState = (event as { viewState?: unknown }).viewState
  if (typeof viewState !== 'object' || viewState === null) {
    return null
  }

  const { longitude, latitude, zoom } = viewState as Record<string, unknown>
  if (
    typeof longitude !== 'number' ||
    typeof latitude !== 'number' ||
    typeof zoom !== 'number'
  ) {
    return null
  }

  return { longitude, latitude, zoom }
}

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
      <div className="ip-platform min-h-70 overflow-hidden rounded-2xl border border-cloud/10 bg-cloud-100">
        {children}
      </div>
    </article>
  )
}

function FlyToAmsterdamButton() {
  const { map } = usePlatformMap()

  return (
    <button
      type="button"
      disabled={!map}
      onClick={() => {
        map?.flyTo({
          center: [4.9041, 52.3676],
          zoom: 10,
          essential: true,
        })
      }}
      className="rounded-md border border-cloud/20 bg-white px-3 py-1.5 text-sm font-medium text-dark disabled:opacity-50"
    >
      Fly to Amsterdam
    </button>
  )
}

function BareMapExample({
  mapStyleKey,
}: {
  mapStyleKey: string
}) {
  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE)

  return (
    <div className="relative h-70 w-full">
      <PlatformMap
        viewState={viewState}
        onMove={(event) => {
          const next = resolveMoveViewState(event)
          if (next) {
            setViewState(next)
          }
        }}
        mapStyles={mapStyles}
        mapStyleKey={mapStyleKey}
      >
        <div className="pointer-events-none absolute top-3 left-3 z-10">
          <div className="pointer-events-auto">
            <FlyToAmsterdamButton />
          </div>
        </div>
      </PlatformMap>
    </div>
  )
}

function WeatherMapExample({
  mapStyleKey,
}: {
  mapStyleKey: string
}) {
  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE)

  return (
    <div className="relative h-100 w-full">
      <PlatformMap
        viewState={viewState}
        onMove={(event) => {
          const next = resolveMoveViewState(event)
          if (next) {
            setViewState(next)
          }
        }}
        mapStyles={mapStyles}
        mapStyleKey={mapStyleKey}
      >
        <WeatherLayers
          weatherConfig={WEATHER_CONFIG}
          modelsConfig={{ apiEnv: 'prod', betaModels: false }}
          showHud
          hudProps={{ viewState }}
        />
      </PlatformMap>
    </div>
  )
}

export default function PlatformMapDemo() {
  const [bareStyleKey, setBareStyleKey] = useState('dark')
  const [weatherStyleKey, setWeatherStyleKey] = useState('dark')

  return (
    <section className="h-full overflow-auto p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-xl">
          <p className="mb-1.5 text-2xs font-semibold uppercase tracking-widest text-primary">
            I&apos;m Weather
          </p>
          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-dark">
            Map
          </h1>
          <p className="m-0 text-sm leading-relaxed text-dark/60">
            PlatformMap is the general map shell. Add host layers via{' '}
            <code className="text-xs">usePlatformMap()</code>, and mount
            WeatherLayers when you need forecast overlays and the HUD.
          </p>
        </header>

        <ExampleSection
          title="Without weather"
          description="Bare PlatformMap with style picker and an imperative flyTo via usePlatformMap()."
          filename={BARE_MAP_FILENAME}
          source={BARE_MAP_SOURCE}
          controls={
            <StylePicker
              value={bareStyleKey}
              options={mapStyles}
              onChange={setBareStyleKey}
            />
          }
        >
          <BareMapExample mapStyleKey={bareStyleKey} />
        </ExampleSection>

        <ExampleSection
          title="With weather"
          description="PlatformMap plus WeatherLayers (Providers, events, Deck overlay, HUD) — same weather setup as Map Old."
          filename={WEATHER_MAP_FILENAME}
          source={WEATHER_MAP_SOURCE}
          controls={
            <StylePicker
              value={weatherStyleKey}
              options={mapStyles}
              onChange={setWeatherStyleKey}
            />
          }
        >
          <WeatherMapExample mapStyleKey={weatherStyleKey} />
        </ExampleSection>

        <footer className="flex flex-wrap items-center gap-4 px-0.5 pb-2 text-xs text-dark/60">
          <span>PlatformMap shell · WeatherLayers optional</span>
          <span className="ml-auto">@infoplaza/platform/components</span>
        </footer>
      </div>
    </section>
  )
}
