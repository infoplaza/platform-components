import React, { useState } from 'react'
import { useDisplaySettings } from '@/src/providers/settings/display-settings'
import { useContourGeoJsonSettingsFor } from '@/src/providers/settings/layer-settings'
import SliderField from '@/src/components/forms/slider-field'
import ColorField from '@/src/components/forms/color-field'
import FormControlRadio from '@/src/components/forms/radio'
import type { LayerContourGeoJsonColorMode, LayerContourGeoJsonLabelColorMode } from '@/@types/layer.types'
import type { MapLayer } from '@/@types/weather.types'

const colorModeOptions: { text: string; value: LayerContourGeoJsonColorMode }[] = [
    { text: 'Palette', value: 'palette' },
    { text: 'Custom', value: 'custom' },
]

const labelColorModeOptions: { text: string; value: LayerContourGeoJsonLabelColorMode }[] = [
    { text: 'Palette', value: 'palette' },
    { text: 'Custom', value: 'custom' },
]

const enabledOptions = [
    { text: 'On', value: 'true' },
    { text: 'Off', value: 'false' },
]

const smoothingOptions = [
    { text: 'None', value: '0' },
    { text: 'Low', value: '1' },
    { text: 'Medium', value: '2' },
    { text: 'High', value: '3' },
]

export default function ContourGeoJsonSettings({ layer }: { layer: MapLayer }) {
    const { state, actions } = useContourGeoJsonSettingsFor(layer)
    const { advanceLayerSettings } = useDisplaySettings()
    const [lineColorPickerOpen, setLineColorPickerOpen] = useState(false)
    const [labelColorPickerOpen, setLabelColorPickerOpen] = useState(false)

    return (
        <div className="ip:flex ip:flex-col ip:gap-1 ip:sm:gap-2 ip:mt-4">
            <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                    Enabled
                </div>
                <div>
                    <FormControlRadio
                        options={enabledOptions}
                        value={state.contourGeoJsonEnabled ? 'true' : 'false'}
                        onChange={(value) => actions.setContourGeoJsonEnabled(value === 'true')}
                        className="ip:text-2xs ip:p-0.5"
                    />
                </div>
            </div>

            {advanceLayerSettings && (
                <>
                    <SliderField
                        label="Interval"
                        min={1}
                        max={10}
                        step={1}
                        value={state.contourGeoJsonInterval}
                        onChange={(value) => actions.setContourGeoJsonInterval(value)}
                    />

                    <SliderField
                        label="Line width"
                        min={0.1}
                        max={20}
                        step={0.1}
                        value={state.contourGeoJsonLineWidth}
                        onChange={(value) => actions.setContourGeoJsonLineWidth(value)}
                    />

                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                            Smoothing
                        </div>
                        <div>
                            <FormControlRadio
                                options={smoothingOptions}
                                value={String(state.contourGeoJsonSmoothing)}
                                onChange={(value) => actions.setContourGeoJsonSmoothing(Number(value))}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>

                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                            Label rotation
                        </div>
                        <div>
                            <FormControlRadio
                                options={enabledOptions}
                                value={state.contourGeoJsonLabelRotation ? 'true' : 'false'}
                                onChange={(value) => actions.setContourGeoJsonLabelRotation(value === 'true')}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>

                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                            Color
                        </div>
                        <div>
                            <FormControlRadio
                                options={colorModeOptions}
                                value={state.contourGeoJsonColorMode}
                                onChange={(value) => actions.setContourGeoJsonColorMode(value as LayerContourGeoJsonColorMode)}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>

                    {state.contourGeoJsonColorMode === 'custom' && (
                        <ColorField
                            label="Custom color"
                            color={state.contourGeoJsonColor}
                            onChange={actions.setContourGeoJsonColor}
                            pickerOpen={lineColorPickerOpen}
                            setPickerOpen={setLineColorPickerOpen}
                            presets={[
                                { label: 'White', color: { r: 255, g: 255, b: 255, a: 1 }, value: 'white' },
                                { label: 'Black', color: { r: 0, g: 0, b: 0, a: 1 }, value: 'black' },
                            ]}
                        />
                    )}

                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                            Label color
                        </div>
                        <div>
                            <FormControlRadio
                                options={labelColorModeOptions}
                                value={state.contourGeoJsonLabelColorMode}
                                onChange={(value) => actions.setContourGeoJsonLabelColorMode(value as LayerContourGeoJsonLabelColorMode)}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>

                    {state.contourGeoJsonLabelColorMode === 'custom' && (
                        <ColorField
                            label="Custom label color"
                            color={state.contourGeoJsonLabelColor}
                            onChange={actions.setContourGeoJsonLabelColor}
                            pickerOpen={labelColorPickerOpen}
                            setPickerOpen={setLabelColorPickerOpen}
                            presets={[
                                { label: 'White', color: { r: 255, g: 255, b: 255, a: 1 }, value: 'white' },
                                { label: 'Black', color: { r: 0, g: 0, b: 0, a: 1 }, value: 'black' },
                            ]}
                        />
                    )}
                </>
            )}
        </div>
    )
}
