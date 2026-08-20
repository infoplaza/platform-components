import React, { useState } from 'react'

import ControlTimebar from '@/src/components/controls/timebars/timebar'
import MapControlMobileTimebar from '@/src/components/controls/timebars/mobileTimebar'
import MapControlElement from '@/src/components/controls/element'
import MapControlLegend, { LegendTrigger, MapControlLegendDetails } from '@/src/components/controls/legend'
import MapControlLegendList from '@/src/components/controls/legend/list'
import { isMultiRowLegend } from '@/src/components/controls/legend/utils'
import MapControlModel from '@/src/components/controls/model'
import MapControlRun from '@/src/components/controls/run'
import MapControlMember from '@/src/components/controls/member'

import { useWeatherMap } from '@/src/providers/weather/weather'
import { useLegendValues } from '@/src/providers/legend/legend'
import { useIsIosAndroidPhoneOrTablet } from '@/src/hooks/useIosAndroidDevice'

import MapControlZoom from '@/src/components/controls/zoom'
import { twMerge } from '@/src/utilities/external/twMerge'
import { isEmpty } from 'lodash'
import MapControlInfo from './info'
import MapControlLayer from '@/src/components/controls/layer'

export type MapControlHudProps = {
    mapIndex: number
    mapsLength: number
    isMultipleMapView: boolean
    onMapsCount: (count: number) => void
    onExportChange: (value: boolean) => void
    mapRef: any
    viewState: {
        latitude?: number
        longitude?: number
    }
}

export function MapControlHud({ mapIndex, mapsLength, isMultipleMapView, onMapsCount, onExportChange, mapRef, viewState }: MapControlHudProps) {
    const { models: contextModels, modelInfo, model, elementInfo, layersInfo, month } = useWeatherMap()
    const models = contextModels
    const { legends } = useLegendValues()
    const isMobileDevice = useIsIosAndroidPhoneOrTablet()
    const [legendDetailsOpen, setLegendDetailsOpen] = useState(false)
    const openLegendDetails = () => {
        if (!layersInfo?.layers.some(layer => layer.grayscale === true)) {
            return
        }

        return setLegendDetailsOpen(true)
    }
    const closeLegendDetails = () => setLegendDetailsOpen(false)
    const hasLegends = !isEmpty(legends)
    const legendListType = elementInfo?.options?.legend?.type === 'list'

    return (
        <>
            {/* CONTROLS: TOP LEFT */}
            <div className="ip:absolute ip:top-0 ip:left-0 ip:pointer-events-none ip:sm:w-auto ip:w-full">
                <div className="ip:flex ip:flex-col ip:gap-1 ip:sm:gap-1 ip:p-3 ip:sm:p-1">
                    <div className="ip:flex ip:justify-between ip:gap-1 ip:items-start">
                        <MapControlInfo
                            small={isMultipleMapView}
                        />
                        {isMobileDevice && (
                            <MapControlLayer
                                vertical={false}
                            />
                        )}
                    </div>
                </div>
            </div>
            {/* CONTROLS: TOP RIGHT */}
            {!isMobileDevice && (
                <div className="ip:absolute ip:top-0 ip:right-0 ip:pointer-events-none">
                    <div className="ip:flex ip:flex-col ip:items-end">
                        <div className="ip:p-1 ip:flex ip:gap-1.5 ip:flex-col">
                            <MapControlLayer
                                vertical={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* CONTROLS: BOTTOM */}
            <div className="ip:absolute ip:bottom-0 ip:inset-x-0 ip:z-10 ip:pointer-events-none">
                <div className="ip:flex ip:flex-col ip:gap-1">
                    <div className="ip:relative ip:flex ip:items-end ip:justify-between ip:px-1">
                        <div className="ip:flex ip:gap-1 ip:md:gap-2.5 ip:items-end">
                            <div className="ip:flex ip:flex-col ip:gap-1">
                                <div className="ip:flex ip:flex-col ip:gap-2.5">
                                    <div className="ip:flex">
                                        <MapControlElement
                                            maxElements={isMultipleMapView ? 1 : 5}
                                            small={false}
                                            vertical={true}
                                        />
                                    </div>
                                </div>
                                <div className="ip:flex ip:relative ip:gap-1 ip:items-end">
                                    <MapControlModel
                                        models={models as any}
                                        maxItems={3}
                                        small={false}
                                    />
                                    <MapControlRun small={false} />
                                    <MapControlMember small={false} />
                                </div>
                            </div>
                        </div>

                        <div className={twMerge(
                            'ip:flex ip:flex-col ip:items-end ip:gap-0.5',
                            hasLegends ? 'ip:sm:gap-1' : 'ip:sm:gap-0.5'
                        )}>
                            <div className="ip:flex ip:gap-1 ip:items-end">
                                <MapControlZoom
                                    mapIndex={mapIndex}
                                    multiMapCount={mapsLength}
                                />
                            </div>
                            <div className="ip:flex ip:sm:flex-row ip:flex-col-reverse ip:gap-1 ip:items-end">
                                {hasLegends && legendListType && (
                                    <LegendTrigger
                                        onClick={openLegendDetails}
                                        expanded={legendDetailsOpen}
                                        aria-label="Show legend details"
                                        className="ip:sm:block ip:hidden"
                                    >
                                        <MapControlLegendList legends={legends} />
                                    </LegendTrigger>
                                )}
                            </div>
                            {hasLegends && !legendListType && (
                                <div
                                    className="ip:hidden ip:sm:block ip:w-full"
                                    style={{ height: `${legends.length * (isMultiRowLegend(legends[0]) ? 24 * 2 : 24)}px` }}
                                >
                                    <LegendTrigger
                                        onClick={openLegendDetails}
                                        expanded={legendDetailsOpen}
                                        aria-label="Show legend details"
                                        className="ip:absolute ip:bottom-0 ip:right-1 ip:block ip:w-full ip:sm:max-w-sm ip:lg:max-w-md ip:xl:max-w-lg"
                                    >
                                        <MapControlLegend
                                            height={isMultiRowLegend(legends[0]) ? 24 * 2 : 24}
                                            legends={legends}
                                        />
                                    </LegendTrigger>
                                </div>
                            )}
                        </div>
                    </div>

                    {Boolean(modelInfo?.format) && ['nowcast', 'forecast'].includes(modelInfo?.format ?? '') && (
                        <div className="ip:flex ip:flex-col">
                            {isMobileDevice ? (
                                <MapControlMobileTimebar
                                    options={elementInfo?.options?.timebar}
                                />
                            ) : (
                                <ControlTimebar
                                    small={isMultipleMapView}
                                    options={elementInfo?.options?.timebar}
                                />
                            )}
                        </div>
                    )}
                </div>
                {hasLegends && !legendListType && (
                    <div
                        className="ip:sm:hidden ip:block ip:bottom-0 ip:right-0 ip:w-full ip:sm:w-58 ip:md:w-72 ip:lg:w-96"
                        style={{ height: `${legends.length * 24}px` }}
                    >
                        <LegendTrigger
                            onClick={openLegendDetails}
                            expanded={legendDetailsOpen}
                            aria-label="Show legend details"
                            className="ip:absolute ip:bottom-0 ip:right-0 ip:block ip:w-full"
                        >
                            <MapControlLegend
                                height={24}
                                legends={legends}
                            />
                        </LegendTrigger>
                    </div>
                )}
            </div>
            {hasLegends && (
                <MapControlLegendDetails
                    open={legendDetailsOpen}
                    onClose={closeLegendDetails}
                    legends={legends}
                    listType={legendListType}
                />
            )}
        </>
    )
}
