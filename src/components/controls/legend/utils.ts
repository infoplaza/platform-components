import type { Label, LegendInfo, RowVisualization, Visualization } from '@/src/utilities/legends'

/**
 * Number of rate-per-hour rows packed into a single legend visualization.
 * Order in the source data is `[1h, 3h, 6h, 24h]`.
 */
const RATE_ROW_COUNT = 4

/**
 * `/hr` legends bundle four rates into one `colors` array. We only render the
 * "informative" middle rows (3h, 6h) by default.
 */
const RATE_VISIBLE_RANGE = { start: 1, end: RATE_ROW_COUNT - 1 } as const

export interface LegendRowMeta {
    rowIndex: number
    visualization: RowVisualization
    labels: Label[]
}

export interface ParsedLegend {
    rows: LegendRowMeta[]
    isMultiRow: boolean
}

/**
 * Build the human-readable labels for a given visualization. Prefers
 * pre-baked `labels` (categorical) and falls back to mapping numeric
 * `datalabels` onto the closest `databounds` slot.
 */
export function getLabels(visualization: Visualization | RowVisualization): Label[] {
    if (!visualization) return []

    if (visualization.labels) {
        return visualization.labels.map((label, index) => ({
            location: index,
            text: label,
        }))
    }

    if (!visualization.datalabels?.length || !visualization.databounds?.length) {
        return []
    }

    return visualization.datalabels.map((label) => {
        const dataIndex = visualization.databounds.findIndex(
            (item) => item != null && item >= label
        )
        return { location: dataIndex, text: label.toString() }
    })
}

/**
 * Slice one row out of an interleaved multi-row visualization (e.g. precip /hr).
 * For single-row legends pass `rowCount = 1` and `rowIndex = 0`.
 */
export function buildRowVisualization(
    visualization: Visualization,
    rowIndex: number,
    rowCount: number,
    rowItemCount: number
): RowVisualization {
    const { colors, databounds, datalabels, labels } = visualization
    const row: RowVisualization = {
        colors: [],
        databounds: [],
        datalabels,
        labels,
    }

    for (let rowItemIndex = 0; rowItemIndex < rowItemCount; rowItemIndex++) {
        const index = rowItemIndex * rowCount + rowIndex
        const color = colors[index]
        const data = databounds[index]
        if (color && data != null) {
            row.colors.push(color)
            row.databounds.push(data)
        }
    }
    return row
}

/**
 * Heuristic: a legend is "multi-row" when its unit advertises a per-hour
 * rate AND the source contains real lower-bound data.
 */
export function isMultiRowLegend(legend: LegendInfo): boolean {
    const { unit, visualization } = legend
    return Boolean(unit && unit.indexOf('/hr') > -1 && visualization.databounds?.[0] != null)
}

/**
 * Decompose a legend into its individual visual rows. Single-row legends
 * yield exactly one entry.
 */
export function parseLegend(legend: LegendInfo, options?: { allRows?: boolean }): ParsedLegend {
    const { visualization } = legend
    const isMultiRow = isMultiRowLegend(legend)
    const rowCount = isMultiRow ? RATE_ROW_COUNT : 1
    const rowItemCount = (visualization.databounds?.length ?? 0) / rowCount

    const start = isMultiRow && !options?.allRows ? RATE_VISIBLE_RANGE.start : 0
    const end = isMultiRow && !options?.allRows ? RATE_VISIBLE_RANGE.end : rowCount

    const rows: LegendRowMeta[] = []
    for (let rowIndex = start; rowIndex < end; rowIndex++) {
        const rowVisualization = buildRowVisualization(
            visualization,
            rowIndex,
            rowCount,
            rowItemCount
        )
        rows.push({
            rowIndex,
            visualization: rowVisualization,
            labels: getLabels(rowVisualization),
        })
    }

    return { rows, isMultiRow }
}

/**
 * Pick the most user-friendly label for a legend's unit.
 */
export function resolveUnitLabel({ unitKey, unit }: { unitKey?: string; unit?: string }): string {
    return unit ?? unitKey ?? ''
}

/**
 * Human label for a /hr row index (`1h`, `3h`, `6h`, `24h`).
 */
export function getRateRowLabel(rowIndex: number): string {
    switch (rowIndex) {
        case 0:
            return '1h'
        case 1:
            return '3h'
        case 2:
            return '6h'
        case 3:
            return '24h'
        default:
            return `${rowIndex}`
    }
}
