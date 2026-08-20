import React from 'react'
import { twMerge } from '@/src/utilities/external/twMerge'
import type { MapLayer } from '@/@types/weather.types'

export interface LayerPickerTabsProps {
    layers: MapLayer[]
    selectedKey: string
    onChange: (key: string) => void
    keyOf: (layer: MapLayer) => string
    className?: string
}

const labelOf = (layer: MapLayer): string => {
    if (layer?.i18n) {
        return layer.i18n
    }
    const parts = [layer?.element, layer?.unit].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : 'Layer'
}

const LayerPickerTabs: React.FC<LayerPickerTabsProps> = ({ layers, selectedKey, onChange, keyOf, className }) => {
    if (!layers || layers.length <= 1) {
        return null
    }

    return (
        <div className={twMerge('ip:bg-white ip:dark:bg-white/10 ip:rounded-md ip:p-1 ip:mb-2', className)}>
            <div className="ip:flex ip:gap-1 ip:flex-wrap">
                {layers.map((layer) => {
                    const key = keyOf(layer)
                    const isActive = key === selectedKey
                    return (
                        <button
                            type="button"
                            key={key}
                            onClick={() => onChange(key)}
                            className={twMerge(
                                'ip:px-2 ip:py-1 ip:rounded ip:text-2xs ip:font-light ip:sm:font-normal ip:whitespace-nowrap ip:cursor-pointer',
                                isActive ? 'ip:bg-primary ip:text-white' : 'ip:hover:bg-primary/10'
                            )}
                        >
                            {labelOf(layer)}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default LayerPickerTabs
