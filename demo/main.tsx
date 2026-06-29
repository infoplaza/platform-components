import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BaseMap, MAP_STYLES } from '../dist/components/index.js'
import { Providers as ProvidersComponent } from '../dist/providers/index.js'
import MapEventsProvider from '../dist/events/index.js'
import LayerComposer from '../dist/layers/composer.js'
import Overlay from '../dist/layers/overlay.js'
import { MapControlHud } from '../dist/components/index.js'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../dist/styles.css'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Missing root element')
}

// Example of extending the built-in styling options with a custom one.
const customStyle = {
  key: 'demotiles',
  title: 'MapLibre Demo',
  styles: {
    default: {
      source: 'https://demotiles.maplibre.org/style.json',
      beforeId: '',
    },
    marine: {
      source: 'https://demotiles.maplibre.org/style.json',
      beforeId: '',
    },
  },
}

const mapStyles = [...MAP_STYLES, customStyle]

function App() {
  const [viewState, setViewState] = useState({
    longitude: 4.9041,
    latitude: 52.3676,
    zoom: 7,
  })
  const [models, setModels] = useState<any[]>([])
  const [mapStyleKey, setMapStyleKey] = useState('dark')

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/models?apiEnv=prod&betaModels=false', {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`)
        }

        return response.json()
      })
      .then((data) => {
        setModels(Array.isArray(data?.data) ? data.data : [])
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Unable to load models', error)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])
  
  return (
    <div className="page">
        <div className="toolbar">
            <header className="header">
                <h1>Distribution Test Page</h1>
                <p>Rendering BaseMap from dist/components/index.js</p>
            </header>
            <label className="style-picker">
                <span className="style-picker__label">Map style</span>
                <select
                    className="style-picker__select"
                    value={mapStyleKey}
                    onChange={(event) => setMapStyleKey(event.target.value)}
                >
                    {mapStyles.map((option) => (
                    <option key={option.key} value={option.key}>
                        {option.title}
                    </option>
                    ))}
                </select>
            </label>
        </div>
      

      <div className="map-shell ip-platform">
        <ProvidersComponent weatherConfig={{ models: models, model: 'gfs', element: 'temperature', run: 'latest', member: '0', level: '2m' }}>
          <BaseMap
            viewState={viewState}
            onMove={(event: any) => setViewState(event?.viewState)}
            mapStyles={mapStyles}
            mapStyleKey={mapStyleKey}
          >
            { ({ beforeId }) => (
              <>
                <MapEventsProvider handler="demand">
                  {(mapComponents) => (
                    <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
                      {({ layers }) => (
                          <Overlay 
                              layers={[...layers]} 
                              interleaved={true} 
                              controller={true} />
                      )}
                    </LayerComposer>
                  )}
                </MapEventsProvider>
                <MapControlHud 
                  mapIndex={0} 
                  mapsLength={1} 
                  isMultipleMapView={false} 
                  models={models} 
                  onMapsCount={() => {}} 
                  onExportChange={() => {}} 
                  mapRef={null} 
                  viewState={viewState} />
                  </>
              )}
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
