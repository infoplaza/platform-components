import Link from 'next/link'
import { INFOPLAZA_PLATFORM_INTRO_URL } from '../../lib/infoplaza-platform'
import { HomeCopyCommand } from './home-copy-command'
import { homeContainerClass } from './home-styles'

const STEPS = [
  {
    title: 'Install the package',
    body: (
      <>
        Add <code className="font-mono text-[13px] text-primary-50">@infoplaza/platform</code> and{' '}
        <code className="font-mono text-[13px] text-primary-50">maplibre-gl</code>. Peer
        expectation: React 18 or 19, MapLibre ≥ 6.4.1.
      </>
    ),
  },
  {
    title: 'Import styles once',
    body: (
      <>
        Load <code className="font-mono text-[13px] text-primary-50">maplibre-gl.css</code> and{' '}
        <code className="font-mono text-[13px] text-primary-50">@infoplaza/platform/styles.css</code>
        . Tailwind hosts should use <code className="font-mono text-[13px] text-primary-50">styles.embed.css</code>.
      </>
    ),
  },
  {
    title: 'Create an API token',
    body: (
      <>
        Create and manage keys on the{' '}
        <a
          href={INFOPLAZA_PLATFORM_INTRO_URL}
          className="font-medium text-primary-50 hover:text-primary"
          rel="noreferrer"
          target="_blank"
        >
          Infoplaza developer platform
        </a>
        . Set the token as{' '}
        <code className="font-mono text-[13px] text-primary-50">PLATFORM_API_KEY</code>.
      </>
    ),
  },
  {
    title: 'Mount platform auth',
    body: (
      <>
        Proxy <code className="font-mono text-[13px] text-primary-50">/api/platform/*</code> with
        your <code className="font-mono text-[13px] text-primary-50">PLATFORM_API_KEY</code>. Weather
        models are fetched internally by Providers / WeatherLayers.
      </>
    ),
  },
  {
    title: 'Render the map',
    body: 'Drop PlatformMap around WeatherLayers. Timeseries and ensemble follow the same packaged pattern.',
  },
]

const SNIPPET = `import { PlatformMap, WeatherLayers } from '@infoplaza/platform/components'
import { MAP_STYLES } from '@infoplaza/platform/defaults'

<PlatformMap
  viewState={viewState}
  onMove={(event) => setViewState(event?.viewState)}
  mapStyles={MAP_STYLES}
  mapStyleKey={mapStyleKey}
>
  <WeatherLayers showHud />
</PlatformMap>`

export function HomeInstall() {
  return (
    <section id="install" className="bg-dark-200 px-4 py-16 text-white md:px-6 md:py-24">
      <div className={`${homeContainerClass} grid min-w-0 items-start gap-12 lg:grid-cols-2`}>
        <div>
          <p className="m-0 text-2xs font-semibold uppercase tracking-widest text-primary-50">
            Install in minutes
          </p>
          <h2 className="mt-2 mb-0 text-2xl font-bold tracking-tight md:text-3xl">
            From npm to a weather map.
          </h2>
          <p className="mt-3 mb-0 text-sm leading-relaxed text-white/65">
            The live map demo is the same composition: a PlatformMap shell with packaged
            WeatherLayers. There is no client-side models fetch to wire yourself.
          </p>
          <div className="mt-6">
            <HomeCopyCommand
              command="npm install @infoplaza/platform maplibre-gl"
              tone="dark"
            />
          </div>
          <ol className="mt-8 mb-0 list-none space-y-5 p-0">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xs font-semibold text-primary-50">
                  {index + 1}
                </span>
                <div>
                  <p className="m-0 text-sm font-semibold">{step.title}</p>
                  <p className="mt-1 mb-0 text-sm leading-relaxed text-white/60">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 mb-0 text-sm text-white/50">
            MapLibre v6 workers and the auth handler are covered in{' '}
            <Link href="/documentation" className="font-medium text-primary-50 hover:text-primary">
              the documentation
            </Link>
            .
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f1210] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="font-mono text-2xs text-white/40">quick-start.tsx</span>
            <span className="text-2xs font-medium text-primary-50">React</span>
          </div>
          <pre className="m-0 overflow-x-auto p-4 text-[13px] leading-relaxed text-cloud-400">
            <code>{SNIPPET}</code>
          </pre>
        </div>
      </div>
    </section>
  )
}
