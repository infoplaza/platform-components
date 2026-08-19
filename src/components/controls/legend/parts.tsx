import React from 'react'
import { twMerge } from '@/src/utilities/external/twMerge'
import type { Label } from '@/src/utilities/legends'

interface GradientBarProps {
    colors: string[]
    className?: string
}

/**
 * Equal-width row of color stops. Stretches to fill its parent.
 */
export function GradientBar({ colors, className }: GradientBarProps) {
    return (
        <div className={twMerge('ip:flex ip:h-full ip:w-full', className)}>
            {colors.map((color, index) => (
                <div
                    key={index}
                    className="ip:flex-1 ip:h-full"
                    style={{ backgroundColor: color }}
                    title={`${color} (${index + 1})`}
                />
            ))}
        </div>
    )
}

interface LegendLabelsProps {
    labels: Label[]
    colorCount: number
    className?: string
    fontSize?: string
    fontWeight?: number
}

/**
 * Tick labels overlaid on top of a gradient bar. Positions are clamped to
 * keep the first/last labels readable inside the strip.
 */
export function LegendLabels({
    labels,
    colorCount,
    className,
    fontSize = 'clamp(9px, 2vw, 14px)',
    fontWeight = 1000,
}: LegendLabelsProps) {
    return (
        <div
            className={twMerge(
                'ip:absolute ip:inset-0 ip:flex ip:items-center ip:justify-between ip:px-1',
                className
            )}
        >
            {labels.map((label, index) => {
                if (colorCount <= 1) return null
                let position = (label.location / (colorCount - 1)) * 100
                if (position < 0) return null
                if (position < 1) position += 1
                if (position === 100) position -= 3
                return (
                    <div
                        key={index}
                        className="ip:absolute ip:transform ip:-translate-x-1/2 ip:text-gray-200"
                        style={{
                            left: `${position}%`,
                            fontSize,
                            fontWeight,
                            textShadow: '0 1px 2px rgba(0,0,0,0.55)',
                        }}
                    >
                        {label.text}
                    </div>
                )
            })}
        </div>
    )
}

interface UnitLabelProps {
    label: string
    className?: string
}

/**
 * Pill at the start of a gradient row that shows the active unit.
 */
export function UnitLabel({ label, className }: UnitLabelProps) {
    return (
        <div
            className={twMerge(
                'ip:shrink-0 ip:flex ip:items-center ip:justify-center ip:px-2.5 ip:h-full ip:min-w-10',
                'ip:rounded-l-md',
                'ip:bg-gray-200/90 ip:dark:bg-gray-700/90 ip:text-gray-800 ip:dark:text-gray-200',
                'ip:text-xs ip:font-medium ip:backdrop-blur-sm',
                className
            )}
        >
            {label}
        </div>
    )
}

interface ColorSwatchProps {
    color: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const SWATCH_SIZE = {
    sm: 'ip:w-3 ip:h-3',
    md: 'ip:w-4 ip:h-4',
    lg: 'ip:w-5 ip:h-5',
} as const

/**
 * Rounded color square used in list-style legend rows.
 */
export function ColorSwatch({ color, size = 'md', className }: ColorSwatchProps) {
    return (
        <div
            className={twMerge(
                SWATCH_SIZE[size],
                'ip:rounded ip:border ip:border-gray-300 ip:dark:border-gray-600 ip:shrink-0',
                className
            )}
            style={{ backgroundColor: color }}
        />
    )
}
