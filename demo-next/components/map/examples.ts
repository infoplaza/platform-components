export const BARE_MAP_FILENAME = 'platform-map-bare.tsx'

export const BARE_MAP_SOURCE = `'use client'

import { useState } from 'react'
import {
  MAP_STYLES,
  PlatformMap,
  usePlatformMap,
} from '@infoplaza/platform/components'

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
      mapStyles={MAP_STYLES}
      mapStyleKey="dark"
    >
      <FlyToAmsterdamButton />
    </PlatformMap>
  )
}
`

export const WEATHER_MAP_FILENAME = 'platform-map-weather.tsx'

export const WEATHER_MAP_SOURCE = `'use client'

import { useState } from 'react'
import {
  MAP_STYLES,
  PlatformMap,
  WeatherLayers,
} from '@infoplaza/platform/components'

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
      mapStyles={MAP_STYLES}
      mapStyleKey="dark"
    >
      <WeatherLayers
        weatherConfig={{
          model: 'optimal',
          element: 'temperature',
          run: 'latest',
          member: '0',
          level: '2m',
        }}
        modelsConfig={{ apiEnv: 'prod', betaModels: false }}
        showHud
        hudProps={{ viewState }}
      />
    </PlatformMap>
  )
}
`
