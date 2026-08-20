'use client'

import { useState } from 'react'
import { BaseMap, MAP_STYLES, MapControlHud } from '../../dist/components/index.js'
import { Providers as ProvidersComponent } from '../../dist/providers/index.js'
import MapEventsProvider from '../../dist/events/index.js'
import LayerComposer from '../../dist/layers/composer.js'
import Overlay from '../../dist/layers/overlay.js'

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

export default function MapDemo() {
  const [viewState, setViewState] = useState({
    longitude: 4.9041,
    latitude: 52.3676,
    zoom: 7,
  })
  const [mapStyleKey, setMapStyleKey] = useState('dark')

  return (
    <div className="page">
      <div className="toolbar">
        <header className="header">
          <h1>Distribution Test Page (Next.js)</h1>
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
        <ProvidersComponent
          weatherConfig={{
            model: 'optimal',
            element: 'temperature',
            run: 'latest',
            member: '0',
            level: '2m',
          }}
          modelsConfig={{ apiEnv: 'prod', betaModels: false }}
        >
          <BaseMap
            viewState={viewState}
            onMove={(event: any) => setViewState(event?.viewState)}
            mapStyles={mapStyles}
            mapStyleKey={mapStyleKey}
          >
            {({ beforeId }: { beforeId: string }) => (
              <>
                <MapEventsProvider>
                  {(mapComponents: any) => (
                    <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
                      {({ layers }: { layers: any[] }) => (
                        <Overlay layers={[...layers]} interleaved={true} controller={true} />
                      )}
                    </LayerComposer>
                  )}
                </MapEventsProvider>
                <MapControlHud
                  mapIndex={0}
                  mapsLength={1}
                  isMultipleMapView={false}
                  onMapsCount={() => {}}
                  onExportChange={() => {}}
                  mapRef={null}
                  viewState={viewState}
                />
              </>
            )}
          </BaseMap>
        </ProvidersComponent>
      </div>
    </div>
  )
}
