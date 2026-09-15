import type { ReactNode } from 'react'
import { homeContainerClass, homeSectionClass } from './home-styles'

const BENEFITS: {
  title: string
  description: ReactNode
  icon: () => ReactNode
}[] = [
  {
    title: 'Beautiful data',
    description:
      'Weather palettes, MapLibre overlays, forecast tables, and ensemble plumes that look like a product, not a prototype.',
    icon: SparkleIcon,
  },
  {
    title: 'Easy to use',
    description: (
      <>
        Packaged <code className="font-mono text-xs">PlatformMap</code> +{' '}
        <code className="font-mono text-xs">WeatherLayers</code>, or compose the stack yourself.
        One auth route on the host.
      </>
    ),
    icon: BoltIcon,
  },
  {
    title: 'Cost-effective',
    description:
      'Ship map, table, and chart UI without rebuilding Deck.gl, model catalogs, or forecast plumbing.',
    icon: ScaleIcon,
  },
  {
    title: 'Developer-friendly',
    description: (
      <>
        React 18/19, TypeScript exports, Tailwind-safe{' '}
        <code className="font-mono text-xs">styles.embed.css</code>, Next.js-ready worker setup.
      </>
    ),
    icon: CodeIcon,
  },
  {
    title: 'Always-on weather',
    description:
      'Forecasts, models, and observations from the Infoplaza Platform — operational data that does not sleep.',
    icon: ClockIcon,
  },
  {
    title: 'Packaged or composed',
    description: (
      <>
        Start with <code className="font-mono text-xs">TimeseriesForecast</code> /{' '}
        <code className="font-mono text-xs">EnsembleForecast</code>, or assemble Toolbar, Builder,
        Chart, and Footer.
      </>
    ),
    icon: StackIcon,
  },
]

export function HomeBenefits() {
  return (
    <section id="benefits" className={`${homeSectionClass} bg-white`}>
      <div className={homeContainerClass}>
        <p className="m-0 text-2xs font-semibold uppercase tracking-widest text-primary">
          Why teams pick it
        </p>
        <h2 className="mt-2 mb-0 max-w-xl text-2xl font-bold tracking-tight text-dark md:text-3xl">
          Weather UI that is ready for a host platform.
        </h2>
        <p className="mt-3 mb-0 max-w-2xl text-sm leading-relaxed text-dark/60">
          Keep the science on the Infoplaza Platform. Keep the product in your stack. These
          components handle the map, the table, and the charts.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon
            return (
              <article key={benefit.title}>
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary-10 text-primary">
                  <Icon />
                </span>
                <h3 className="mt-3 mb-0 text-base font-semibold text-dark">{benefit.title}</h3>
                <p className="mt-1.5 mb-0 text-sm leading-relaxed text-dark/60">
                  {benefit.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3.2 13.6 9 19.5 10.5 13.6 12 12 17.8 10.4 12 4.5 10.5 10.4 9 12 3.2Zm6.2 10.2 0.8 2.8 2.8.8-2.8.8-.8 2.8-.8-2.8-2.8-.8 2.8-.8.8-2.8Z"
      />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d="M13 3 5 14h6l-1 7 9-12h-6l0-6Z" />
    </svg>
  )
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11 4v2.1L5.2 8.4 7 13.2c1.6-.8 3.4-.8 5 0l1.8-4.8L11 6.1V20H4v-2h7V4Zm2 0v2.1l5.8 2.3L17 13.2c-1.6-.8-3.4-.8-5 0 0 0 .1-.1.2-.2L13.8 8.4 19 6.1V4h-6ZM7.8 14.4 6.2 10 4 10.9l1.8 4.7c.6.4 1.4.4 2 0Zm8.4 0c.6.4 1.4.4 2 0L20 10.9 17.8 10l-1.6 4.4Z"
      />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="m8.2 6.5-5 5.5 5 5.5 1.5-1.4L6.2 12l3.5-3.9L8.2 6.5Zm7.6 0-1.5 1.6L17.8 12l-3.5 3.9 1.5 1.4 5-5.5-5-5.5Z"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3.5A8.5 8.5 0 1 0 20.5 12 8.5 8.5 0 0 0 12 3.5Zm0 15A6.5 6.5 0 1 1 18.5 12 6.5 6.5 0 0 1 12 18.5ZM12.8 7h-1.6v5.2l3.6 2.2.8-1.3-2.8-1.7V7Z"
      />
    </svg>
  )
}

function StackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="m12 4 8 4-8 4-8-4 8-4Zm0 7.2 6.5-3.2 1.5.8-8 4-8-4 1.5-.8 6.5 3.2Zm0 4 6.5-3.2 1.5.8-8 4-8-4 1.5-.8 6.5 3.2Z"
      />
    </svg>
  )
}
