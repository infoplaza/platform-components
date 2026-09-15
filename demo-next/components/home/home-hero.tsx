import Link from 'next/link'
import { IMWEATHER_URL } from '../../lib/infoplaza-platform'
import { ImWeatherOrigin } from '../imweather-origin'
import { HomeBrowserFrame } from './home-browser-frame'
import { HomeCopyCommand } from './home-copy-command'
import { MapProductMock } from './home-product-mocks'
import {
  homeContainerClass,
  homePrimaryButtonClass,
  homeSecondaryButtonClass,
} from './home-styles'

const INSTALL_COMMAND = 'npm install @infoplaza/platform maplibre-gl'

export function HomeHero() {
  return (
    <section className="relative overflow-hidden px-4 pt-12 pb-16 md:px-6 md:pt-20 md:pb-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(0,191,120,0.16),transparent_42%),radial-gradient(circle_at_10%_80%,rgba(0,112,222,0.12),transparent_40%)]"
        aria-hidden="true"
      />
      <div className={`${homeContainerClass} relative grid min-w-0 items-center gap-12 lg:grid-cols-2`}>
        <div className="min-w-0 max-w-xl">
          <a
            href={IMWEATHER_URL}
            className="m-0 text-2xs font-semibold uppercase tracking-widest text-primary no-underline hover:text-[#00a86a]"
            rel="noreferrer"
            target="_blank"
          >
            Based on ImWeather
          </a>
          <h1 className="mt-3 mb-0 text-3xl font-bold tracking-tight text-balance text-dark sm:text-4xl md:text-5xl">
            Turn operational weather into a product surface.
          </h1>
          <p className="mt-4 mb-0 text-base leading-relaxed text-pretty text-dark/65">
            <code className="font-mono text-sm text-dark">@infoplaza/platform</code> ships a
            MapLibre map with weather layers, a portable forecast table, and ensemble plume
            charts — drop-in React building blocks on top of the Infoplaza Platform APIs.
          </p>
          <ImWeatherOrigin />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/demo" className={homePrimaryButtonClass}>
              See the live demo
            </Link>
            <Link href="/documentation" className={homeSecondaryButtonClass}>
              Read the docs
            </Link>
          </div>
          <div className="mt-6">
            <HomeCopyCommand command={INSTALL_COMMAND} />
          </div>
        </div>

        <div>
          <HomeBrowserFrame url="platform-components.vercel.app/demo">
            <MapProductMock />
          </HomeBrowserFrame>
        </div>
      </div>
    </section>
  )
}
