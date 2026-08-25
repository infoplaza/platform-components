import type { TimeseriesCellComponentProps } from '../types'

export default function TimeseriesIconCell({
  data,
  getIconSrc,
}: TimeseriesCellComponentProps) {
  if (data.value == null) {
    return null
  }

  const src = getIconSrc?.(data.value) ?? null
  if (!src) {
    return (
      <div
        className="ip:flex ip:h-full ip:w-full ip:place-content-center ip:items-center"
        style={{ color: data.im_textcolor, backgroundColor: data.im_color }}
      />
    )
  }

  return (
    <div
      className="ip:flex ip:h-full ip:w-full ip:place-content-center ip:items-center"
      style={{ color: data.im_textcolor, backgroundColor: data.im_color }}
    >
      <img src={src} alt="" className="ip:h-5 ip:w-5" />
    </div>
  )
}
