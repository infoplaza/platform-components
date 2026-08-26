import { IpLocationArrowAlt } from '@/src/components/icons'
import {
  DEFAULT_DIRECTION_VIEW,
  degreesToCompass,
  nextDirectionView,
} from '../utils'
import type { TimeseriesCellComponentProps } from '../types'

export default function TimeseriesDirectionCell({
  data,
  directionView,
  onDirectionViewChange,
}: TimeseriesCellComponentProps) {
  const view = directionView ?? DEFAULT_DIRECTION_VIEW

  if (data.value == null || Number.isNaN(data.value)) {
    return null
  }

  const compass = degreesToCompass(data.value)

  return (
    <div
      className="ip:flex ip:h-full ip:cursor-pointer ip:flex-col ip:place-content-center ip:items-center ip:gap-0.5"
      style={{
        color: data.im_textcolor,
        backgroundColor: `color-mix(in srgb, ${data.im_color} 80%, transparent)`,
      }}
      onClick={() => onDirectionViewChange?.(nextDirectionView(view))}
      title={`${compass} — ${Math.round(data.value)}°`}
      role={onDirectionViewChange ? 'button' : undefined}
    >
      {view.arrow && (
        <div
          className="ip:inline-block ip:h-2.5 ip:w-2.5 ip:origin-center ip:rounded-full"
          style={{ transform: `rotate(${data.value - 180}deg)` }}
        >
          <IpLocationArrowAlt className="ip:inline-block ip:h-2.5 ip:w-2.5 ip:-translate-y-2 ip:dark:invert" />
        </div>
      )}
      {view.degrees && (
        <span className="ip:text-[9px] ip:leading-none ip:dark:text-white/60">
          {Math.round(data.value)}°
        </span>
      )}
      {view.compass && (
        <span className="ip:text-[8px] ip:leading-none ip:dark:text-white/60">
          {compass}
        </span>
      )}
    </div>
  )
}
