import React from 'react'
import { createRoot } from 'react-dom/client'
import { BaseMap } from '../dist/components/index.js'
import 'maplibre-gl/dist/maplibre-gl.css'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Missing root element')
}

function App() {
  return (
    <div className="page">
      <header className="header">
        <h1>Distribution Test Page</h1>
        <p>Rendering BaseMap from dist/components/index.js</p>
      </header>

      <div className="map-shell">
        <BaseMap
          viewState={{
            longitude: 4.9041,
            latitude: 52.3676,
            zoom: 7,
          }}
          style="https://demotiles.maplibre.org/style.json"
        />
      </div>
    </div>
  )
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
