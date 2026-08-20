import React from 'react'
import { twMerge } from '@/src/utilities/external/twMerge'
import type { LegendComponentProps, LegendInfo } from '@/src/utilities/legends'
import { GradientBar, LegendLabels, UnitLabel } from './parts'
import { isMultiRowLegend, parseLegend, resolveUnitLabel } from './utils'

export { default as MapControlLegendDetails } from './details'
export { LegendTrigger } from './trigger'

const ROW_HEIGHT_DEFAULT = 28

interface MapControlLegendProps extends LegendComponentProps {
    legends: LegendInfo[]
}

interface LegendRowProps {
    legend: LegendInfo
    rowHeight: number
}

function LegendRow({ legend, rowHeight }: LegendRowProps): React.ReactElement {
    const { unit, unitKey } = legend
    const isMultiRow = isMultiRowLegend(legend)
    const { rows } = parseLegend(legend)

    const showUnit = Boolean(unit || unitKey)
    const resolvedUnitLabel = resolveUnitLabel({ unitKey, unit })

    return (
        <div
            className="ip:relative ip:flex ip:flex-col ip:flex-1 ip:min-h-0"
            style={{ height: `${rowHeight * (isMultiRow ? 2 : 1)}px` }}
        >
            {rows.map((row) => (
                <div
                    key={row.rowIndex}
                    className="ip:relative ip:w-full ip:flex-1 ip:min-h-0 ip:flex"
                >
                    {showUnit && <UnitLabel label={resolvedUnitLabel} />}
                    <div className="ip:relative ip:flex-1 ip:min-w-0 ip:min-h-0">
                        <GradientBar colors={row.visualization.colors} />
                        <LegendLabels
                            labels={row.labels}
                            colorCount={row.visualization.colors.length}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function MapControlLegend({
    legends,
    small = false,
    height = ROW_HEIGHT_DEFAULT,
    className = '',
}: MapControlLegendProps): React.ReactElement | null {
    if (!legends?.length) return null

    const rowHeight = height
    const totalHeight = rowHeight * legends.length

    return (
        <div
            className={twMerge(
                'ip:flex ip:flex-col ip:sm:inline-flex ip:bg-white/80 ip:dark:bg-dark/80 ip:backdrop-blur-md',
                small ? '' : 'ip:md:rounded ip:overflow-hidden',
                'ip:w-full ip:sm:max-w-sm ip:lg:max-w-md ip:xl:max-w-lg',
                className
            )}
            style={{ height: `${totalHeight}px` }}
        >
            <div className="ip:relative ip:flex-1 ip:flex ip:flex-col">
                {legends.map((legend) => (
                    <LegendRow
                        key={legend.slug}
                        legend={legend}
                        rowHeight={rowHeight}
                    />
                ))}
            </div>
        </div>
    )
}
