import React, { useMemo, useState, useEffect } from 'react'

interface RangeSliderFieldProps {
    label: string
    valueMin: number
    valueMax: number
    min: number
    max: number
    step?: number
    palette?: string | null
    onMinChange: (value: number) => void
    onMaxChange: (value: number) => void
    disabled?: boolean
}

function rangeValueToPercent(value: number, min: number, max: number) {
    const span = max - min
    if (!Number.isFinite(span) || span <= 0) {
        return 50
    }
    const clamped = Math.min(max, Math.max(min, value))
    return ((clamped - min) / span) * 100
}

function formatRangeValue(value: number, step: number) {
    if (!Number.isFinite(value)) {
        return ''
    }
    const s = String(step)
    let decimals = 0
    if (s.includes('e-')) {
        decimals = Math.min(8, Math.max(2, Math.ceil(-Math.log10(step))))
    } else {
        const dot = s.indexOf('.')
        decimals = dot < 0 ? 0 : Math.min(8, s.length - dot - 1)
    }
    return decimals === 0 ? String(Math.round(value)) : value.toFixed(decimals)
}

const RANGE_INPUT_CLASS =
    'ip:pointer-events-none ip:absolute ip:inset-x-0 ip:top-0 ip:h-8 ip:w-full ip:appearance-none ip:bg-transparent ' +
    'ip:[&::-webkit-slider-runnable-track]:h-2 ip:[&::-webkit-slider-runnable-track]:rounded-full ' +
    'ip:[&::-webkit-slider-runnable-track]:bg-transparent ' +
    'ip:[&::-webkit-slider-thumb]:pointer-events-auto ip:[&::-webkit-slider-thumb]:relative ip:[&::-webkit-slider-thumb]:z-10 ' +
    'ip:[&::-webkit-slider-thumb]:mt-2.5 ip:[&::-webkit-slider-thumb]:h-4 ip:[&::-webkit-slider-thumb]:w-4 ' +
    'ip:[&::-webkit-slider-thumb]:cursor-grab ip:[&::-webkit-slider-thumb]:appearance-none ' +
    'ip:[&::-webkit-slider-thumb]:rounded-full ip:[&::-webkit-slider-thumb]:border ip:[&::-webkit-slider-thumb]:border-stone-300 ' +
    'ip:[&::-webkit-slider-thumb]:bg-white ip:[&::-webkit-slider-thumb]:shadow-sm ip:active:[&::-webkit-slider-thumb]:cursor-grabbing ' +
    'ip:dark:[&::-webkit-slider-thumb]:border-white/30 ' +
    'ip:[&::-moz-range-track]:h-2 ip:[&::-moz-range-track]:rounded-full ip:[&::-moz-range-track]:bg-transparent ' +
    'ip:[&::-moz-range-thumb]:pointer-events-auto ip:[&::-moz-range-thumb]:h-4 ip:[&::-moz-range-thumb]:w-4 ' +
    'ip:[&::-moz-range-thumb]:cursor-grab ip:[&::-moz-range-thumb]:rounded-full ' +
    'ip:[&::-moz-range-thumb]:border ip:[&::-moz-range-thumb]:border-stone-300 ip:[&::-moz-range-thumb]:bg-white ' +
    'ip:[&::-moz-range-thumb]:shadow-sm ip:active:[&::-moz-range-thumb]:cursor-grabbing ' +
    'ip:dark:[&::-moz-range-thumb]:border-white/30'

export default function RangeSliderField({ label, valueMin, valueMax, min, max, step = 1, palette, onMinChange, onMaxChange, disabled = false }: RangeSliderFieldProps) {
    const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null)

    const vMin = Number.isFinite(valueMin) ? valueMin : min
    const vMax = Number.isFinite(valueMax) ? valueMax : max

    const pMin = rangeValueToPercent(vMin, min, max)
    const pMax = rangeValueToPercent(vMax, min, max)
    const leftPct = Math.min(pMin, pMax)
    const widthPct = Math.abs(pMax - pMin)

    const span = max - min
    const mid = min + span / 2
    const minThumbHigher = vMin <= mid
    const zMin =
        activeThumb === 'min' ? 30 : activeThumb === 'max' ? 10 : minThumbHigher ? 20 : 10
    const zMax =
        activeThumb === 'max' ? 30 : activeThumb === 'min' ? 10 : minThumbHigher ? 10 : 20

    useEffect(() => {
        if (!activeThumb) {
            return undefined
        }
        const end = () => setActiveThumb(null)
        window.addEventListener('pointerup', end)
        window.addEventListener('pointercancel', end)
        return () => {
            window.removeEventListener('pointerup', end)
            window.removeEventListener('pointercancel', end)
        }
    }, [activeThumb])

    const palleteUrl = useMemo(() => {
        if (!palette) {
            return null
        }
        return `url(${palette})`
    }, [palette])

    return (
        <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
            <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                {label}
            </div>
            <div className="ip:flex ip:min-w-0 ip:flex-1 ip:flex-col ip:gap-2">
                <div className="ip:relative ip:w-full ip:pb-12 ip:pt-1">
                    <div
                        className="ip:pointer-events-none ip:absolute ip:left-0 ip:right-0 ip:top-1/2 ip:h-2 ip:-translate-y-1/2 ip:rounded-full "
                        style={palleteUrl
                            ? {
                                backgroundImage: palleteUrl,
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }
                            : undefined}
                        aria-hidden
                    />
                    <div
                        className="ip:pointer-events-none ip:absolute ip:top-1/2 ip:h-2 ip:-translate-y-1/2 ip:rounded-full ip:ring-1 ip:ring-stone-500/60 ip:dark:ring-stone-300/70 ip:bg-white/20 ip:dark:bg-black/20"
                        style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                        }}
                        aria-hidden
                    />
                    <div className="ip:relative ip:h-4">
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={vMin}
                            onChange={(event) => {
                                const next = parseFloat(event.target.value)
                                onMinChange(Math.min(next, vMax))
                            }}
                            onPointerDown={() => !disabled && setActiveThumb('min')}
                            className={`${RANGE_INPUT_CLASS} ${disabled ? 'ip:opacity-50 ip:[&::-webkit-slider-thumb]:cursor-not-allowed ip:[&::-moz-range-thumb]:cursor-not-allowed' : ''}`}
                            style={{ zIndex: zMin }}
                            disabled={disabled}
                            aria-label={`${label} minimum`}
                        />
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={vMax}
                            onChange={(event) => {
                                const next = parseFloat(event.target.value)
                                onMaxChange(Math.max(next, vMin))
                            }}
                            onPointerDown={() => !disabled && setActiveThumb('max')}
                            className={`${RANGE_INPUT_CLASS} ${disabled ? 'ip:opacity-50 ip:[&::-webkit-slider-thumb]:cursor-not-allowed ip:[&::-moz-range-thumb]:cursor-not-allowed' : ''}`}
                            style={{ zIndex: zMax }}
                            disabled={disabled}
                            aria-label={`${label} maximum`}
                        />
                    </div>
                    <div
                        className="ip:pointer-events-none ip:absolute ip:bottom-5 ip:left-0 ip:right-0 ip:h-5 ip:text-xs ip:font-medium ip:text-stone-800 ip:dark:text-stone-100"
                        aria-hidden
                    >
                        <span className="ip:absolute ip:-translate-x-1/2 ip:whitespace-nowrap ip:-top-4"
                            style={{ left: `${pMin}%` }} >
                            {Number.isFinite(vMin) ? Math.round(vMin) : ''}
                        </span>
                        <span className="ip:absolute ip:-translate-x-1/2 ip:whitespace-nowrap ip:-top-4"
                            style={{ left: `${pMax}%` }} >
                            {Number.isFinite(vMax) ? Math.round(vMax) : ''}
                        </span>
                    </div>
                    <div
                        className="ip:pointer-events-none ip:absolute ip:bottom-0 ip:left-0 ip:right-0 ip:h-5 ip:text-2xs ip:text-stone-400 ip:dark:text-stone-500"
                        aria-hidden
                    >
                        <span className="ip:absolute ip:left-0 ip:-top-0 ip:flex ip:flex-col ip:items-center">
                            <span className="ip:mb-0.5 ip:h-1 ip:w-px ip:bg-stone-300 ip:dark:bg-white/30" />
                            {formatRangeValue(min, step)}
                        </span>
                        <span className="ip:absolute ip:right-0 ip:top-0 ip:flex ip:flex-col ip:items-center">
                            <span className="ip:mb-0.5 ip:h-1 ip:w-px ip:bg-stone-300 ip:dark:bg-white/30" />
                            {formatRangeValue(max, step)}
                        </span>
                    </div>
                </div>
                <div className="ip:flex ip:items-center ip:gap-2">
                    <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={vMin}
                        onChange={(event) => {
                            const next = parseFloat(event.target.value)
                            if (!Number.isFinite(next)) {
                                return
                            }
                            onMinChange(Math.min(next, vMax))
                        }}
                        disabled={disabled}
                        className={`ip:w-full ip:text-xs ip:bg-white/70 ip:dark:bg-white/10 ip:border ip:border-gray-300 ip:dark:border-white/20 ip:rounded ip:px-2 ip:py-1 ${disabled ? 'ip:opacity-50 ip:cursor-not-allowed' : ''}`}
                        aria-label={`${label} minimum (numeric)`}
                    />
                    <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={vMax}
                        onChange={(event) => {
                            const next = parseFloat(event.target.value)
                            if (!Number.isFinite(next)) {
                                return
                            }
                            onMaxChange(Math.max(next, vMin))
                        }}
                        disabled={disabled}
                        className={`ip:w-full ip:text-xs ip:bg-white/70 ip:dark:bg-white/10 ip:border ip:border-gray-300 ip:dark:border-white/20 ip:rounded ip:px-2 ip:py-1 ${disabled ? 'ip:opacity-50 ip:cursor-not-allowed' : ''}`}
                        aria-label={`${label} maximum (numeric)`}
                    />
                </div>
            </div>
        </div>
    )
}
