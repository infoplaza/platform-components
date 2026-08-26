import {
  formatPressureMeanSeaLevel,
  resolveDecimals,
  toFixedTruncated,
} from '../utils'
import type { TimeseriesCellComponentProps } from '../types'

export default function TimeseriesValueCell({
  data,
  config,
  unit,
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
      className="ip:flex ip:h-full ip:w-full ip:place-content-center ip:items-center"
      title={unit ? `${value} ${unit}` : String(value)}
      style={{ color: data.im_textcolor, backgroundColor: data.im_color }}
    >
      <div className="ip:text-2xs ip:font-light ip:leading-none">{display}</div>
    </div>
  )
}
