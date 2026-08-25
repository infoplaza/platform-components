import type { TimeseriesCellComponentProps } from '../types'

export default function TimeseriesValueRoundCell({
  data,
}: TimeseriesCellComponentProps) {
  if (data.value == null || Number.isNaN(data.value)) {
    return null
  }

  return (
    <div
      className="ip:flex ip:h-full ip:w-full ip:place-content-center ip:items-center"
      title={String(data.value)}
      style={{ color: data.im_textcolor, backgroundColor: data.im_color }}
    >
      <div className="ip:flex ip:h-full ip:w-full ip:items-center ip:place-content-center ip:leading-none">
        <div className="ip:text-2xs">{Math.round(data.value)}</div>
      </div>
    </div>
  )
}
