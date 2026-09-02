import type { TimeseriesCellComponentProps } from '../types'
import { twMerge } from '@/src/utilities/external/twMerge'

export default function TimeseriesIconCell({
  data,
  getIconSrc,
  showPalette = true,
}: TimeseriesCellComponentProps) {
  if (data.value == null) {
    return null
  }

  const src = getIconSrc?.(data.value) ?? null
  const paletteStyle = showPalette
    ? { color: data.color.text, backgroundColor: data.color.background }
    : undefined
  const className = twMerge(
    'ip:flex ip:h-full ip:w-full ip:place-content-center ip:items-center',
    !showPalette && 'ip:text-dark ip:dark:text-gray-300',
  )

  if (!src) {
    return <div className={className} style={paletteStyle} />
  }

  return (
    <div className={className} style={paletteStyle}>
      <img src={src} alt="" className="ip:h-5 ip:w-5" />
    </div>
  )
}
