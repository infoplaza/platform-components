import Link from 'next/link'
import { IMWEATHER_URL } from '../../lib/infoplaza-platform'
import { ImWeatherOrigin } from '../imweather-origin'
import { HomeCopyCommand } from '../home/home-copy-command'
import {
  homeContainerClass,
  homePrimaryButtonClass,
  homeSecondaryButtonClass,
} from '../home/home-styles'

const INSTALL_COMMAND = 'npm install @infoplaza/platform maplibre-gl'
const NPM_URL = 'https://www.npmjs.com/package/@infoplaza/platform'
const GITHUB_URL = 'https://github.com/infoplaza/platform-components'

export function AboutHero() {
  return (
    <section className="relative overflow-hidden px-4 pt-12 pb-16 md:px-6 md:pt-20 md:pb-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(0,191,120,0.16),transparent_42%),radial-gradient(circle_at_10%_80%,rgba(0,112,222,0.12),transparent_40%)]"
        aria-hidden="true"
      />
      <div className={`${homeContainerClass} relative max-w-3xl`}>
        <a
          href={IMWEATHER_URL}
          className="m-0 text-2xs font-semibold uppercase tracking-widest text-primary no-underline hover:text-[#00a86a]"
          rel="noreferrer"
          target="_blank"
        >
          Based on ImWeather
        </a>
        <h1 className="mt-3 mb-0 text-3xl font-bold tracking-tight text-balance text-dark sm:text-4xl md:text-5xl">
          @infoplaza/platform
        </h1>
        <p className="mt-4 mb-0 text-base leading-relaxed text-pretty text-dark/65">
          The{' '}
          <a
            href={IMWEATHER_URL}
            className="font-semibold text-dark underline decoration-gold underline-offset-2 hover:text-primary"
            rel="noreferrer"
            target="_blank"
          >
            ImWeather
          </a>{' '}
          SDK (React) for embedding Infoplaza weather visualization on MapLibre maps. It
          loads forecast, nowcast, and climate models through Platform API, then composes
          them into Deck.gl layers, rasters, contours, particles, wind barbs, grid values,
          and storm tracks. With a built-in HUD for model, element, level, and time.
        </p>
        <ImWeatherOrigin />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/demo" className={homePrimaryButtonClass}>
            See the live demo
          </Link>
          <Link href="/documentation" className={homeSecondaryButtonClass}>
            Read the docs
          </Link>
          <a
            href={IMWEATHER_URL}
            className={homeSecondaryButtonClass}
            rel="noreferrer"
            target="_blank"
          >
            ImWeather
          </a>
          <a
            href={NPM_URL}
            className={homeSecondaryButtonClass}
            rel="noreferrer"
            target="_blank"
          >
            npm package
          </a>
          <a
            href={GITHUB_URL}
            className={homeSecondaryButtonClass}
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </div>
        <div className="mt-6 max-w-xl">
          <HomeCopyCommand command={INSTALL_COMMAND} />
        </div>
      </div>
    </section>
  )
}
