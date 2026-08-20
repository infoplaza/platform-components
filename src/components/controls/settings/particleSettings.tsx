import React, { useState } from 'react'
import { useDisplaySettings } from '@/src/providers/settings/display-settings'
import { useLayerSettings } from '@/src/providers/settings/layer-settings'
import SliderField from '@/src/components/forms/slider-field'
import ColorField from '@/src/components/forms/color-field'
import FormControlRadio from '@/src/components/forms/radio'

export default function ParticleSettings() {
    const { state, actions } = useLayerSettings()
    const { advanceLayerSettings } = useDisplaySettings()
    const [colorPickerOpen, setColorPickerOpen] = useState(false)

    return (
        <div className="ip:flex ip:flex-col ip:gap-1 ip:sm:gap-2 ip:mt-4">
            <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                    Enabled
                </div>
                <div>
                    <FormControlRadio
                        options={[
                            { text: 'On', value: 'true' },
                            { text: 'Off', value: 'false' }
                        ]}
                        value={state.particleEnabled ? 'true' : 'false'}
                        onChange={(value) => actions.setParticleEnabled(value === 'true')}
                        className="ip:text-2xs ip:p-0.5"
                    />
                </div>
            </div>

            {advanceLayerSettings && (
                <>
                    <SliderField
                        label="Particles"
                        min={500}
                        max={50000}
                        step={1000}
                        value={state.particleNumParticles}
                        onChange={(value) => actions.setParticleNumParticles(value)}
                    />

                    <SliderField
                        label="Max age"
                        min={2}
                        max={50}
                        step={1}
                        value={state.particleMaxAge}
                        onChange={(value) => actions.setParticleMaxAge(value)}
                    />

                    <SliderField
                        label="Speed"
                        min={2}
                        max={50}
                        step={0.1}
                        value={state.particleSpeedFactor}
                        onChange={(value) => actions.setParticleSpeedFactor(value)}
                    />

                    <ColorField
                        label="Color"
                        color={state.particleColor}
                        onChange={actions.setParticleColor}
                        pickerOpen={colorPickerOpen}
                        setPickerOpen={setColorPickerOpen}
                    />

                    <SliderField
                        label="Width"
                        min={0.1}
                        max={20}
                        step={0.1}
                        value={state.particleWidth}
                        onChange={(value) => actions.setParticleWidth(value)}
                    />

                    <SliderField
                        label="Opacity"
                        min={0}
                        max={1}
                        step={0.01}
                        value={state.particleOpacity}
                        onChange={(value) => actions.setParticleOpacity(value)}
                    />
                </>
            )}

            <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                    Animate
                </div>
                <div>
                    <FormControlRadio
                        options={[
                            { text: 'On', value: 'true' },
                            { text: 'Off', value: 'false' }
                        ]}
                        value={state.particleAnimate ? 'true' : 'false'}
                        onChange={(value) => actions.setParticleAnimate(value === 'true')}
                        className="ip:text-2xs ip:p-0.5"
                    />
                </div>
            </div>
        </div>
    )
}
