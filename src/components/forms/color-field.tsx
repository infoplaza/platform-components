import React from 'react'
import { RgbaColorPicker } from 'react-colorful'
import FormControlRadio from '@/src/components/forms/radio'
import { IpEyeDropperIcon } from '@/src/components/icons'

export interface RgbaColor {
    r: number
    g: number
    b: number
    a: number
}

export interface ColorPreset {
    label: string
    color: RgbaColor
    value: string
}

export const COLOR_PRESETS: ColorPreset[] = [
    { label: 'White', color: { r: 255, g: 255, b: 255, a: 1 }, value: 'white' },
    { label: 'Black', color: { r: 0, g: 0, b: 0, a: 1 }, value: 'black' },
    { label: 'Gray', color: { r: 128, g: 128, b: 128, a: 1 }, value: 'gray' }
]

function isSameColor(left: RgbaColor, right: RgbaColor) {
    return (
        left.r === right.r &&
        left.g === right.g &&
        left.b === right.b &&
        left.a === right.a
    )
}

interface ColorFieldProps {
    label: string
    color: RgbaColor
    onChange: (color: RgbaColor) => void
    pickerOpen: boolean
    setPickerOpen: (open: boolean | ((prev: boolean) => boolean)) => void
    presets?: ColorPreset[]
    disabled?: boolean
}

export default function ColorField({ label, color, onChange, pickerOpen, setPickerOpen, presets = COLOR_PRESETS, disabled = false }: ColorFieldProps) {
    const matchedPreset = presets.find((preset) => isSameColor(preset.color, color))
    const colorValue = matchedPreset ? matchedPreset.value : 'custom'
    const colorPreview = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`

    return (
        <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
            <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                {label}
            </div>
            <div className="ip:relative">
                <div className="ip:flex ip:items-center ip:gap-2">
                    <FormControlRadio
                        options={[
                            ...presets.map((preset) => ({
                                text: preset.label,
                                value: preset.value
                            })),
                            { text: 'Custom', value: 'custom' }
                        ]}
                        value={colorValue}
                        onChange={(value) => {
                            if (disabled) {
                                return
                            }

                            if (value === 'custom') {
                                setPickerOpen(true)
                                return
                            }

                            const preset = presets.find((entry) => entry.value === value)
                            if (preset) {
                                onChange(preset.color)
                                setPickerOpen(false)
                            }
                        }}
                        className="ip:text-2xs ip:p-0.5"
                        disabled={disabled}
                    />
                    <button
                        type="button"
                        onClick={() => !disabled && setPickerOpen((open: boolean) => !open)}
                        disabled={disabled}
                        className={`ip:p-0.5 ip:rounded ip:border ip:border-gray-300 ip:dark:border-white/30 ip:hover:bg-primary/10 ${disabled ? 'ip:opacity-50 ip:cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: colorPreview }}
                        aria-label={`Toggle custom ${label.toLowerCase()} picker`}
                        title={`Toggle custom ${label.toLowerCase()} picker`}
                    >
                        <IpEyeDropperIcon className="ip:h-4 ip:w-4 ip:text-stone-500 ip:shadow-sm" />
                    </button>
                </div>
                {pickerOpen && !disabled && (
                    <div className="ip:absolute ip:left-0 ip:top-full ip:mt-1 ip:z-50 ip:bg-white ip:dark:bg-dark ip:border ip:border-gray-200 ip:dark:border-white/20 ip:rounded ip:p-2 ip:shadow-lg">
                        <RgbaColorPicker color={color} onChange={onChange} />
                        <button
                            type="button"
                            onClick={() => setPickerOpen(false)}
                            className="ip:mt-2 ip:w-full ip:text-xs ip:py-1 ip:rounded ip:bg-primary/20 ip:hover:bg-primary/30"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
