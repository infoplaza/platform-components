import type { CSSProperties, ReactNode } from 'react'
import { isEmpty } from '../../utils/is-empty'

type PrecipitationProbabilityPayloadEntry = {
  value?: number | number[] | null
  dataKey?: string
  name?: string
  color?: string
  stroke?: string
  unit?: string
}

type PrecipitationProbabilityTooltipProps = {
  payload?: PrecipitationProbabilityPayloadEntry[]
  label?: unknown
  labelFormatter?: (label: unknown) => ReactNode
  separator?: string
  decimalPlace?: number
}

function PrecipitationProbabilityTooltip(
  props: PrecipitationProbabilityTooltipProps,
) {
  const { payload, label, labelFormatter, separator } = props

  let accumulatedValue = 0
  const displayView = (payload ?? [])
    .map((item) => {
      const numeric = Array.isArray(item.value)
        ? Math.min(...item.value)
        : Number(item.value ?? 0)
      accumulatedValue += numeric
      return {
        ...item,
        value: accumulatedValue.toFixed(0),
      }
    })
    .filter((p) => p.value && Number(p.value) > 0)

  return (
    <div className="ip:w-full ip:md:w-auto">
      <div className="ip:rounded ip:bg-white ip:p-2 ip:dark:bg-transparent">
        <div className="ip:flex ip:justify-center ip:gap-3">
          <div className="ip:text-xs ip:font-light">
            {label ? (labelFormatter?.(label) ?? null) : null}
          </div>
          {!isEmpty(displayView) &&
            displayView.map((p, i) =>
              p?.dataKey ? (
                <div
                  key={`tooltip_${i}_${p.dataKey}`}
                  className="ip:text-xs ip:font-light"
                >
                  <span
                    className="ip:brightness-75"
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
                    {p.value} {p.unit}
                  </span>
                </div>
              ) : null,
            )}
        </div>
      </div>
    </div>
  )
}

PrecipitationProbabilityTooltip.wrapperStyle = {
  position: 'absolute',
  top: '-35px',
  right: '0px',
  transform: 'none',
  display: 'flex',
  justifyContent: 'center',
} as CSSProperties

export default PrecipitationProbabilityTooltip
