import type { CSSProperties, ReactNode } from 'react'
import { twMerge } from '@/src/utilities/external/twMerge'
import { isEmpty } from '../../utils/is-empty'

type TooltipPayloadEntry = {
  value?: number | number[] | null
  display?: string
  dataKey?: string
  name?: string
  color?: string
  stroke?: string
  unit?: string
}

type ExtraSeriesConfig = {
  dataKey?: string
  name?: string
  color?: string
  stroke?: string
}

type TooltipProps = {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: unknown
  labelFormatter?: (label: unknown) => ReactNode
  separator?: string
  decimalPlace?: number
  extraSeries?: ExtraSeriesConfig[]
}

function Tooltip(props: TooltipProps) {
  const {
    active,
    payload,
    label,
    labelFormatter,
    separator,
    decimalPlace = 0,
    extraSeries = [],
  } = props
  const isTypeArea = payload?.[0]?.display === 'area'
  const extraConfig = extraSeries.filter((s) => s?.dataKey)

  let displayView: Array<TooltipPayloadEntry | undefined> = []
  if (payload?.length) {
    if (isTypeArea) {
      displayView = payload.filter((p) => {
        const value = p?.value
        if (Array.isArray(value)) {
          return value.every((v) => v !== null && v !== undefined)
        }
        return value !== null && value !== undefined
      })
    } else {
      const numericValues = payload.map((p) =>
        typeof p.value === 'number' ? p.value : Number.NEGATIVE_INFINITY,
      )
      const maxPayload = payload.find(
        (p) => p.value === Math.max(...numericValues),
      )
      const medianPayload = payload.find((p) => p.dataKey === 'median')
      const operatorPayload = payload.find((p) => p.dataKey === 'control')
      const minPayload = payload.find(
        (p) => p.value === Math.min(...numericValues),
      )
      const extraPayload: TooltipPayloadEntry[] = []
      extraConfig.forEach((s) => {
        const match = payload.find((p) => p.dataKey === s.dataKey)
        if (!match) return
        extraPayload.push({
          ...match,
          name: s.name ?? match.name,
          color: s.stroke ?? s.color ?? match.color,
          stroke: s.stroke ?? s.color ?? match.stroke,
        })
      })

      displayView = [
        maxPayload ? { ...maxPayload, name: 'Maximum' } : undefined,
        operatorPayload,
        medianPayload,
        minPayload ? { ...minPayload, name: 'Minimum' } : undefined,
        ...extraPayload,
      ]
    }
  }

  const invalidPayload =
    !active ||
    !payload?.length ||
    !displayView.find((p) => p?.dataKey === 'median')

  if (invalidPayload) {
    return null
  }

  return (
    <div className="ip:w-full ip:md:w-auto">
      <div className="ip:rounded ip:bg-white ip:p-2 ip:dark:bg-transparent">
        <div className="ip:flex ip:justify-center ip:gap-3">
          <div className="ip:text-xs ip:font-light">
            {labelFormatter?.(label)}
          </div>
          {!isEmpty(displayView) &&
            displayView.map((p, i) =>
              p?.dataKey ? (
                <div
                  key={`tooltip_${i}_${p.dataKey}`}
                  className={twMerge('ip:text-xs ip:font-light ip:brightness-75')}
                >
                  <span
                    style={{
                      color: p.color,
                      borderColor: p.stroke,
                      borderStyle: 'solid',
                    }}
                  >
                    {p.name} {separator}
                  </span>
                  <span
                    className="ip:font-bold"
                    style={{
                      color: p.color,
                      borderColor: p.stroke,
                      borderStyle: 'solid',
                    }}
                  >
                    {Array.isArray(p.value)
                      ? `${p.value[0]?.toFixed(decimalPlace)} ~ ${p.value[1]?.toFixed(decimalPlace)}`
                      : p.value?.toFixed(decimalPlace)}{' '}
                    {p.unit}
                  </span>
                </div>
              ) : null,
            )}
        </div>
      </div>
    </div>
  )
}

Tooltip.wrapperStyle = {
  position: 'absolute',
  top: '-35px',
  right: '0px',
  transform: 'none',
  display: 'flex',
  justifyContent: 'center',
} as CSSProperties

export default Tooltip
