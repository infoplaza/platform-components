import { useEffect, useRef } from 'react'
import { IpAngleLeftB, IpAngleRightB } from '@/src/components/icons'
import { twMerge } from '@/src/utilities/external/twMerge'
import type { TimeseriesChartDayWindow } from '../series'
import { toSupportedLocale } from '../locale'
import { formatChartTimestamp } from './tooltip'

const TODAY_LABEL: Record<string, string> = {
  en: 'Today',
  nl: 'Vandaag',
  de: 'Heute',
  it: 'Oggi',
  es: 'Hoy',
  fr: "Aujourd'hui",
}

function isSameCalendarDay(
  a: number,
  b: number,
  locale: string,
  timezone: string | null,
): boolean {
  return (
    formatChartTimestamp(a, locale, timezone, 'yyyy-MM-dd') ===
    formatChartTimestamp(b, locale, timezone, 'yyyy-MM-dd')
  )
}

function dayLabel(
  startTs: number,
  locale: string,
  timezone: string | null,
  now: number,
): string {
  if (isSameCalendarDay(startTs, now, locale, timezone)) {
    return TODAY_LABEL[toSupportedLocale(locale)] ?? TODAY_LABEL.en
  }
  return formatChartTimestamp(startTs, locale, timezone, 'EEE d')
}

export default function ChartDayPager({
  days,
  selectedStart,
  onSelect,
  locale,
  timezone,
}: {
  days: TimeseriesChartDayWindow[]
  selectedStart: number
  onSelect: (startTs: number) => void
  locale: string
  timezone: string | null
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null)
  const now = Date.now()
  const index = days.findIndex((day) => day.startTs === selectedStart)
  const prev = index > 0 ? days[index - 1] : null
  const next = index >= 0 && index < days.length - 1 ? days[index + 1] : null

  useEffect(() => {
    const button = activeRef.current
    const scroller = button?.parentElement
    if (!button || !scroller) {
      return
    }
    const left =
      button.offsetLeft - scroller.clientWidth / 2 + button.offsetWidth / 2
    scroller.scrollTo({ left: Math.max(0, left) })
  }, [selectedStart])

  if (days.length < 2) {
    return null
  }

  return (
    <div className="ip:flex ip:items-center ip:gap-1 ip:pt-1">
      <button
        type="button"
        aria-label="Previous day"
        disabled={!prev}
        onClick={() => prev && onSelect(prev.startTs)}
        className={twMerge(
          'ip:flex ip:size-5 ip:shrink-0 ip:items-center ip:justify-center ip:rounded-full ip:text-dark/70 ip:dark:text-white/70',
          prev
            ? 'ip:hover:bg-primary/20'
            : 'ip:cursor-not-allowed ip:opacity-30',
        )}
      >
        <IpAngleLeftB className="ip:size-3.5" />
      </button>
      <div
        className="ip:flex ip:min-w-0 ip:flex-1 ip:gap-1 ip:overflow-x-auto ip:scrollbar-hide"
        role="tablist"
        aria-label="Forecast day"
      >
        {days.map((day) => {
          const active = day.startTs === selectedStart
          return (
            <button
              key={day.startTs}
              ref={active ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(day.startTs)}
              className={twMerge(
                'ip:h-5 ip:shrink-0 ip:rounded-full ip:px-2 ip:text-xs ip:leading-none ip:whitespace-nowrap',
                active
                  ? 'ip:bg-primary ip:text-white'
                  : 'ip:text-dark/70 ip:opacity-60 ip:hover:bg-primary/20 ip:hover:opacity-100 ip:dark:text-white/70',
              )}
            >
              {dayLabel(day.startTs, locale, timezone, now)}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        aria-label="Next day"
        disabled={!next}
        onClick={() => next && onSelect(next.startTs)}
        className={twMerge(
          'ip:flex ip:size-5 ip:shrink-0 ip:items-center ip:justify-center ip:rounded-full ip:text-dark/70 ip:dark:text-white/70',
          next
            ? 'ip:hover:bg-primary/20'
            : 'ip:cursor-not-allowed ip:opacity-30',
        )}
      >
        <IpAngleRightB className="ip:size-3.5" />
      </button>
    </div>
  )
}
