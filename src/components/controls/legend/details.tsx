import React, { useMemo } from 'react'
import { DialogTitle } from '@headlessui/react'

import ModalDialog from '@/src/components/modals/dialog'
import { twMerge } from '@/src/utilities/external/twMerge'
import type { LegendInfo } from '@/src/utilities/legends'

import { ColorSwatch, GradientBar, LegendLabels } from './parts'
import {
    getRateRowLabel,
    isMultiRowLegend,
    parseLegend,
    resolveUnitLabel,
    type LegendRowMeta,
} from './utils'

export interface MapControlLegendDetailsProps {
    open: boolean
    onClose: () => void
    legends: LegendInfo[]
    /**
     * When `true` each row renders a categorical breakdown table; otherwise
     * it renders a continuous gradient bar.
     */
    listType?: boolean
    /**
     * Optional override of the dialog title. Defaults to "Legend".
     */
    title?: string
    className?: string
}

/**
 * Dialog that gives a much larger, readable view of every active legend.
 */
export default function MapControlLegendDetails({
    open,
    onClose,
    legends,
    listType = false,
    title = 'Legend',
    className,
}: MapControlLegendDetailsProps) {
    if (!legends?.length) return null

    return (
        <ModalDialog
            open={open}
            onClose={onClose}
            width={twMerge(
                'ip:max-w-2xl ip:w-full ip:bg-cloud ip:dark:bg-dark ip:sm:mt-[10vh] ip:mt-[30vh] ip:mb-4',
                className
            )}
        >
            <DialogTitle as="h3" className="ip:text-lg ip:font-bold ip:sm:font-medium ip:text-dark ip:dark:text-white">
                {title}
            </DialogTitle>
            <div className="ip:mt-6 ip:flex ip:flex-col ip:gap-6 ip:dark:text-white">
                {legends.map((legend) => (
                    <LegendDetailsSection
                        key={legend.slug}
                        legend={legend}
                        listType={listType}
                    />
                ))}
            </div>
        </ModalDialog>
    )
}

interface LegendDetailsSectionProps {
    legend: LegendInfo
    listType: boolean
}

/**
 * Single legend block: header and one (or many, for /hr) gradient strips
 * with full labels, or a per-stop value table beneath.
 */
function LegendDetailsSection({ legend, listType }: LegendDetailsSectionProps) {
    const { unit, unitKey } = legend
    const isMultiRow = isMultiRowLegend(legend)
    const { rows } = useMemo(() => parseLegend(legend, { allRows: true }), [legend])

    const resolvedUnitLabel = resolveUnitLabel({ unitKey, unit })
    const title = legend.i18n || legend.slug

    return (
        <section className="ip:flex ip:flex-col ip:gap-3 ip:rounded-lg ip:bg-white/60 ip:dark:bg-gray-900/40 ip:p-3 ip:sm:p-4">
            <LegendDetailsHeader
                title={title}
                unit={resolvedUnitLabel}
                slug={legend.slug}
            />
            <div className="ip:flex ip:flex-col ip:gap-5">
                {rows.map((row) => (
                    <LegendDetailsRow
                        key={row.rowIndex}
                        row={row}
                        rowLabel={isMultiRow ? getRateRowLabel(row.rowIndex) : undefined}
                        listType={listType}
                    />
                ))}
            </div>
        </section>
    )
}

interface LegendDetailsHeaderProps {
    title: string
    unit?: string
    slug?: string
}

function LegendDetailsHeader({ title, unit, slug }: LegendDetailsHeaderProps) {
    return (
        <header className="ip:flex ip:items-center ip:justify-between ip:gap-3">
            <div className="ip:flex ip:items-baseline ip:gap-2 ip:min-w-0">
                <h3 className="ip:text-base ip:font-semibold ip:truncate">{title}</h3>
                {slug && (
                    <span
                        className="ip:text-3xs ip:font-mono ip:text-gray-500 ip:dark:text-gray-400 ip:truncate"
                        aria-hidden
                    >
                        {slug}
                    </span>
                )}
            </div>
            {unit && (
                <span className="ip:text-xs ip:font-medium ip:px-2 ip:py-0.5 ip:rounded ip:bg-gray-200/80 ip:dark:bg-gray-700/80 ip:text-gray-800 ip:dark:text-gray-200 ip:shrink-0">
                    {unit}
                </span>
            )}
        </header>
    )
}

interface LegendDetailsRowProps {
    row: LegendRowMeta
    rowLabel?: string
    listType: boolean
}

function LegendDetailsRow({ row, rowLabel, listType }: LegendDetailsRowProps) {
    return (
        <div className="ip:flex ip:flex-col ip:gap-2">
            {rowLabel && (
                <div className="ip:text-xs ip:font-medium ip:text-gray-600 ip:dark:text-gray-300 ip:uppercase ip:tracking-wide">
                    {rowLabel}
                </div>
            )}
            {listType ? (
                <LegendDetailsTable row={row} />
            ) : (
                <LegendDetailsGradient row={row} />
            )}
        </div>
    )
}

function LegendDetailsGradient({ row }: { row: LegendRowMeta }) {
    return (
        <div className="ip:relative ip:h-12 ip:w-full ip:overflow-hidden ip:rounded-md ip:ring-1 ip:ring-black/10 ip:dark:ring-white/10">
            <GradientBar colors={row.visualization.colors} />
            <LegendLabels
                labels={row.labels}
                colorCount={row.visualization.colors.length}
                fontSize="clamp(11px, 1.2vw, 14px)"
                fontWeight={700}
            />
        </div>
    )
}

/**
 * Tabular breakdown of every color stop with its lower/upper bounds and
 * (when present) categorical label.
 */
function LegendDetailsTable({ row }: { row: LegendRowMeta }) {
    const { colors, databounds, labels } = row.visualization

    return (
        <div className="ip:overflow-hidden ip:rounded-md ip:ring-1 ip:ring-black/5 ip:dark:ring-white/5">
            <div
                role="row"
                className="ip:grid ip:grid-cols-[auto_1fr_2fr] ip:gap-3 ip:px-3 ip:py-1.5 ip:bg-gray-100/80 ip:dark:bg-gray-800/60 ip:text-3xs ip:font-medium ip:uppercase ip:tracking-wide ip:text-gray-500 ip:dark:text-gray-400"
            >
                <span aria-hidden>&nbsp;</span>
                <span>Range</span>
                <span>Label</span>
            </div>
            <ul className="ip:divide-y ip:divide-gray-200/60 ip:dark:divide-gray-700/60">
                {colors.map((color, index) => {
                    const upper = databounds[index]
                    const label = labels?.[index] ?? row.labels[index]?.text ?? ''
                    return (
                        <li
                            key={index}
                            className="ip:grid ip:grid-cols-[auto_1fr_2fr] ip:items-center ip:gap-3 ip:px-3 ip:py-1.5 ip:text-xs ip:text-gray-800 ip:dark:text-gray-200"
                        >
                            <ColorSwatch color={color} size="md" />
                            <span className="ip:font-mono ip:tabular-nums">
                                {upper?.toString()}
                            </span>
                            <span className="ip:truncate ip:text-gray-600 ip:dark:text-gray-300">
                                {label}
                            </span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
