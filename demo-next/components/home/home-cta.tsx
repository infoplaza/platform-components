import Link from 'next/link'
import { INFOPLAZA_PLATFORM_EXAMPLES_URL } from '../../lib/infoplaza-platform'
import {
  homeContainerClass,
  homePrimaryButtonClass,
  homeSecondaryButtonClass,
} from './home-styles'

const STATS = [
  { label: 'React 18 & 19', detail: 'Supported peers' },
  { label: 'Map · table · charts', detail: 'Three sibling products' },
  { label: 'MapLibre 6', detail: 'Target ^6.9.0' },
  { label: '100+ elements', detail: 'Via Platform APIs' },
]

const FOOTER_LINKS = [
  { href: '/demo', label: 'Demo' },
  { href: '/documentation', label: 'Documentation' },
  { href: '/about', label: 'About' },
  { href: INFOPLAZA_PLATFORM_EXAMPLES_URL, label: 'Token usage', external: true },
  { href: 'https://www.infoplaza.com/', label: 'infoplaza.com', external: true },
]

export function HomeCta() {
  return (
    <>
      <section className="border-t border-dark/8 bg-white px-4 py-12 md:px-6">
        <div className={`${homeContainerClass} grid gap-8 sm:grid-cols-2 lg:grid-cols-4`}>
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="m-0 text-lg font-semibold tracking-tight text-dark">{stat.label}</p>
              <p className="mt-1 mb-0 text-sm text-dark/50">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary-10 px-4 py-16 md:px-6 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,191,120,0.22),transparent_45%)]"
          aria-hidden="true"
        />
        <div className={`${homeContainerClass} relative max-w-2xl text-center`}>
          <p className="m-0 inline-flex items-center rounded-full bg-gold/20 px-2.5 py-1 text-2xs font-semibold uppercase tracking-widest text-dark">
            Operational
          </p>
          <h2 className="mt-4 mb-0 text-2xl font-bold tracking-tight text-dark md:text-3xl">
            Ready to drop weather into your platform?
          </h2>
          <p className="mt-3 mb-0 text-sm leading-relaxed text-dark/60">
            Start from the live examples, then copy the packaged components into your host. The
            Infoplaza Platform keeps the forecasts coming around the clock.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/demo" className={homePrimaryButtonClass}>
              See the live demo
            </Link>
            <Link href="/documentation" className={homeSecondaryButtonClass}>
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-dark/10 bg-white px-4 py-8 md:px-6">
        <div
          className={`${homeContainerClass} flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div>
            <p className="m-0 text-sm font-semibold text-dark">Infoplaza</p>
            <p className="mt-1 mb-0 font-mono text-xs text-dark/45">@infoplaza/platform</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer">
            {FOOTER_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-dark/60 no-underline hover:text-primary"
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-dark/60 no-underline hover:text-primary"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </footer>
    </>
  )
}
