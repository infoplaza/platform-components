import React, { useState, useMemo, useEffect } from 'react'
import SimpleDrawer from '@/src/components/modals/drawer'
import AccordionSection from './accordionSection'
import LayerPickerTabs from './layerPickerTabs'
import FormControlRadio from '@/src/components/forms/radio'
import { useWeatherMap } from '@/src/providers/weather/weather'
import { useDisplaySettings } from '@/src/providers/settings/display-settings'
import { getLayerSettingsKey, type ScopedRendering } from '@/src/providers/settings/layer-key'
import type { MapLayer } from '@/@types/weather.types'
import ImageSettings from '@/src/components/controls/settings/imageSettings'
import GridValuesSettings from '@/src/components/controls/settings/gridValuesSettings'
import ContourSettings from '@/src/components/controls/settings/contourSettings'
import DirectionSettings from '@/src/components/controls/settings/directionSettings'
import BarbSettings from '@/src/components/controls/settings/barbSettings'
import ParticleSettings from '@/src/components/controls/settings/particleSettings'
import ContourGeoJsonSettings from '@/src/components/controls/settings/contourGeoJsonSettings'
import GradeSettings from '@/src/components/controls/settings/gradeSettings'

const sectionIds = ['map', 'images', 'grid-values', 'directions', 'barbs', 'grades', 'particle-layer', 'contour-lines', 'contour-geojson-lines']

const hasRendering = (rendering: MapLayer['rendering'], type: string): boolean => {
    const matches = (r: string) => r === type || r.startsWith(type)
    if (Array.isArray(rendering)) {
        return rendering.some((r) => typeof r === 'string' && matches(r))
    }
    return typeof rendering === 'string' && matches(rendering)
}

const useSelectedLayer = (layers: MapLayer[], rendering: ScopedRendering) => {
    const keys = useMemo(() => layers.map((layer) => getLayerSettingsKey(layer, rendering)), [layers, rendering])
    const [selectedKey, setSelectedKey] = useState<string | null>(null)

    useEffect(() => {
        if (keys.length === 0) {
            if (selectedKey !== null) setSelectedKey(null)
            return
        }
        if (!selectedKey || !keys.includes(selectedKey)) {
            setSelectedKey(keys[0])
        }
    }, [keys, selectedKey])

    const selected = useMemo(() => {
        if (!selectedKey) return layers[0] ?? null
        const idx = keys.indexOf(selectedKey)
        return idx >= 0 ? layers[idx] : (layers[0] ?? null)
    }, [keys, layers, selectedKey])

    return { selected, selectedKey: selectedKey ?? keys[0] ?? '', setSelectedKey }
}

const LayerModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { mapState } = useWeatherMap()
    const { advanceLayerSettings, setAdvanceLayerSettings } = useDisplaySettings()
    const [openSections, setOpenSections] = useState(sectionIds)

    const toggleSection = (section: string) => {
        setOpenSections((currentSections) =>
            currentSections.includes(section)
                ? currentSections.filter((currentSection) => currentSection !== section)
                : [...currentSections, section]
        )
    }

    const layers = mapState?.layers ?? []
    const imageLayers = useMemo(() => layers.filter((layer) => hasRendering(layer.rendering, 'IMAGE_V2')), [layers])
    const valuesLayers = useMemo(() => layers.filter((layer) => hasRendering(layer.rendering, 'VALUES')), [layers])
    const contourLayers = useMemo(() => layers.filter((layer) => hasRendering(layer.rendering, 'CONTOURS')), [layers])
    const contourGeoJsonLayers = useMemo(() => layers.filter((layer) => hasRendering(layer.rendering, 'CONTOURGEOJSON')), [layers])
    const directionLayers = useMemo(() => layers.filter((layer) => hasRendering(layer.rendering, 'DIRECTIONS')), [layers])
    const barbLayers = useMemo(() => layers.filter((layer) => hasRendering(layer.rendering, 'BARBS')), [layers])
    const gradeLayers = useMemo(() => layers.filter((layer) => hasRendering(layer.rendering, 'GRADES')), [layers])
    const hasParticles = useMemo(() => layers.some((layer) => hasRendering(layer.rendering, 'PARTICLES')), [layers])

    const image = useSelectedLayer(imageLayers, 'IMAGE_V2')
    const values = useSelectedLayer(valuesLayers, 'VALUES')
    const contour = useSelectedLayer(contourLayers, 'CONTOURS')
    const contourGeoJson = useSelectedLayer(contourGeoJsonLayers, 'CONTOURGEOJSON')
    const direction = useSelectedLayer(directionLayers, 'DIRECTIONS')
    const barb = useSelectedLayer(barbLayers, 'BARBS')
    const grade = useSelectedLayer(gradeLayers, 'GRADES')

    return (
        <SimpleDrawer open={open} title="Settings" onClose={onClose} className="ip:max-w-3xl ip:w-full ip:bg-cloud/90 ip:dark:bg-dark ip:pb-25 ip:pt-24">
            <div className="ip:flex ip:flex-col ip:gap-2 ip:sm:gap-4 ip:dark:text-white">
                <div className="ip:flex ip:sm:flex-row ip:flex-col ip:gap-2">
                    <div className="ip:shrink-0 ip:w-auto ip:sm:w-28 ip:text-xs ip:font-normal ip:flex ip:flex-col ip:sm:self-center ip:self-start">
                        Layer settings
                    </div>
                    <div>
                        <FormControlRadio
                            options={[
                                { text: 'Simple', value: 'simple' },
                                { text: 'Advanced', value: 'advanced' },
                            ]}
                            value={advanceLayerSettings ? 'advanced' : 'simple'}
                            onChange={(value) => setAdvanceLayerSettings(value === 'advanced')}
                            className="ip:text-2xs ip:p-0.5"
                        />
                    </div>
                </div>
                {imageLayers.length > 0 && image.selected && (
                    <AccordionSection
                        id="image-settings"
                        title="Images"
                        isOpen={openSections.includes('images')}
                        onToggle={() => toggleSection('images')}
                        className="ip:bg-cloud/5 ip:dark:bg-dark ip:text-xs"
                    >
                        <div className="ip:flex">
                            <LayerPickerTabs
                                layers={imageLayers}
                                selectedKey={image.selectedKey}
                                onChange={image.setSelectedKey}
                                keyOf={(layer) => getLayerSettingsKey(layer, 'IMAGE_V2')}
                            />
                        </div>
                        <ImageSettings imageLayer={image.selected} />
                    </AccordionSection>
                )}
                {valuesLayers.length > 0 && values.selected && (
                    <AccordionSection
                        id="grid-values-settings"
                        title="Grid values"
                        isOpen={openSections.includes('grid-values')}
                        onToggle={() => toggleSection('grid-values')}
                    >
                        <div className="ip:flex">
                            <LayerPickerTabs
                                layers={valuesLayers}
                                selectedKey={values.selectedKey}
                                onChange={values.setSelectedKey}
                                keyOf={(layer) => getLayerSettingsKey(layer, 'VALUES')}
                            />
                        </div>
                        <GridValuesSettings layer={values.selected} />
                    </AccordionSection>
                )}
                {directionLayers.length > 0 && direction.selected && (
                    <AccordionSection
                        id="direction-settings"
                        title="Directions"
                        isOpen={openSections.includes('directions')}
                        onToggle={() => toggleSection('directions')}
                    >
                        <div className="ip:flex">
                            <LayerPickerTabs
                                layers={directionLayers}
                                selectedKey={direction.selectedKey}
                                onChange={direction.setSelectedKey}
                                keyOf={(layer) => getLayerSettingsKey(layer, 'DIRECTIONS')}
                            />
                        </div>
                        <DirectionSettings layer={direction.selected} />
                    </AccordionSection>
                )}
                {barbLayers.length > 0 && barb.selected && (
                    <AccordionSection
                        id="barb-settings"
                        title="Barbs"
                        isOpen={openSections.includes('barbs')}
                        onToggle={() => toggleSection('barbs')}
                    >
                        <div className="ip:flex">
                            <LayerPickerTabs
                                layers={barbLayers}
                                selectedKey={barb.selectedKey}
                                onChange={barb.setSelectedKey}
                                keyOf={(layer) => getLayerSettingsKey(layer, 'BARBS')}
                            />
                        </div>
                        <BarbSettings layer={barb.selected} />
                    </AccordionSection>
                )}
                {gradeLayers.length > 0 && grade.selected && (
                    <AccordionSection
                        id="grade-settings"
                        title="Weather grades"
                        isOpen={openSections.includes('grades')}
                        onToggle={() => toggleSection('grades')}
                    >
                        <div className="ip:flex">
                            <LayerPickerTabs
                                layers={gradeLayers}
                                selectedKey={grade.selectedKey}
                                onChange={grade.setSelectedKey}
                                keyOf={(layer) => getLayerSettingsKey(layer, 'GRADES')}
                            />
                        </div>
                        <GradeSettings layer={grade.selected} />
                    </AccordionSection>
                )}
                {hasParticles && (
                    <AccordionSection
                        id="particle-settings"
                        title="Particles"
                        isOpen={openSections.includes('particle-layer')}
                        onToggle={() => toggleSection('particle-layer')}
                        className="ip:bg-cloud/5 ip:dark:bg-dark ip:text-xs"
                    >
                        <ParticleSettings />
                    </AccordionSection>
                )}
                {contourLayers.length > 0 && contour.selected && (
                    <AccordionSection
                        id="contour-settings"
                        title="Contour lines"
                        isOpen={openSections.includes('contour-lines')}
                        onToggle={() => toggleSection('contour-lines')}
                        className="ip:bg-cloud/5 ip:dark:bg-dark ip:text-xs ip:w-max "
                    >
                        <div className="ip:flex">
                            <LayerPickerTabs
                                layers={contourLayers}
                                selectedKey={contour.selectedKey}
                                onChange={contour.setSelectedKey}
                                keyOf={(layer) => getLayerSettingsKey(layer, 'CONTOURS')}
                            />
                        </div>
                        <ContourSettings layer={contour.selected} />
                    </AccordionSection>
                )}
                {contourGeoJsonLayers.length > 0 && contourGeoJson.selected && (
                    <AccordionSection
                        id="contour-geojson-settings"
                        title="Contour lines"
                        isOpen={openSections.includes('contour-geojson-lines')}
                        onToggle={() => toggleSection('contour-geojson-lines')}
                        className="ip:bg-cloud/5 ip:dark:bg-dark ip:text-xs ip:w-max "
                    >
                        <div className="ip:flex">
                            <LayerPickerTabs
                                layers={contourGeoJsonLayers}
                                selectedKey={contourGeoJson.selectedKey}
                                onChange={contourGeoJson.setSelectedKey}
                                keyOf={(layer) => getLayerSettingsKey(layer, 'CONTOURGEOJSON')}
                            />
                        </div>
                        <ContourGeoJsonSettings layer={contourGeoJson.selected} />
                    </AccordionSection>
                )}
            </div>
        </SimpleDrawer>
    )
}

export default LayerModal
