import React, { useState } from 'react'
import { useDisplaySettings } from '@/src/providers/settings/display-settings'
import { useBarbSettingsFor } from '@/src/providers/settings/layer-settings'
import SliderField from '@/src/components/forms/slider-field'
import ColorField from '@/src/components/forms/color-field'
import FormControlRadio from '@/src/components/forms/radio'
import type { MapLayer } from '@/@types/weather.types'

export default function BarbSettings({ layer }: { layer: MapLayer }) {
    const { state, actions } = useBarbSettingsFor(layer)
    const { advanceLayerSettings } = useDisplaySettings()
    const [colorPickerOpen, setColorPickerOpen] = useState(false)

    const enabledOptions = [
        { text: 'On', value: 'true' },
        { text: 'Off', value: 'false' }
    ]

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
        state.barbDensity <= -0.34 ? '-1' : state.barbDensity < 0.34 ? '0' : '1'

    const iconSizeOptions = [
        { text: 'Small', value: '14' },
        { text: 'Medium', value: '28' },
        { text: 'Large', value: '44' },
        { text: 'XL', value: '64' }
    ]

    const iconSizeDisplayValue = [14, 28, 44, 64].reduce((prev, curr) =>
        Math.abs(curr - state.barbIconSize) < Math.abs(prev - state.barbIconSize) ? curr : prev
    )

    const paletteOptions = [
        { text: 'Palette', value: 'true' },
        { text: 'Solid', value: 'false' }
    ]

    return (
        <div className="ip:flex ip:flex-col ip:gap-1 ip:sm:gap-2 ip:mt-4">
            <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                    Barbs
                </div>
                <div>
                    <FormControlRadio
                        options={enabledOptions}
                        value={state.barbEnabled ? 'true' : 'false'}
                        onChange={(value) => actions.setBarbEnabled(value === 'true')}
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
                        value={state.barbLayout}
                        onChange={(value) => {
                            if (value === 'squared' || value === 'staggered') {
                                actions.setBarbLayout(value)
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
                                    actions.setBarbDensity(parseFloat(value))
                                }
                            }}
                            className="ip:text-2xs ip:p-0.5"
                        />
                    </div>
                </div>
            )}

            {advanceLayerSettings && (
                <>
                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                            Icon Size
                        </div>
                        <div>
                            <FormControlRadio
                                options={iconSizeOptions}
                                value={String(iconSizeDisplayValue)}
                                onChange={(value) => {
                                    if (value === '14' || value === '28' || value === '44' || value === '64') {
                                        actions.setBarbIconSize(parseInt(value, 10))
                                    }
                                }}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>

                    <ColorField
                        label="Icon Color"
                        color={state.barbIconColor}
                        onChange={actions.setBarbIconColor}
                        pickerOpen={colorPickerOpen}
                        setPickerOpen={setColorPickerOpen}
                    />

                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                            Palette
                        </div>
                        <div>
                            <FormControlRadio
                                options={paletteOptions}
                                value={state.barbIconUsePalette ? 'true' : 'false'}
                                onChange={(value) => actions.setBarbIconUsePalette(value === 'true')}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>

                    <SliderField
                        label="Opacity"
                        min={0}
                        max={1}
                        step={0.01}
                        value={state.barbIconOpacity}
                        onChange={(value) => actions.setBarbIconOpacity(value)}
                    />
                </>
            )}
        </div>
    )
}
