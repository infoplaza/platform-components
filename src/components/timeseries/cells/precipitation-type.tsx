import {
  IpPrecipitationFrostIcon,
  IpPrecipitationHailIcon,
  IpPrecipitationLightningIcon,
  IpPrecipitationRainHailIcon,
  IpPrecipitationRainIcon,
  IpPrecipitationSnowHailIcon,
  IpPrecipitationSnowIcon,
  IpPrecipitationWetSnowIcon,
} from '@/src/components/icons'
import { twMerge } from '@/src/utilities/external/twMerge'
import type { TimeseriesCellComponentProps } from '../types'

/** Off-white hail fill so the icon stays visible on the chart strip. */
export const PRECIPITATION_TYPE_HAIL_COLOR = '#F2F2F2'

/**
 * Value → type catalog. Colors match the map legend / point-forecast palette
 * (`palette.colors` + `palette.values`). Hail is off-white instead of #fff.
 */
export const PRECIPITATION_TYPES = [
  { Icon: null, title: 'Dry', color: null },
  { Icon: IpPrecipitationRainIcon, title: 'Rain', color: '#33ADE4' },
  { Icon: IpPrecipitationLightningIcon, title: 'Thunderstorm', color: '#F4EB36' },
  { Icon: IpPrecipitationFrostIcon, title: 'Freezing rain', color: '#E73B42' },
  { Icon: IpPrecipitationSnowIcon, title: 'Ice', color: '#E73B42' },
  { Icon: IpPrecipitationSnowIcon, title: 'Snow', color: '#FEA1FF' },
  { Icon: IpPrecipitationWetSnowIcon, title: 'Sleet', color: '#6269CD' },
  { Icon: IpPrecipitationWetSnowIcon, title: 'Rain and snow', color: '#469960' },
  { Icon: IpPrecipitationRainHailIcon, title: 'Ice pellets', color: '#F4A977' },
  { Icon: IpPrecipitationSnowHailIcon, title: 'Graupel', color: '#F4A977' },
  {
    Icon: IpPrecipitationHailIcon,
    title: 'Hail',
    color: PRECIPITATION_TYPE_HAIL_COLOR,
  },
] as const

export function getPrecipitationType(value: number) {
  if (value < 0 || value >= PRECIPITATION_TYPES.length) {
    return null
  }
  return PRECIPITATION_TYPES[value]
}

function isUsablePaletteColor(color: string | null | undefined): color is string {
  if (!color) {
    return false
  }
  const value = color.trim().toLowerCase()
  return value !== '' && value !== 'transparent'
}

function isNearWhite(color: string): boolean {
  const value = color.trim().toLowerCase()
  return (
    value === 'white' ||
    value === '#fff' ||
    value === '#ffffff' ||
    /^rgba?\(\s*255\s*,\s*255\s*,\s*255(?:\s*,\s*1(?:\.0+)?)?\s*\)$/.test(value)
  )
}

/**
 * Prefers the point-forecast / legend palette color when present; otherwise
 * the catalog fallback. Hail (and any white palette stop) uses off-white.
 */
export function resolvePrecipitationTypeColor(
  value: number,
  paletteColor?: string | null,
): string | null {
  const typeInfo = getPrecipitationType(value)
  if (!typeInfo) {
    return null
  }
  const color = isUsablePaletteColor(paletteColor)
    ? paletteColor
    : typeInfo.color
  if (!color) {
    return null
  }
  if (typeInfo.title === 'Hail' || isNearWhite(color)) {
    return PRECIPITATION_TYPE_HAIL_COLOR
  }
  return color
}

export default function TimeseriesPrecipitationTypeCell({
  data,
  showPalette = false,
}: TimeseriesCellComponentProps) {
  if (data.value == null || Number.isNaN(data.value)) {
    return null
  }

  const typeInfo = getPrecipitationType(Math.round(data.value))
  if (!typeInfo) {
    return null
  }

  const { Icon, title } = typeInfo

  return (
    <div
      className={twMerge(
        'ip:flex ip:h-full ip:w-full ip:place-content-center ip:items-center',
        !showPalette && 'ip:text-dark ip:dark:text-gray-300',
      )}
      style={showPalette ? { color: data.color.background } : undefined}
    >
      <div className="ip:px-0.5 ip:text-xs ip:leading-none" title={title}>
        {Icon ? <Icon className="ip:size-3" aria-hidden /> : null}
      </div>
    </div>
  )
}
