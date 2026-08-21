'use client'

import { useState } from 'react'
import { BaseMap, MAP_STYLES, MapControlHud } from '../../../dist/components/index.js'
import { Providers as ProvidersComponent } from '../../../dist/providers/index.js'
import MapEventsProvider from '../../../dist/events/index.js'
import LayerComposer from '../../../dist/layers/composer.js'
import Overlay from '../../../dist/layers/overlay.js'
import { StylePicker } from './style-picker'

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

function formatCoord(value: number, northSouth: boolean) {
  const hemisphere = northSouth
    ? value >= 0
      ? 'N'
      : 'S'
    : value >= 0
      ? 'E'
      : 'W'
  return `${Math.abs(value).toFixed(4)}° ${hemisphere}`
}

export default function MapDemo() {
  const [viewState, setViewState] = useState({
    longitude: 4.9041,
    latitude: 52.3676,
    zoom: 7,
  })
  const [mapStyleKey, setMapStyleKey] = useState('dark')

  return (
    <section className="map-panel">
      <div className="map-panel__toolbar">
        <header className="map-panel__intro">
          <h1>Live map</h1>
          <p>BaseMap with weather layers, overlay and control HUD</p>
        </header>
        <div className="map-panel__actions">
          <StylePicker
            value={mapStyleKey}
            options={mapStyles}
            onChange={setMapStyleKey}
          />
          <button type="button" className="view-code-button">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                d="M5.5 3.5 1.75 8 5.5 12.5M10.5 3.5 14.25 8 10.5 12.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            View code
          </button>
        </div>
      </div>

      <div className="map-panel__canvas ip-platform">
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

      <footer className="map-panel__status">
        <span>
          {formatCoord(viewState.latitude, true)}
          {'  '}
          {formatCoord(viewState.longitude, false)}
        </span>
        <span>Zoom {viewState.zoom.toFixed(1)}</span>
        <span className="map-panel__status-source">dist/components</span>
      </footer>
    </section>
  )
}
