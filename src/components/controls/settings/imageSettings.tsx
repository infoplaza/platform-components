import React, { useMemo } from 'react'
import { useDisplaySettings } from '@/src/providers/settings/display-settings'
import { useImageSettingsFor } from '@/src/providers/settings/layer-settings'
import { ImageInterpolation } from '@/src/_utils/image-interpolation'
import SliderField from '@/src/components/forms/slider-field'
import RangeSliderField from '@/src/components/forms/range-slider-field'
import FormControlRadio from '@/src/components/forms/radio'
import type { MapLayer } from '@/@types/weather.types'

const enabledOptions = [
    { text: 'On', value: 'true' },
    { text: 'Off', value: 'false' }
]

const interpolationOptions = [
    { text: 'Nearest', value: ImageInterpolation.NEAREST },
    { text: 'Linear', value: ImageInterpolation.LINEAR },
    { text: 'Cubic', value: ImageInterpolation.CUBIC }
]

export default function ImageSettings({ imageLayer }: { imageLayer: MapLayer }) {
    const { state: layerState, actions: layerActions } = useImageSettingsFor(imageLayer)
    const { advanceLayerSettings } = useDisplaySettings()

    const dataBounds = useMemo(() => {
        const bounds = imageLayer?.data?.element?.databounds
        if (!bounds?.length) {
            return null
        }
        const lo = Math.floor(Math.min(...bounds))
        const hi = Math.ceil(Math.max(...bounds))
        if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
            return null
        }
        return { lo, hi }
    }, [imageLayer])

    const sliderExtent = useMemo(() => {
        if (!dataBounds) {
            return { min: -255, max: 255, step: 1 }
        }
        const { lo, hi } = dataBounds
        if (lo === hi) {
            const pad = Math.max(1e-6, Math.abs(lo) * 1e-9 + 1e-6)
            return { min: lo - pad, max: hi + pad, step: pad / 100 }
        }
        const span = hi - lo
        return {
            min: lo,
            max: hi,
            step: Math.max(span / 500, 1e-6),
        }
    }, [dataBounds])

    return (
        <div className="ip:flex ip:flex-col ip:gap-1 ip:sm:gap-2 ip:mt-4">
            <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                    Image
                </div>
                <div>
                    <FormControlRadio
                        options={enabledOptions}
                        value={layerState.imageEnabled ? 'true' : 'false'}
                        onChange={(value) => layerActions.setImageEnabled(value === 'true')}
                        className="ip:text-2xs ip:p-0.5"
                    />
                </div>
            </div>
            {advanceLayerSettings && (
                <>
                    <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                        <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start ip:text-yellow-500">
                            Interpolation
                        </div>
                        <div>
                            <FormControlRadio
                                options={interpolationOptions}
                                value={layerState.imageInterpolation}
                                onChange={(value) => layerActions.setImageInterpolation(value as ImageInterpolation)}
                                className="ip:text-2xs ip:p-0.5"
                            />
                        </div>
                    </div>

                    <SliderField
                        label="Smoothing"
                        labelClassName="ip:text-yellow-500"
                        min={0}
                        max={10}
                        step={0.1}
                        value={layerState.imageSmoothing}
                        onChange={(value) => layerActions.setImageSmoothing(value)}
                    />

                    {imageLayer.grayscale !== false && (
                        <RangeSliderField
                            label="Range"
                            min={sliderExtent.min}
                            max={sliderExtent.max}
                            step={sliderExtent.step}
                            valueMin={layerState.imageMinValue}
                            valueMax={layerState.imageMaxValue}
                            palette={layerState.imagePalette}
                            onMinChange={(value) =>
                                layerActions.setImageMinValue(Math.min(value, layerState.imageMaxValue))
                            }
                            onMaxChange={(value) =>
                                layerActions.setImageMaxValue(Math.max(value, layerState.imageMinValue))
                            }
                        />
                    )}

                    <SliderField
                        label="Opacity"
                        min={0}
                        max={1}
                        step={0.01}
                        value={layerState.imageOpacity}
                        onChange={(value) => layerActions.setImageOpacity(value)}
                    />
                </>
            )}
        </div>
    )
}
