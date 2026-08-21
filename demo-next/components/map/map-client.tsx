'use client'

import dynamic from 'next/dynamic'

const MapDemo = dynamic(() => import('./map-demo'), {
  ssr: false,
  loading: () => (
    <div className="map-panel map-panel--loading" aria-busy="true">
      <div className="map-panel__toolbar">
        <header className="map-panel__intro">
          <p className="map-panel__eyebrow">Live demo</p>
          <h1>Weather on the map</h1>
          <p>Loading MapLibre and weather layers…</p>
        </header>
      </div>
      <div className="map-panel__canvas map-panel__canvas--placeholder" />
    </div>
  ),
})

export default function MapClient() {
  return <MapDemo />
}
