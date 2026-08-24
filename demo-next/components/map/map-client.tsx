'use client'

import dynamic from 'next/dynamic'

const MapDemo = dynamic(() => import('./map-demo'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 md:p-6" aria-busy="true">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <header className="max-w-xl">
          <p className="mb-1.5 text-2xs font-semibold uppercase tracking-widest text-primary">
            ImWeather
          </p>
          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-dark">
            Weather on the map
          </h1>
          <p className="m-0 text-sm leading-relaxed text-dark/60">
            Loading MapLibre and weather layers…
          </p>
        </header>
      </div>
      <div className="min-h-70 flex-1 overflow-hidden rounded-2xl border border-dark/10 bg-dark-200" />
    </div>
  ),
})

export default function MapClient() {
  return <MapDemo />
}
