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

const PRECIPITATION_TYPES = [
  { Icon: null, title: 'Dry' },
  { Icon: IpPrecipitationRainIcon, title: 'Rain' },
  { Icon: IpPrecipitationLightningIcon, title: 'Thunderstorm' },
  { Icon: IpPrecipitationFrostIcon, title: 'Freezing rain' },
  { Icon: IpPrecipitationSnowIcon, title: 'Ice' },
  { Icon: IpPrecipitationSnowIcon, title: 'Snow' },
  { Icon: IpPrecipitationWetSnowIcon, title: 'Wet snow' },
  { Icon: IpPrecipitationWetSnowIcon, title: 'Rain and snow' },
  { Icon: IpPrecipitationRainHailIcon, title: 'Ice pellets' },
  { Icon: IpPrecipitationSnowHailIcon, title: 'Graupel' },
  { Icon: IpPrecipitationHailIcon, title: 'Hail' },
] as const

function getPrecipitationType(value: number) {
  if (value < 0 || value >= PRECIPITATION_TYPES.length) {
    return null
  }
  return PRECIPITATION_TYPES[value]
}

export default function TimeseriesPrecipitationTypeCell({
  data,
  showPalette = true,
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
