import { homeContainerClass, homeSectionClass } from './home-styles'

const INDUSTRIES = [
  {
    title: 'Energy',
    description: 'Offshore wind, grid operations, and site-specific forecasts for planning.',
    icon: EnergyIcon,
  },
  {
    title: 'Marine',
    description: 'North Sea routing, vessel operations, and marine weather on the map.',
    icon: MarineIcon,
  },
  {
    title: 'Infrastructure',
    description: 'Rail, construction, outdoor events, and winter maintenance decisions.',
    icon: InfrastructureIcon,
  },
  {
    title: 'Mobility',
    description: 'Travel products and live weather in consumer apps and operator tools.',
    icon: MobilityIcon,
  },
]

export function HomeIndustries() {
  return (
    <section id="industries" className={`${homeSectionClass} pt-0 md:pt-4`}>
      <div className={homeContainerClass}>
        <p className="m-0 text-2xs font-semibold uppercase tracking-widest text-primary">
          Where it is used
        </p>
        <h2 className="mt-2 mb-0 max-w-2xl text-2xl font-bold tracking-tight text-dark">
          Built for teams that already run on weather.
        </h2>
        <p className="mt-3 mb-0 max-w-2xl text-sm leading-relaxed text-dark/60">
          The same weather intelligence Infoplaza already delivers to energy, marine,
          infrastructure, and mobility teams.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon
            return (
              <article
                key={industry.title}
                className="rounded-xl border border-dark/8 bg-white p-5 shadow-sm"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary-10 text-primary">
                  <Icon />
                </span>
                <h3 className="mt-3 mb-0 text-sm font-semibold text-dark">{industry.title}</h3>
                <p className="mt-1.5 mb-0 text-sm leading-relaxed text-dark/55">
                  {industry.description}
                </p>
              </article>
            )
          })}
        </div>
        <p className="mt-6 mb-0 text-xs text-dark/45">
          Built for host platforms that already authenticate against Infoplaza — dashboards, ops
          tools, and customer portals.
        </p>
      </div>
    </section>
  )
}

function EnergyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.2 2.4 4.8 13.1h6.1l-1.1 8.5 8.4-10.7h-6.1l1.1-8.5Z"
      />
    </svg>
  )
}

function MarineIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 16.5c1.2 0 1.8-.8 2.7-.8s1.5.8 2.7.8 1.8-.8 2.6-.8 1.6.8 2.7.8 1.8-.8 2.7-.8.8.3 1.6.6v2.1c-.7-.3-1.2-.5-1.6-.5-1.1 0-1.8.8-2.7.8s-1.6-.8-2.7-.8-1.8.8-2.6.8-1.5-.8-2.7-.8-1.8.8-2.7.8c-.4 0-.9-.2-1.6-.5v-2.1c.8-.3 1.2-.6 1.6-.6Zm0-4c1.2 0 1.8-.8 2.7-.8s1.5.8 2.7.8 1.8-.8 2.6-.8 1.6.8 2.7.8 1.8-.8 2.7-.8.8.3 1.6.6v2.1c-.7-.3-1.2-.5-1.6-.5-1.1 0-1.8.8-2.7.8s-1.6-.8-2.7-.8-1.8.8-2.6.8-1.5-.8-2.7-.8-1.8.8-2.7.8c-.4 0-.9-.2-1.6-.5v-2.1c.8-.3 1.2-.6 1.6-.6ZM12 4l7 6.2H5L12 4Z"
      />
    </svg>
  )
}

function InfrastructureIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 20V9.5L12 4l8 5.5V20h-6.2v-6.2H10.2V20H4Zm2-2h2.2v-6.2h7.6V18H18v-7.6l-6-4.1-6 4.1V18Z"
      />
    </svg>
  )
}

function MobilityIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.5 18.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm11 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM5 8h14l-1.4 7.2h-2.3a3.5 3.5 0 0 0-6.6 0H6.4L5 8Zm2.2-4h9.6L18 6.5H6l1.2-2.5Z"
      />
    </svg>
  )
}
