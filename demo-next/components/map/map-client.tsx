'use client'

import dynamic from 'next/dynamic'

const MapDemo = dynamic(() => import('./map-demo'), {
  ssr: false,
  loading: () => (
    <div className="map-panel map-panel--loading" aria-busy="true">
      <div className="map-panel__toolbar">
        <header className="map-panel__intro">
          <h1>Live map</h1>
          <p>Loading MapLibre and weather layers…</p>
        </header>
      </div>
      <div className="map-panel__canvas map-panel__canvas--placeholder" />
      <footer className="map-panel__status">
        <span>Preparing map</span>
      </footer>
    </div>
  ),
})

export default function MapClient() {
  return <MapDemo />
}
