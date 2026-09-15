import type { ReactNode } from 'react'
import { homeContainerClass, homeSectionClass } from '../home/home-styles'

const CAPABILITIES: {
  title: string
  description: string
  icon: () => ReactNode
}[] = [
  {
    title: 'Forecast, nowcast, climate',
    description: 'Models load through the Platform API for operational weather on the host map.',
    icon: ModelsIcon,
  },
  {
    title: 'Deck.gl layers',
    description: 'Weather is composed onto MapLibre as Deck.gl overlays, not a separate canvas stack.',
    icon: LayersIcon,
  },
  {
    title: 'Rasters',
    description: 'Gridmap rasters for temperature, precipitation, and the rest of the catalog.',
    icon: RasterIcon,
  },
  {
    title: 'Contours',
    description: 'Isolines over the same model fields, aligned with the raster palette.',
    icon: ContourIcon,
  },
  {
    title: 'Particles',
    description: 'Animated particle flow for wind and currents on the live map.',
    icon: ParticleIcon,
  },
  {
    title: 'Wind barbs',
    description: 'Station-style wind barbs at grid points for speed and direction.',
    icon: BarbIcon,
  },
  {
    title: 'Grid values',
    description: 'Numeric values sampled onto the map for inspection and debugging.',
    icon: GridIcon,
  },
  {
    title: 'Storm tracks',
    description: 'Tropical cyclone and storm-track overlays from the same model pipeline.',
    icon: StormIcon,
  },
  {
    title: 'Built-in HUD',
    description: 'Controls for model, element, level, and time without host wiring.',
    icon: HudIcon,
  },
]

export function AboutCapabilities() {
  return (
    <section id="capabilities" className={`${homeSectionClass} pt-0 md:pt-4`}>
      <div className={homeContainerClass}>
        <p className="m-0 text-2xs font-semibold uppercase tracking-widest text-primary">
          What it visualizes
        </p>
        <h2 className="mt-2 mb-0 max-w-2xl text-2xl font-bold tracking-tight text-dark md:text-3xl">
          Forecast models composed into MapLibre weather layers.
        </h2>
        <p className="mt-3 mb-0 max-w-2xl text-sm leading-relaxed text-dark/60">
          The SDK fetches models through the Platform API, then turns them into the overlays
          operators already expect: rasters, contours, particles, barbs, grid values, and tracks.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((capability) => {
            const Icon = capability.icon
            return (
              <article
                key={capability.title}
                className="rounded-xl border border-dark/8 bg-white p-5 shadow-sm"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary-10 text-primary">
                  <Icon />
                </span>
                <h3 className="mt-3 mb-0 text-sm font-semibold text-dark">{capability.title}</h3>
                <p className="mt-1.5 mb-0 text-sm leading-relaxed text-dark/55">
                  {capability.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ModelsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Zm0 2.2 5.6 3.1L12 11.5 6.4 8.3 12 5.2ZM6 10.2l5 2.8v6.3l-5-2.8v-6.3Zm7 9.1v-6.3l5-2.8v6.3l-5 2.8Z"
      />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="m12 4 8 4-8 4-8-4 8-4Zm0 7.2 6.5-3.2 1.5.8-8 4-8-4 1.5-.8 6.5 3.2Zm0 4 6.5-3.2 1.5.8-8 4-8-4 1.5-.8 6.5 3.2Z"
      />
    </svg>
  )
}

function RasterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
      />
    </svg>
  )
}

function ContourIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Z"
      />
    </svg>
  )
}

function ParticleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm7-2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm7 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8 13.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm8 1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
      />
    </svg>
  )
}

function BarbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 12h11.2l-3.1-3.1 1.4-1.4 5.5 5.5-5.5 5.5-1.4-1.4 3.1-3.1H5V12Z"
      />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 4h16v16H4V4Zm2 2v3h3V6H6Zm5 0v3h3V6h-3Zm5 0v3h3V6h-3ZM6 11v3h3v-3H6Zm5 0v3h3v-3h-3Zm5 0v3h3v-3h-3ZM6 16v3h3v-3H6Zm5 0v3h3v-3h-3Zm5 0v3h3v-3h-3Z"
      />
    </svg>
  )
}

function StormIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.2 3.5 7 12h5.2l-1.4 8.5 8.2-11.2h-5.4l2.2-6H11.2Z"
      />
    </svg>
  )
}

function HudIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 6h16v4H4V6Zm0 6h7v6H4v-6Zm9 0h7v6h-7v-6Z"
      />
    </svg>
  )
}
