import React from 'react'

interface SliderFieldProps {
    label: string
    labelClassName?: string
    value: number
    min: number
    max: number
    step?: number
    onChange: (value: number) => void
    disabled?: boolean
}

export default function SliderField({ label, labelClassName = '', value, min, max, step = 1, onChange, disabled = false }: SliderFieldProps) {
    const numericValue = Number.isFinite(value) ? value : min

    return (
        <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
            <div className={`ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start ${labelClassName}`}>
                {label}
            </div>
            <div className="ip:flex ip:items-center ip:gap-2 ip:w-full">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={numericValue}
                    onChange={(event) => onChange(parseFloat(event.target.value))}
                    disabled={disabled}
                    className={`ip:w-full ip:accent-stone-500 ${disabled ? 'ip:opacity-50 ip:cursor-not-allowed' : ''}`}
                />
                <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={numericValue}
                    onChange={(event) => onChange(parseFloat(event.target.value))}
                    disabled={disabled}
                    className={`ip:w-20 ip:text-xs ip:bg-white/70 ip:dark:bg-white/10 ip:border ip:border-gray-300 ip:dark:border-white/20 ip:rounded ip:px-2 ip:py-1 ${disabled ? 'ip:opacity-50 ip:cursor-not-allowed' : ''}`}
                />
            </div>
        </div>
    )
}
