import { type FormEvent, useEffect, useId, useState } from 'react'
import { DEMO_LOCATIONS } from './fixtures'

export type DemoLocation = {
  lat: number
  lon: number
}

type LocationFieldsProps = {
  value: DemoLocation
  onChange: (location: DemoLocation) => void
}

const CUSTOM_VALUE = 'custom'

const inputClass =
  'w-28 rounded-md border border-cloud-200 bg-white text-sm tabular-nums text-dark focus:border-primary focus:ring-2 focus:ring-primary/60'

function presetKey(location: DemoLocation): string {
  const match = DEMO_LOCATIONS.find(
    (place) => place.lat === location.lat && place.lon === location.lon,
  )
  return match?.label ?? CUSTOM_VALUE
}

function parseCoordinate(value: string, min: number, max: number): number | null {
  const trimmed = value.trim()
  if (trimmed === '') {
    return null
  }
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null
  }
  return parsed
}

export function LocationFields({ value, onChange }: LocationFieldsProps) {
  const latId = useId()
  const lonId = useId()
  const [latInput, setLatInput] = useState(String(value.lat))
  const [lonInput, setLonInput] = useState(String(value.lon))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLatInput(String(value.lat))
    setLonInput(String(value.lon))
    setError(null)
  }, [value.lat, value.lon])

  function apply(lat: number, lon: number) {
    setError(null)
    if (lat === value.lat && lon === value.lon) {
      return
    }
    onChange({ lat, lon })
  }

  function onPresetChange(label: string) {
    const place = DEMO_LOCATIONS.find((entry) => entry.label === label)
    if (!place) {
      return
    }
    apply(place.lat, place.lon)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const lat = parseCoordinate(latInput, -90, 90)
    const lon = parseCoordinate(lonInput, -180, 180)
    if (lat === null) {
      setError('Latitude must be a number between -90 and 90.')
      return
    }
    if (lon === null) {
      setError('Longitude must be a number between -180 and 180.')
      return
    }
    apply(lat, lon)
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 rounded-xl border border-cloud/10 bg-white px-3 py-2.5"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="inline-flex flex-col gap-1">
          <span className="text-xs font-medium text-dark/60">Place</span>
          <select
            className="rounded-md border border-cloud-200 bg-white text-sm text-dark focus:border-primary focus:ring-2 focus:ring-primary/60"
            value={presetKey(value)}
            onChange={(event) => onPresetChange(event.target.value)}
          >
            {DEMO_LOCATIONS.map((place) => (
              <option key={place.label} value={place.label}>
                {place.label}
              </option>
            ))}
            {presetKey(value) === CUSTOM_VALUE ? (
              <option value={CUSTOM_VALUE}>Custom</option>
            ) : null}
          </select>
        </label>
        <label className="inline-flex flex-col gap-1" htmlFor={latId}>
          <span className="text-xs font-medium text-dark/60">Latitude</span>
          <input
            id={latId}
            className={inputClass}
            type="number"
            inputMode="decimal"
            step="any"
            min={-90}
            max={90}
            value={latInput}
            onChange={(event) => setLatInput(event.target.value)}
          />
        </label>
        <label className="inline-flex flex-col gap-1" htmlFor={lonId}>
          <span className="text-xs font-medium text-dark/60">Longitude</span>
          <input
            id={lonId}
            className={inputClass}
            type="number"
            inputMode="decimal"
            step="any"
            min={-180}
            max={180}
            value={lonInput}
            onChange={(event) => setLonInput(event.target.value)}
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          Load forecast
        </button>
      </div>
      {error ? (
        <p className="m-0 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
