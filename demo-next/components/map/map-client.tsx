'use client'

import '../maplibre-worker'
import dynamic from 'next/dynamic'

function ExampleSectionSkeleton({ showControls = false }: { showControls?: boolean }) {
  return (
    <article className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="h-5 w-40 rounded bg-dark/10" />
          <div className="h-4 w-80 max-w-full rounded bg-dark/5" />
        </div>
        <div className="h-8 w-24 shrink-0 rounded-md bg-primary/10" />
      </div>
      {showControls ? <div className="h-8 w-48 rounded-md bg-dark/5" /> : null}
      <div className="min-h-100 overflow-hidden rounded-2xl border border-cloud/10 bg-cloud-100" />
    </article>
  )
}

function MapDemoLoading() {
  return (
    <section className="h-full overflow-auto p-4 md:p-6" aria-busy="true">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-xl">
          <p className="mb-1.5 text-2xs font-semibold uppercase tracking-widest text-primary">
            I&apos;m Weather
          </p>
          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-dark">
            Map
          </h1>
          <p className="m-0 text-sm leading-relaxed text-dark/60">
            Loading PlatformMap examples…
          </p>
        </header>

        <ExampleSectionSkeleton />
        <ExampleSectionSkeleton />
        <ExampleSectionSkeleton showControls />

        <footer className="flex flex-wrap items-center gap-4 px-0.5 pb-2 text-xs text-dark/60">
          <span>PlatformMap · WeatherLayers · Composed stack</span>
          <span className="ml-auto">@infoplaza/platform</span>
        </footer>
      </div>
    </section>
  )
}

const PlatformMapDemo = dynamic(() => import('./platform-map-demo'), {
  ssr: false,
  loading: () => <MapDemoLoading />,
})

export default function MapClient() {
  return <PlatformMapDemo />
}
