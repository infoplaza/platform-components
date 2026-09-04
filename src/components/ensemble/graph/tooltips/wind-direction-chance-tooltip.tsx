import type { CSSProperties, ReactNode } from 'react'
import { isEmpty } from '../../utils/is-empty'

type WindDirectionChancePayloadEntry = {
  value?: number | null
  dataKey?: string
  name?: string
  color?: string
  stroke?: string
  unit?: string
}

type WindDirectionChanceTooltipProps = {
  payload?: WindDirectionChancePayloadEntry[]
  label?: unknown
  labelFormatter?: (label: unknown) => ReactNode
  separator?: string
}

function WindDirectionChanceTooltip(props: WindDirectionChanceTooltipProps) {
  const { payload, label, labelFormatter, separator } = props
  const displayView = (payload ?? []).filter((p) => p.value && p.value > 0)

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
                    {p.value?.toFixed(0)} {p.unit}
                  </span>
                </div>
              ) : null,
            )}
        </div>
      </div>
    </div>
  )
}

WindDirectionChanceTooltip.wrapperStyle = {
  position: 'absolute',
  top: '-35px',
  right: '0px',
  transform: 'none',
  display: 'flex',
  justifyContent: 'center',
} as CSSProperties

export default WindDirectionChanceTooltip
