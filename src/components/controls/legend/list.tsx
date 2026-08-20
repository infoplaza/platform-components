import React from 'react'
import { twMerge } from '@/src/utilities/external/twMerge'
import type { Label, LegendComponentProps, LegendInfo, RowVisualization } from '@/src/utilities/legends'
import { ColorSwatch } from './parts'
import { getLabels, isMultiRowLegend } from './utils'

interface MapControlLegendListProps extends LegendComponentProps {
    legends: LegendInfo[]
}

export default function MapControlLegendList({
    legends,
    small = false,
    className = '',
}: MapControlLegendListProps): React.ReactElement | null {
    if (!legends?.length) {
        return null
    }

    const legend = legends[0]
    const { visualization } = legend
    const colors = visualization.colors
    const databounds = visualization.databounds
    const isMultiRow = isMultiRowLegend(legend)
    const rowCount = isMultiRow ? 4 : 1
    const rowStartIndex = isMultiRow ? 1 : 0
    const rowEndIndex = isMultiRow ? rowCount - 1 : rowCount
    const rowCountTotal = rowEndIndex - rowStartIndex
    const rowItemCount = databounds.length / rowCount

    const renderListItems = (rowIndex: number) => {
        const rowVisualization: RowVisualization = {
            colors: [],
            databounds: [],
            datalabels: visualization.datalabels,
            labels: visualization.labels,
        }

        for (let rowItemIndex = 0; rowItemIndex < rowItemCount; rowItemIndex++) {
            const index = rowItemIndex * rowCount + rowIndex
            const color = colors[index]
            const data = databounds[index]

            if (color && data != null) {
                rowVisualization.colors.push(color)
                rowVisualization.databounds.push(data)
            }
        }

        const labelArray: Label[] = getLabels(rowVisualization)

        return rowVisualization.colors.map((color, index) => {
            const value = rowVisualization.databounds[index]
            const label = labelArray[index]?.text || value?.toString() || ''

            return (
                <div
                    key={`${rowIndex}-${index}`}
                    className="ip:flex ip:items-center ip:gap-2 ip:py-0.5 ip:px-2 ip:rounded"
                >
                    <ColorSwatch color={color} size="md" />
                    <span className="ip:text-xs ip:font-medium ip:text-gray-700 ip:dark:text-gray-300 ip:sm:block ip:hidden ip:min-w-3">
                        {value}
                    </span>
                    <span className="ip:text-3xs ip:sm:text-xs ip:text-gray-600 ip:dark:text-gray-400 ip:flex-1">
                        {label}
                    </span>
                </div>
            )
        })
    }

    return (
        <div
            className={twMerge(
                'ip:flex ip:flex-col ip:bg-white/80 ip:dark:bg-dark/80 ip:backdrop-blur-md',
                small ? '' : 'ip:md:rounded ip:overflow-hidden',
                'ip:py-1 ip:pointer-events-auto ip:rounded-md',
                className
            )}
        >
            {Array.from({ length: rowCountTotal }, (_, i) =>
                renderListItems(rowStartIndex + i)
            )}
        </div>
    )
}
