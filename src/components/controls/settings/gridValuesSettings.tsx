import React, { useState } from 'react'
import { useDisplaySettings } from '@/src/providers/settings/display-settings'
import { useValuesSettingsFor } from '@/src/providers/settings/layer-settings'
import ColorField from '@/src/components/forms/color-field'
import FormControlRadio from '@/src/components/forms/radio'
import type { MapLayer } from '@/@types/weather.types'

export default function GridValuesSettings({ layer }: { layer: MapLayer }) {
    const { advanceLayerSettings } = useDisplaySettings()
    const { state, actions } = useValuesSettingsFor(layer)
    const [textColorPickerOpen, setTextColorPickerOpen] = useState(false)

    const layoutOptions = [
        { text: 'Squared', value: 'squared' },
        { text: 'Staggered', value: 'staggered' }
    ]

    const densityOptions = [
        { text: 'Low', value: '-1' },
        { text: 'Medium', value: '0' },
        { text: 'High', value: '1' }
    ]

    const densityDisplayValue =
        state.density <= -0.34 ? '-1' : state.density < 0.34 ? '0' : '1'

    const textSizeOptions = [
        { text: 'Small', value: '8' },
        { text: 'Medium', value: '12' },
        { text: 'Large', value: '20' },
        { text: 'XL', value: '32' }
    ]

    const fontOptions = [
        { text: 'Arial', value: 'Arial' },
        { text: 'Helvetica', value: 'Helvetica' },
        { text: 'Courier New', value: 'Courier New' },
        { text: 'Verdana', value: 'Verdana' },
        { text: 'Georgia', value: 'Georgia' }
    ]

    const decimalsOptions = [
        { text: '0', value: '0' },
        { text: '1', value: '1' },
        { text: '2', value: '2' },
        { text: '3', value: '3' }
    ]

    const decimalsDisplayValue = String(
        Math.max(0, Math.min(3, Math.round(state.textDecimals ?? 0)))
    )

    const textSizeDisplayValue = [8, 12, 20, 32].reduce((prev, curr) =>
        Math.abs(curr - state.textSize) < Math.abs(prev - state.textSize) ? curr : prev
    )

    const gridValuesOnOffOptions = [
        { text: 'On', value: 'true' },
        { text: 'Off', value: 'false' }
    ]

    return (
        <div className="ip:flex ip:flex-col ip:gap-1 ip:sm:gap-2 ip:mt-4">
            <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                    Grid values
                </div>
                <div>
                    <FormControlRadio
                        options={gridValuesOnOffOptions}
                        value={state.gridValuesEnabled ? 'true' : 'false'}
                        onChange={(value) => actions.setGridValuesEnabled(value === 'true')}
                        className="ip:text-2xs ip:p-0.5"
                    />
                </div>
            </div>

            <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                    Layout
                </div>
                <div>
                    <FormControlRadio
                        options={layoutOptions}
                        value={state.layout}
                        onChange={(value) => {
                            if (value === 'squared' || value === 'staggered') {
                                actions.setLayout(value)
                            }
                        }}
                        className="ip:text-2xs ip:p-0.5"
                    />
                </div>
            </div>

            {advanceLayerSettings && (
                <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                    <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                        Density
                    </div>
                    <div>
                        <FormControlRadio
                            options={densityOptions}
                            value={densityDisplayValue}
                            onChange={(value) => {
                                if (value === '-1' || value === '0' || value === '1') {
                                    actions.setDensity(parseFloat(value))
                                }
                            }}
                            className="ip:text-2xs ip:p-0.5"
                        />
                    </div>
                </div>
            )}

            {advanceLayerSettings && (
                <>
                    <ColorField
                        label="Text Color"
                        color={state.textColor}
                        onChange={actions.setTextColor}
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
                                value={String(textSizeDisplayValue)}
                                onChange={(value) => {
                                    if (value === '8' || value === '12' || value === '20' || value === '32') {
                                        actions.setTextSize(parseInt(value, 10))
                                    }
                                }}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>
                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                            Decimals
                        </div>
                        <div>
                            <FormControlRadio
                                options={decimalsOptions}
                                value={decimalsDisplayValue}
                                onChange={(value) => {
                                    if (value === '0' || value === '1' || value === '2' || value === '3') {
                                        actions.setTextDecimals(parseInt(value, 10))
                                    }
                                }}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>

                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                            Font
                        </div>
                        <div>
                            <FormControlRadio
                                options={fontOptions}
                                value={state.textFontFamily}
                                onChange={(value) => {
                                    if (value === 'Arial' || value === 'Helvetica' || value === 'Courier New' || value === 'Verdana' || value === 'Georgia') {
                                        actions.setTextFontFamily(value)
                                    }
                                }}
                                className="ip:text-2xs ip:p-0.5 ip:flex-wrap"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
