import React, { useState } from 'react'
import { useDisplaySettings } from '@/src/providers/settings/display-settings'
import { useGradeSettingsFor } from '@/src/providers/settings/layer-settings'
import ColorField from '@/src/components/forms/color-field'
import FormControlRadio from '@/src/components/forms/radio'
import type { MapLayer } from '@/@types/weather.types'

const enabledOptions = [
    { text: 'On', value: 'true' },
    { text: 'Off', value: 'false' },
]

const textSizeOptions = [
    { text: 'Small', value: '8' },
    { text: 'Medium', value: '10' },
    { text: 'Large', value: '14' },
    { text: 'XL', value: '20' },
]

const radiusOptions = [
    { text: 'Small', value: '20' },
    { text: 'Medium', value: '28' },
    { text: 'Large', value: '36' },
    { text: 'XL', value: '48' },
]

function nearestOption(value: number, options: string[]): string {
    return options.reduce((prev, curr) =>
        Math.abs(Number(curr) - value) < Math.abs(Number(prev) - value) ? curr : prev
    )
}

export default function GradeSettings({ layer }: { layer: MapLayer }) {
    const { state, actions } = useGradeSettingsFor(layer)
    const { advanceLayerSettings } = useDisplaySettings()
    const [textColorPickerOpen, setTextColorPickerOpen] = useState(false)
    const textSizeValue = nearestOption(state.gradeTextSize, textSizeOptions.map((option) => option.value))
    const radiusValue = nearestOption(state.gradeRadius, radiusOptions.map((option) => option.value))

    return (
        <div className="ip:flex ip:flex-col ip:gap-1 ip:sm:gap-2 ip:mt-4">
            <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                    Grades
                </div>
                <div>
                    <FormControlRadio
                        options={enabledOptions}
                        value={state.gradeEnabled ? 'true' : 'false'}
                        onChange={(value) => actions.setGradeEnabled(value === 'true')}
                        className="ip:text-2xs ip:p-0.5"
                    />
                </div>
            </div>

            {advanceLayerSettings && (
                <>
                    <ColorField
                        label="Text Color"
                        color={state.gradeTextColor}
                        onChange={actions.setGradeTextColor}
                        pickerOpen={textColorPickerOpen}
                        setPickerOpen={setTextColorPickerOpen}
                    />

                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                            Text Size
                        </div>
                        <div>
                            <FormControlRadio
                                options={textSizeOptions}
                                value={textSizeValue}
                                onChange={(value) => {
                                    const nextValue = String(value)
                                    if (textSizeOptions.some((option) => option.value === nextValue)) {
                                        actions.setGradeTextSize(parseInt(nextValue, 10))
                                    }
                                }}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>

                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                            Radius
                        </div>
                        <div>
                            <FormControlRadio
                                options={radiusOptions}
                                value={radiusValue}
                                onChange={(value) => {
                                    const nextValue = String(value)
                                    if (radiusOptions.some((option) => option.value === nextValue)) {
                                        actions.setGradeRadius(parseInt(nextValue, 10))
                                    }
                                }}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
