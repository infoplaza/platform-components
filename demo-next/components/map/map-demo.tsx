'use client'

import { useState } from 'react'
import { BaseMap, MAP_STYLES, MapControlHud } from '@infoplaza/platform/components'
import { Providers as ProvidersComponent } from '@infoplaza/platform/providers'
import MapEventsProvider from '@infoplaza/platform/events'
import LayerComposer from '@infoplaza/platform/layers/composer'
import Overlay from '@infoplaza/platform/layers/overlay'
import { StylePicker } from './style-picker'
import { ViewCodeButton } from './view-code-dialog'

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
    <section className="flex h-full min-h-0 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <header className="max-w-xl">
          <p className="mb-1.5 text-2xs font-semibold uppercase tracking-widest text-primary">
            Live demo
          </p>
          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-dark">
            Weather on the map
          </h1>
          <p className="m-0 text-sm leading-relaxed text-dark/60">
            A live BaseMap with Infoplaza weather layers, overlay, and control HUD —
            the same composition you would drop into your own app.
          </p>
        </header>
        <div className="inline-flex shrink-0 items-center gap-3">
          <StylePicker
            value={mapStyleKey}
            options={mapStyles}
            onChange={setMapStyleKey}
          />
          <ViewCodeButton />
        </div>
      </div>

      <div className="ip-platform min-h-70 flex-1 overflow-hidden rounded-2xl border border-dark/10 bg-dark-200">
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

      <footer className="flex flex-wrap items-center gap-4 px-0.5 text-xs tabular-nums text-dark/60">
        <span>
          {formatCoord(viewState.latitude, true)}
          {'  '}
          {formatCoord(viewState.longitude, false)}
        </span>
        <span>Zoom {viewState.zoom.toFixed(1)}</span>
        <span className="ml-auto">@infoplaza/platform</span>
      </footer>
    </section>
  )
}
