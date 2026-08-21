export const MAP_DEMO_FILENAME = 'map-demo.tsx'

export const MAP_DEMO_SOURCE = `'use client'

import { useState } from 'react'
import { BaseMap, MAP_STYLES, MapControlHud } from '@infoplaza/platform/components'
import { Providers } from '@infoplaza/platform/providers'
import MapEventsProvider from '@infoplaza/platform/events'
import LayerComposer from '@infoplaza/platform/layers/composer'
import Overlay from '@infoplaza/platform/layers/overlay'

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
    <Providers
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
        onMove={(event) => setViewState(event?.viewState)}
        mapStyles={mapStyles}
        mapStyleKey={mapStyleKey}
      >
        {({ beforeId }) => (
          <>
            <MapEventsProvider>
              {(mapComponents) => (
                <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
                  {({ layers }) => (
                    <Overlay layers={[...layers]} interleaved controller />
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
    </Providers>
  )
}
`
