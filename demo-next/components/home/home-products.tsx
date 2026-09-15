import type { ReactNode } from 'react'
import Link from 'next/link'
import { HomeBrowserFrame } from './home-browser-frame'
import {
  EnsembleProductMock,
  MapProductMock,
  TimeseriesProductMock,
} from './home-product-mocks'
import { homeContainerClass, homeSectionClass } from './home-styles'

const PRODUCTS: {
  id: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  href: string
  demoLabel: string
  url: string
  reverse?: boolean
  mock: ReactNode
}[] = [
  {
    id: 'map',
    eyebrow: 'Map',
    title: 'Weather on MapLibre, without the wiring.',
    description:
      'PlatformMap is the general map shell. WeatherLayers adds providers, events, the Deck overlay, and an optional HUD.',
    bullets: [
      'Packaged WeatherLayers for new integrations',
      'Compose Providers, LayerComposer, and MapControlHud when you need control',
      'Host-owned view state, styles, and MapLibre worker setup',
    ],
    href: '/demo',
    demoLabel: 'Open the map demo',
    url: 'platform-components.vercel.app/demo',
    mock: <MapProductMock />,
  },
  {
    id: 'timeseries',
    eyebrow: 'Timeseries',
    title: 'A portable forecast table for any point.',
    description:
      'TimeseriesForecast loads a location-filtered model catalog and point-forecast rows through PlatformAuth. Pass lat and lon — or compose the table yourself.',
    bullets: [
      'Toolbar, table, and footer in one packaged component',
      'Optional palette colors for cell values',
      'Host-owned location, or override rows with blocks / getBlocks',
    ],
    href: '/demo/timeseries',
    demoLabel: 'Open the timeseries demo',
    url: 'platform-components.vercel.app/demo/timeseries',
    reverse: true,
    mock: <TimeseriesProductMock />,
  },
  {
    id: 'ensemble',
    eyebrow: 'Ensemble',
    title: 'Plume charts for model spread, not a single line.',
    description:
      'EnsembleForecast renders Recharts plume, line, and bar graphs from the ensemble catalog and point-forecast API — a sibling product to the map and timeseries table.',
    bullets: [
      'Models catalog from GET /api/platform/ensemble-models',
      'Chart series from ensemble-point-forecast, or pass charts / getCharts',
      'Packaged forecast, chart-only, or a composed Toolbar + Chart + Footer',
    ],
    href: '/demo/ensemble',
    demoLabel: 'Open the ensemble demo',
    url: 'platform-components.vercel.app/demo/ensemble',
    mock: <EnsembleProductMock />,
  },
]

export function HomeProducts() {
  return (
    <section id="products" className={homeSectionClass}>
      <div className={homeContainerClass}>
        <p className="m-0 text-2xs font-semibold uppercase tracking-widest text-primary">
          What you can ship
        </p>
        <h2 className="mt-2 mb-0 max-w-xl text-2xl font-bold tracking-tight text-dark md:text-3xl">
          Map, timeseries, and ensemble — sibling products, one package.
        </h2>
        <div className="mt-14 flex flex-col gap-20">
          {PRODUCTS.map((product) => (
            <article
              key={product.id}
              id={product.id}
              className="grid min-w-0 items-center gap-10 lg:grid-cols-2"
            >
              <div className={product.reverse ? 'min-w-0 lg:order-2' : 'min-w-0'}>
                <p className="m-0 text-2xs font-semibold uppercase tracking-widest text-marine">
                  {product.eyebrow}
                </p>
                <h3 className="mt-2 mb-0 text-xl font-semibold tracking-tight text-dark">
                  {product.title}
                </h3>
                <p className="mt-3 mb-0 text-sm leading-relaxed text-dark/60">
                  {product.description}
                </p>
                <ul className="mt-4 mb-0 list-none space-y-2 p-0">
                  {product.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-sm text-dark/70">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  href={product.href}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary no-underline hover:text-[#00a86a]"
                >
                  {product.demoLabel}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className={product.reverse ? 'min-w-0 lg:order-1' : 'min-w-0'}>
                <HomeBrowserFrame url={product.url}>{product.mock}</HomeBrowserFrame>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
