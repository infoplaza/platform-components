import type { TimeseriesCellComponentProps } from '../types'
import { twMerge } from '@/src/utilities/external/twMerge'

export default function TimeseriesValueRoundCell({
  data,
  showPalette = true,
}: TimeseriesCellComponentProps) {
  if (data.value == null || Number.isNaN(data.value)) {
    return null
  }

  return (
    <div
      className={twMerge(
        'ip:flex ip:h-full ip:w-full ip:place-content-center ip:items-center',
        !showPalette && 'ip:text-dark ip:dark:text-gray-300',
      )}
      title={String(data.value)}
      style={
        showPalette
          ? { color: data.color.text, backgroundColor: data.color.background }
          : undefined
      }
    >
      <div className="ip:flex ip:h-full ip:w-full ip:items-center ip:place-content-center ip:leading-none">
        <div className="ip:text-2xs">{Math.round(data.value)}</div>
      </div>
    </div>
  )
}
