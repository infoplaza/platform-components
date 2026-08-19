import React, { useState } from 'react'
import { useDisplaySettings } from '@/src/providers/settings/display-settings'
import { useContourSettingsFor } from '@/src/providers/settings/layer-settings'
import SliderField from '@/src/components/forms/slider-field'
import ColorField from '@/src/components/forms/color-field'
import FormControlRadio from '@/src/components/forms/radio'
import type { MapLayer } from '@/@types/weather.types'

export default function ContourSettings({ layer }: { layer: MapLayer }) {
    const { state, actions } = useContourSettingsFor(layer)
    const { advanceLayerSettings } = useDisplaySettings()
    const [colorPickerOpen, setColorPickerOpen] = useState(false)

    const enabledOptions = [
        { text: 'On', value: 'true' },
        { text: 'Off', value: 'false' }
    ]

    const paletteOptions = [
        { text: 'Palette', value: 'true' },
        { text: 'Solid', value: 'false' }
    ]

    return (
        <div className="ip:flex ip:flex-col ip:gap-1 ip:sm:gap-2 ip:mt-4">
            <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                    Enabled
                </div>
                <div>
                    <FormControlRadio
                        options={enabledOptions}
                        value={state.contourEnabled ? 'true' : 'false'}
                        onChange={(value) => actions.setContourEnabled(value === 'true')}
                        className="ip:text-2xs ip:p-0.5"
                    />
                </div>
            </div>

            {advanceLayerSettings && (
                <>
                    <SliderField
                        label="Interval"
                        min={1}
                        max={500}
                        step={1}
                        value={state.contourInterval}
                        onChange={(value) => actions.setContourInterval(value)}
                    />

                    <SliderField
                        label="Major interval"
                        min={0}
                        max={1000}
                        step={1}
                        value={state.contourMajorInterval}
                        onChange={(value) => actions.setContourMajorInterval(value)}
                    />

                    <SliderField
                        label="Width"
                        min={0.1}
                        max={10}
                        step={0.1}
                        value={state.contourWidth}
                        onChange={(value) => actions.setContourWidth(value)}
                    />
                </>
            )}

            <ColorField
                label="Color"
                color={state.contourColor}
                onChange={actions.setContourColor}
                pickerOpen={colorPickerOpen}
                setPickerOpen={setColorPickerOpen}
            />

            {advanceLayerSettings && (
                <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                    <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                        Palette
                    </div>
                    <div>
                        <FormControlRadio
                            options={paletteOptions}
                            value={state.contourUsePalette ? 'true' : 'false'}
                            onChange={(value) => actions.setContourUsePalette(value === 'true')}
                            className="ip:text-2xs ip:p-0.5"
                        />
                    </div>
                </div>
            )}

            <SliderField
                label="Opacity"
                min={0}
                max={1}
                step={0.01}
                value={state.contourOpacity}
                onChange={(value) => actions.setContourOpacity(value)}
            />
        </div>
    )
}
