export const BARE_MAP_FILENAME = 'platform-map-bare.tsx'

export const BARE_MAP_SOURCE = `'use client'

import { useState } from 'react'
import { PlatformMap } from '@infoplaza/platform/components'
import { usePlatformMap } from '@infoplaza/platform/providers'

function FlyToAmsterdamButton() {
  const { map } = usePlatformMap()

  return (
    <button
      type="button"
      disabled={!map}
      onClick={() => {
        map?.flyTo({
          center: [4.9041, 52.3676],
          zoom: 10,
          essential: true,
        })
      }}
    >
      Fly to Amsterdam
    </button>
  )
}

export default function BarePlatformMap() {
  const [viewState, setViewState] = useState({
    longitude: 4.9041,
    latitude: 52.3676,
    zoom: 7,
  })

  return (
    <PlatformMap
      viewState={viewState}
      onMove={(event) => setViewState(event?.viewState)}
    >
      <FlyToAmsterdamButton />
    </PlatformMap>
  )
}
`

export const WEATHER_MAP_FILENAME = 'platform-map-weather.tsx'

export const WEATHER_MAP_SOURCE = `'use client'

import { useState } from 'react'
import { PlatformMap, WeatherLayers } from '@infoplaza/platform/components'

export default function PlatformMapWithWeather() {
  const [viewState, setViewState] = useState({
    longitude: 4.9041,
    latitude: 52.3676,
    zoom: 7,
  })

  return (
    <PlatformMap 
      viewState={viewState} 
      onMove={(event) => setViewState(event?.viewState)}
    >
      <WeatherLayers showHud />
    </PlatformMap>
  )
}
`

export const COMPOSED_MAP_FILENAME = 'platform-map-composed.tsx'

export const COMPOSED_MAP_SOURCE = `'use client'

import { useState } from 'react'
import { MapControlHud, PlatformMap } from '@infoplaza/platform/components'
import { Providers, usePlatformMap } from '@infoplaza/platform/providers'
import { LayerComposer, LayerOverlay } from '@infoplaza/platform/layers'

import { MAP_STYLES } from '@infoplaza/platform/defaults'

import MapEventsProvider from '@infoplaza/platform/events'

function ComposedWeatherStack() {
  const { beforeId } = usePlatformMap()

  return (
    <Providers
      mapIndex={1}
      weatherConfig={{
        model: 'optimal',
        element: 'temperature',
        run: 'latest',
        member: '0',
        level: '2m',
      }}
    >
      <MapEventsProvider>
        {(mapComponents) => (
          <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
            {({ layers }) => (
              <LayerOverlay layers={[...layers]} interleaved beforeId={beforeId} />
            )}
          </LayerComposer>
        )}
      </MapEventsProvider>
      <MapControlHud mapIndex={1} />
    </Providers>
  )
}

export default function ComposedPlatformMap() {
  const [viewState, setViewState] = useState({
    longitude: 4.9041,
    latitude: 52.3676,
    zoom: 7,
  })

  return (
    <PlatformMap
      viewState={viewState}
      onMove={(event) => setViewState(event?.viewState)}
      mapStyles={MAP_STYLES}
      mapStyleKey="dark"
    >
      <ComposedWeatherStack />
    </PlatformMap>
  )
}
`
