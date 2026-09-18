import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTimeseriesChartsContext } from '../context'
import {
  TIMESERIES_CHART_MIN_PX_PER_DAY,
  TIMESERIES_CHART_Y_AXIS_WIDTH,
} from '../defaults'
import {
  chartDayContaining,
  chartDayWindows,
  type TimeseriesChartDayWindow,
} from '../series'

const PLOT_RIGHT_MARGIN = 12

export function useTimeseriesChartDayView(
  ticks: number[] | undefined,
  width: number,
  fixedWidth: number | null,
): {
  days: TimeseriesChartDayWindow[]
  compact: boolean
  selected: TimeseriesChartDayWindow | null
  onDayStartChange: (startTs: number) => void
} {
  const ctx = useTimeseriesChartsContext()
  const [localDayStart, setLocalDayStart] = useState<number | null>(null)
  const days = useMemo(() => chartDayWindows(ticks), [ticks])
  const plotWidth =
    (fixedWidth ?? width) - TIMESERIES_CHART_Y_AXIS_WIDTH - PLOT_RIGHT_MARGIN
  const measured = fixedWidth != null || width > 0
  const compact =
    days.length > 1 &&
    measured &&
    plotWidth < days.length * TIMESERIES_CHART_MIN_PX_PER_DAY

  const selected = useMemo(
    () =>
      chartDayContaining(days, ctx?.dayStart ?? localDayStart ?? Date.now()),
    [ctx?.dayStart, days, localDayStart],
  )

  const onDayStartChangeFromCtx = ctx?.onDayStartChange
  const onDayStartChange = useCallback(
    (startTs: number) => {
      if (onDayStartChangeFromCtx) {
        onDayStartChangeFromCtx(startTs)
        return
      }
      setLocalDayStart(startTs)
    },
    [onDayStartChangeFromCtx],
  )

  useEffect(() => {
    if (!compact) {
      setLocalDayStart(null)
    }
  }, [compact])

  return { days, compact, selected, onDayStartChange }
}
