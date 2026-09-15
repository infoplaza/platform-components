import { homeContainerClass, homeSecondaryButtonClass, homeSectionClass } from '../home/home-styles'

const STORY_URL = 'https://www.infoplaza.com/en/our-story'

const MARKETS = [
  {
    title: 'Land',
    description: 'Construction, rail, outdoor events, and winter maintenance.',
  },
  {
    title: 'Marine',
    description: 'Offshore operations, metocean planning, and ice forecasts.',
  },
  {
    title: 'Media',
    description: 'Weather and traffic information across Infoplaza brands.',
  },
  {
    title: 'Mobility',
    description: 'Travel data combined with live weather for road, rail, and cycling.',
  },
]

const FACTS = [
  { value: '4.6', label: 'average rating by clients' },
  { value: '16', label: 'products in the portfolio' },
  { value: '20M', label: 'monthly visitors, worldwide' },
  { value: '100+', label: 'experts with a passion for the weather' },
]

export function AboutCompany() {
  return (
    <section id="company" className={homeSectionClass}>
      <div className={homeContainerClass}>
        <p className="m-0 text-2xs font-semibold uppercase tracking-widest text-primary">
          The company behind it
        </p>
        <h2 className="mt-2 mb-0 max-w-2xl text-2xl font-bold tracking-tight text-dark md:text-3xl">
          Infoplaza — weather and mobility intelligence since 2009.
        </h2>
        <p className="mt-3 mb-0 max-w-2xl text-sm leading-relaxed text-dark/60">
          Infoplaza translates weather and mobility data into solutions clients can act on.
          The mission is to offer intelligent information solutions people can depend on —
          by listening, by innovating, and by finding the right mix of models and scenarios.
        </p>

        <blockquote className="mt-8 mb-0 max-w-3xl rounded-xl border border-dark/8 bg-white p-5 shadow-sm">
          <p className="m-0 text-sm leading-relaxed text-pretty text-dark/75">
            “Helping people is and has always been our driving force. We translate big
            weather and mobility data to solutions for our clients. That way we help them
            decide. That was our starting point in 2009, it still is today and will
            continue to be in the future.”
          </p>
          <footer className="mt-3 text-sm font-semibold text-dark">
            René Westening &amp; Menno Bom
            <span className="mt-0.5 block font-normal text-dark/50">Cofounders, Infoplaza</span>
          </footer>
        </blockquote>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETS.map((market) => (
            <article
              key={market.title}
              className="rounded-xl border border-dark/8 bg-white p-5 shadow-sm"
            >
              <h3 className="m-0 text-sm font-semibold text-dark">{market.title}</h3>
              <p className="mt-1.5 mb-0 text-sm leading-relaxed text-dark/55">
                {market.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <p className="m-0 text-2xl font-bold tracking-tight text-dark">{fact.value}</p>
              <p className="mt-1 mb-0 text-sm text-dark/50">{fact.label}</p>
            </div>
          ))}
        </div>

        <a
          href={STORY_URL}
          className={`${homeSecondaryButtonClass} mt-10`}
          rel="noreferrer"
          target="_blank"
        >
          Read our story
        </a>
      </div>
    </section>
  )
}
