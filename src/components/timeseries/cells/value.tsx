import {
  formatPressureMeanSeaLevel,
  resolveDecimals,
  toFixedTruncated,
} from '../utils'
import type { TimeseriesCellComponentProps } from '../types'
import { twMerge } from '@/src/utilities/external/twMerge'

export default function TimeseriesValueCell({
  data,
  config,
  unit,
  showPalette = true,
}: TimeseriesCellComponentProps) {
  const value = data.value
  if (value == null || Number.isNaN(value)) {
    return null
  }

  const decimals = resolveDecimals(
    value,
    config?.decimals,
    config?.element,
    unit,
  )
  const display =
    config?.element === 'pressure_meansealevel'
      ? formatPressureMeanSeaLevel(value, decimals)
      : toFixedTruncated(value, decimals)

  return (
    <div
      className={twMerge(
        'ip:flex ip:h-full ip:w-full ip:place-content-center ip:items-center',
        !showPalette && 'ip:text-dark ip:dark:text-gray-300',
      )}
      title={unit ? `${value} ${unit}` : String(value)}
      style={
        showPalette
          ? { color: data.color.text, backgroundColor: data.color.background }
          : undefined
      }
    >
      <div className="ip:text-2xs ip:font-light ip:leading-none">{display}</div>
    </div>
  )
}
