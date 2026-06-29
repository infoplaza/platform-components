
export interface LegendVisualization {
    databounds: (number | null)[]
    datalabels?: (number | string)[]
    colors?: unknown
    labels?: string[]
}

export interface LegendForPalette {
    unit?: string
    visualization: LegendVisualization
}

/**
 * Multi-row legend layouts (e.g. precipitation rate "/hr") interleave 4 rows
 * into a single databounds/colors array, but only the inner two rows (1 & 2)
 * carry the visible data — rows 0 and 3 are filler. See
 * `_experimental/map/control/legend.tsx` (`buildRowVisualization` +
 * `rowStartIndex` / `rowEndIndex`) for the matching de-interleave logic.
 */
const MULTI_ROW_COUNT = 4
const MULTI_ROW_VISIBLE_START = 1
const MULTI_ROW_VISIBLE_END = MULTI_ROW_COUNT - 1

/**
 * Returns true when the legend uses the multi-row "/hr" precipitation layout,
 * where databounds/colors interleave several rows of data and need to be
 * flattened back into a single monotonic palette.
 */
export function isMultiRowLegend(legend: LegendForPalette | undefined): boolean {
    if (!legend) {
        return false
    }
    const { unit, visualization } = legend
    const databounds = visualization?.databounds
    return (
        typeof unit === 'string' &&
        unit.indexOf('/hr') > -1 &&
        Array.isArray(databounds) &&
        databounds.length > 0 &&
        databounds[0] != null &&
        databounds.length % MULTI_ROW_COUNT === 0
    )
}

/**
 * De-interleaves a multi-row legend into a single linear sequence by
 * concatenating the visible rows in order (row 1 then row 2 by default).
 *
 * Mirrors `buildRowVisualization` from `legend.tsx`: for each visible row,
 * pulls items at `index = rowItemIndex * rowCount + rowIndex`, skipping
 * entries with no color or no databound (just like the UI does).
 */
export function flattenMultiRowLegend(
    legend: LegendForPalette,
    rowCount: number = MULTI_ROW_COUNT,
    rowStartIndex: number = MULTI_ROW_VISIBLE_START,
    rowEndIndex: number = MULTI_ROW_VISIBLE_END
): LegendForPalette {
    const databounds = legend.visualization?.databounds ?? []
    const colors = (legend.visualization?.colors as unknown[] | undefined) ?? []
    const rowItemCount = Math.floor(databounds.length / rowCount)

    const flatDatabounds: (number | null)[] = []
    const flatColors: unknown[] = []
    for (let rowIndex = rowStartIndex; rowIndex < rowEndIndex; rowIndex++) {
        for (let i = 0; i < rowItemCount; i++) {
            const idx = i * rowCount + rowIndex
            const bound = databounds[idx]
            const color = colors[idx]
            if (bound == null || color == null) {
                continue
            }
            flatDatabounds.push(bound)
            flatColors.push(color)
        }
    }

    return {
        ...legend,
        visualization: {
            ...legend.visualization,
            databounds: flatDatabounds,
            colors: flatColors,
        },
    }
}

function parseRgbColor(rgba: unknown): [number, number, number] {
    if (typeof rgba !== 'string') {
        return [0, 0, 0]
    }
    const match = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    return match
        ? [Number(match[1]), Number(match[2]), Number(match[3])]
        : [0, 0, 0]
}