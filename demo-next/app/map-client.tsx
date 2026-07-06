'use client'

import dynamic from 'next/dynamic'

// The map relies on browser-only APIs (maplibre-gl, deck.gl, WebGL), so it must
// only render on the client. Disabling SSR here keeps the output identical to the
// Vite demo, which mounts the app straight into the DOM.
const MapDemo = dynamic(() => import('./map-demo'), { ssr: false })

export default function MapClient() {
  return <MapDemo />
}
