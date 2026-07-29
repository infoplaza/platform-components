import React, { useState, useEffect } from 'react'

import ControlTimebar from '@/src/components/controls/timebars/timebar'
import MapControlElement from '@/src/components/controls/element'
// import MapControlLegend, { LegendTrigger, MapControlLegendDetails } from '@/src/components/controls/legend'
// import MapControlLegendList from '@/src/components/controls/legend/list'
// import { isMultiRowLegend } from '@/src/components/controls/legend/utils'
import MapControlModel from '@/src/components/controls/model'
import MapControlRun from '@/src/components/controls/run'
// import MapControlMember from '@/src/components/controls/member'

import { useWeatherMap } from '@/src/providers/weather/weather'
// import { useLegendValues, useTimestampMap } from '@/src/components/_webgl/context'
import { useLegendValues } from '@/src/providers/legend/legend'
import { useTimestampMap } from '@/src/redux/timestamps'
import MapControlZoom from '@/src/components/controls/zoom'
// import MapControlMobileTimebar from '@/src/components/controls/timebars/mobileTimebar'
import { twMerge } from '@/src/utilities/external/twMerge'
import { isEmpty } from 'lodash'

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
    const { timestamp, timestampsInfo } = useTimestampMap()
    // const isMobileDevice = useIsIosAndroidPhoneOrTablet()
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
                                    {/*  <MapControlMember small={false} /> */}
                                </div>
                            </div>
                        </div>

                        <div className={twMerge(
                            'ip:flex ip:flex-col ip:items-end ip:gap-0.5',
                            hasLegends ? 'ip:sm:gap-1' : 'ip:sm:gap-0.5'
                        )}>
                            <div className="ip:flex ip:gap-1 ip:items-end">
                                {/* {typeof viewState?.latitude === 'number' && typeof viewState?.longitude === 'number' && (
                                    <div>
                                        <CoordinateDisplay
                                            latitude={viewState.latitude}
                                            longitude={viewState.longitude}
                                        />
                                    </div>
                                )} */}
                                <MapControlZoom
                                    mapIndex={mapIndex}
                                    multiMapCount={mapsLength}
                                />
                            </div>
                            {/* <div className="flex sm:flex-row flex-col-reverse gap-1 items-end">
                                {hasLegends && legendListType && (
                                    <LegendTrigger
                                        onClick={openLegendDetails}
                                        expanded={legendDetailsOpen}
                                        aria-label={'Show legend details'}
                                        className="sm:block hidden"
                                    >
                                        <MapControlLegendList legends={legends as any}/>
                                    </LegendTrigger>
                                )}
                            </div> */}
                            {/* {hasLegends && !legendListType && (
                                <div className={twMerge(
                                    'hidden sm:block w-full',
                                )}
                                style={{ height: `${legends.length * (isMultiRowLegend(legends[0] as any) ? 24 * 2 : 24)}px` }}
                                >
                                    <LegendTrigger
                                        onClick={openLegendDetails}
                                        expanded={legendDetailsOpen}
                                        aria-label={'Show legend details'}
                                        className="absolute bottom-0 right-1 block w-full sm:max-w-sm lg:max-w-md xl:max-w-lg"
                                    >
                                        <MapControlLegend
                                            height={isMultiRowLegend(legends[0] as any) ? 24 * 2 : 24}
                                            legends={legends as any}
                                        />
                                    </LegendTrigger>
                                </div>
                            )} */}
                        </div>
                    </div>

                    {Boolean(modelInfo?.format) && ['nowcast', 'forecast'].includes(modelInfo?.format ?? '') && (
                        // elementInfo?.slug === 'observations' ? (
                        //     <ObservationTimebar />
                        // ) : (
                            <div className="ip:flex ip:flex-col">
                                {/* { isMobileDevice ? (
                                    <MapControlMobileTimebar />
                                ) : ( */}
                                    <ControlTimebar
                                        small={isMultipleMapView}
                                        options={elementInfo?.options?.timebar}
                                    />
                                {/* )} */}
                            </div>
                        // )
                    )}
                    {/* {(['climate'].includes(modelInfo?.type)) && (
                        <MapControlMonthTimebar small={isMultipleMapView} />
                    )} */}
                    {/* {(['tropicalweather'].includes(modelInfo?.type) && selectedStorm) && (
                        <MapControlTropicalStormTrackTimeline onClose={onCloseTimeline} selectedStorm={selectedStorm} selectedTrackId={selectedTrackId} />
                    )} */}
                </div>
                {/* {hasLegends && !legendListType && (
                    <div className={twMerge(
                        'sm:hidden block bottom-0 right-0 w-full sm:w-58 md:w-72 lg:w-96',
                    )} style={{ height: `${legends.length * 24}px` }}>
                        <LegendTrigger
                            onClick={openLegendDetails}
                            expanded={legendDetailsOpen}
                            aria-label={'Show legend details'}
                            className="absolute bottom-0 right-0 block w-full"
                        >
                            <MapControlLegend
                                height={24}
                                legends={legends as any}
                            />
                        </LegendTrigger>
                    </div>
                )} */}
            </div>
            {/* {hasLegends && (
                <MapControlLegendDetails
                    open={legendDetailsOpen}
                    onClose={closeLegendDetails}
                    legends={legends}
                    listType={legendListType}
                />
            )} */}
        </>
    )
}
