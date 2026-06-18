import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BaseMap } from '../dist/components/index.js'
import { Providers as ProvidersComponent } from '../dist/providers/index.js'
import MapEventsProvider from '../dist/events/index.js'
import modelData from '../src/_mock/model.json'
import LayerComposer from '../dist/layers/composer.js'
import Overlay from '../dist/layers/overlay.js'
import 'maplibre-gl/dist/maplibre-gl.css'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Missing root element')
}

function App() {
  const [viewState, setViewState] = useState({
    longitude: 4.9041,
    latitude: 52.3676,
    zoom: 7,
  })

  const models = modelData.data
  
  return (
    <div className="page">
      <header className="header">
        <h1>Distribution Test Page</h1>
        <p>Rendering BaseMap from dist/components/index.js</p>
      </header>

      <div className="map-shell">
        <ProvidersComponent weatherConfig={{ models: models, model: 'gfs', element: 'temperature', run: 'latest', member: '0', level: '2m' }}>
          <BaseMap
            viewState={viewState}
            onMove={(event: any) => setViewState(event?.viewState)}
            style="https://demotiles.maplibre.org/style.json"
          >
            <MapEventsProvider handler="demand">
              {(mapComponents) => (
                <LayerComposer mapComponents={mapComponents}>
                  {({ layers }) => (
                      <Overlay 
                          layers={[...layers]} 
                          interleaved={true} 
                          controller={true} />
                  )}
                </LayerComposer>
              )}
            </MapEventsProvider>
          </BaseMap>
        </ProvidersComponent>
      </div>
    </div>
  )
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
