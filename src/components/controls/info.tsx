import React, { useMemo, useState } from 'react'

import { twMerge } from "@/src/utilities/external/twMerge"
import { formatDate, formatRun, formatTime } from '@/src/utilities/date'

import { IpAngleDown, IpExclamationTriangle } from '@/src/components/icons'
import type { ModelInfo as ModelInfoType, TimestampInfo, ElementInfo as ElementInfoType, WeatherLayersInfo as WeatherLayersInfoType } from '@/@types/weather.types'
import { useTimestampMap } from '@/src/redux/timestamps'
import type { SupportedLocale } from '@/src/utilities/date'
import { useWeatherMap } from '@/src/providers/weather'

type Align = 'left' | 'right'

type TimestampInfoItem = {
    timestamp: number
    url: boolean
}

type ModelDescription = {
    region?: string
    resolution?: string
    runtimeshours?: unknown[]
    version?: string | number
    institute?: string
    category?: string
    type?: string
}

type ModelInfo = {
    title: string
    available?: boolean
    type?: string
    description?: ModelDescription
    textLegal?: string
}

type ElementInfo = {
    i18n: string
    description?: string
    available?: boolean
}

type LayersInfo = {
    run?: number
    member?: string
    level?: string
}

type FormattedTimestamp = {
    dayMonth: string
    dayWeek: string
    month: string
    hour: string
    minute: string
}
interface MapControlInfoProps {
    small?: boolean
    align?: 'left' | 'right'
    timestamp?: number
    timestampsInfo?: TimestampInfo[]
    model?: string
    modelInfo?: ModelInfoType
    elementInfo?: ElementInfoType
    layersInfo?: WeatherLayersInfoType
    month?: string
}

const MapControlInfo: React.FC<MapControlInfoProps> = function ({ small = false, align = 'left' }) {
    const { modelInfo, model, elementInfo, layersInfo, month } = useWeatherMap()
    const { timestamp, timestampsInfo } = useTimestampMap()

    const utcTimezone = true

    const [ isModelDetailsOpen, setIsModelDetailsOpen ] = useState(true)
    
    const InfoUnit = useMemo(() => {
        if (layersInfo?.isMixedLayers) {
            return null
        }

        return (layersInfo)?.layers[0].unit
    }, [layersInfo?.layers, layersInfo?.isMixedLayers])
    
    const InfoElement = useMemo(() => {
        return {
            title: elementInfo?.name ?? undefined,
            description: (elementInfo as ElementInfo)?.description ? (elementInfo as ElementInfo).description : undefined
        }
    }, [elementInfo])

    const InfoRun = useMemo(() => {
        return (layersInfo as unknown as LayersInfo)?.run ? formatRun((layersInfo as unknown as LayersInfo).run, 'en' as SupportedLocale) || undefined : undefined
    }, [layersInfo])

    const InfoMember = useMemo(() => {
        return (layersInfo as unknown as LayersInfo)?.member ? (layersInfo as unknown as LayersInfo).member : undefined
    }, [layersInfo])

    const InfoWarning = useMemo(() => {
        const tsData = timestampsInfo.find(ts => ts.timestamp === timestamp)
        return tsData && !tsData.url
            ? 'Timestep unavailable'
            : undefined
    }, [timestampsInfo, timestamp])

    const InfoOffset = useMemo(() => {
        if (!(timestampsInfo as unknown as TimestampInfoItem[]).length || !timestamp) {
            return undefined
        }

        const first = (timestampsInfo as unknown as TimestampInfoItem[])[0].timestamp
        return ((timestamp as unknown as number) - first) / (model !== 'nowcast' ? 3600 : 60)

    }, [model, timestamp, timestampsInfo])

    const isClimate = useMemo(() => {
        return modelInfo?.type === 'climate' && month
    }, [modelInfo, month])

    const isForecast = useMemo(() => {
        return modelInfo?.type === 'forecast'
    }, [modelInfo?.type])

    const InfoTime = useMemo(() => {
        return isClimate
            ? formatDate(new Date(2000, (month as unknown as number) - (utcTimezone ? 0 : 1), 1), 'MMMM', 'en' as SupportedLocale, utcTimezone ? 'UTC' : undefined)
            : null
    }, [isClimate, month, utcTimezone])

    const InfoLevel = useMemo(() => {
        return (layersInfo as unknown as LayersInfo)?.level ? (layersInfo as unknown as LayersInfo).level : undefined
    }, [layersInfo])

    const InfoTimestamp = useMemo(() => {
        return timestamp && !isClimate ? formatTime((timestamp as unknown as number) * 1000, 'en' as SupportedLocale, 'UTC', utcTimezone) as unknown as FormattedTimestamp : undefined
    }, [timestamp, isClimate, utcTimezone])

    if (!modelInfo) {
        return null
    }

    return (
        <div id="map-info" className={twMerge('ip:pointer-events-auto ip:bg-white/80 ip:dark:bg-dark/80 ip:backdrop-blur-md ip:overflow-hidden ip:w-full ip:border ip:border-white/10', small ? align === 'left' ? 'ip:rounded-md' : 'ip:rounded-bl-md' : 'ip:rounded-lg')}>
            <div className="ip:sm:grid ip:sm:grid-cols-3 ip:flex ip:w-full ip:justify-between ip:flex-nowrap ip:sm:flex-wrap">
                <div className={twMerge('ip:col-span-2 ip:flex ip:flex-col ip:grow ip:gap-1 ip:border-white ip:dark:border-white/10 ip:self-center', small ? 'ip:p-1 ip:sm:p-2' : 'ip:py-1.5 ip:px-2 ip:sm:p-3', align === 'left' ? 'ip:order-first ip:sm:border-r' : 'ip:order-2 ip:sm:border-l')}>
                    <div className="ip:leading-none ip:text-sm ip:sm:font-medium ip:font-normal">
                        <span>{InfoElement.title}</span>
                        {InfoLevel && <span className="ip:text-xs ip:font-hairline"> {InfoLevel}</span>}
                        {InfoUnit && <span className="ip:text-3xs ip:font-hairline"> ({InfoUnit})</span>}
                    </div>
                    {!small && InfoElement.description && (
                        <div className="ip:leading-4 ip:sm:block ip:font-light ip:text-2xs ip:sm:text-xs">
                            {InfoElement.description}
                        </div>
                    )}
                    {isForecast && (
                        <div className="ip:leading-none ip:opacity-75 ip:sm:block ip:hidden">
                            <button
                                className="ip:text-xs ip:flex ip:items-center ip:font-semibold ip:uppercase ip:cursor-pointer ip:hover:underline ip:sm:text-blue-600"
                                onClick={() => setIsModelDetailsOpen(prev => !prev)}
                                role="button"
                                aria-expanded={isModelDetailsOpen}
                            >
                                {(modelInfo as unknown as ModelInfoType)?.title}
                                <IpAngleDown className={twMerge("ip:w-4 ip:h-4 ip:ml-1 ip:transition-transform ip:duration-200 ip:ease-in-out ip:hidden ip:sm:block", isModelDetailsOpen ? 'ip:rotate-180' : '')} />
                            </button>
                            <div className="ip:flex ip:sm:flex-col ip:gap-2">
                                {InfoRun && (
                                    <span className="ip:block ip:text-3xs ip:mt-0.5">{InfoRun}</span>
                                )}
                                {InfoMember && (
                                    <span className="ip:block ip:text-3xs ip:mt-0.5">{InfoMember}</span>
                                )}
                            </div>

                            {isModelDetailsOpen && (
                                <div className="ip:hidden ip:sm:block ip:mt-1 ip:leading-4 ip:text-3xs ip:opacity-90">
                                    <div className="ip:flex ip:flex-row ip:gap-1.5">
                                        {(modelInfo as unknown as ModelInfo)?.description?.region && (
                                            <div>{(modelInfo as unknown as ModelInfo).description!.region}</div>
                                        )}
                                        {Array.isArray((modelInfo as unknown as ModelInfo)?.description?.runtimeshours) && <span>&bull;</span>}
                                        {(modelInfo as unknown as ModelInfo)?.description?.resolution && (
                                            <div>{(modelInfo as unknown as ModelInfo).description!.resolution}</div>
                                        )}
                                        {Array.isArray((modelInfo as unknown as ModelInfo)?.description?.runtimeshours) && <span>&bull;</span>}
                                        {Array.isArray((modelInfo as unknown as ModelInfo)?.description?.runtimeshours) && (
                                            <div>{'Runs per day: ' + (modelInfo as unknown as ModelInfo).description!.runtimeshours!.length}</div>
                                        )}
                                        {(modelInfo as unknown as ModelInfo)?.description?.version && <span>&bull;</span>}
                                        {(modelInfo as unknown as ModelInfo)?.description?.version && (
                                            <div>v{(modelInfo as unknown as ModelInfo).description!.version}</div>
                                        )}
                                    </div>
                                    <div className="ip:sm:flex ip:flex-wrap ip:gap-1 ip:mt-1 ip:hidden">
                                        {(modelInfo as unknown as ModelInfo)?.description?.institute && (
                                            <span className="ip:px-1.5 ip:py-0.5 ip:rounded ip:bg-gray-100 ip:dark:bg-dark-50 ip:text-3xs">{(modelInfo as unknown as ModelInfo).description!.institute}</span>
                                        )}
                                        {(modelInfo as unknown as ModelInfo)?.description?.category && (
                                            <span className="ip:px-1.5 ip:py-0.5 ip:rounded ip:bg-gray-100 ip:dark:bg-dark-50 ip:text-3xs">{(modelInfo as unknown as ModelInfo).description!.category}</span>
                                        )}
                                        {(modelInfo as unknown as ModelInfo)?.description?.type && (
                                            <span className="ip:px-1.5 ip:py-0.5 ip:rounded ip:bg-gray-100 ip:dark:bg-dark-50 ip:text-3xs">{(modelInfo as unknown as ModelInfo).description!.type}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={twMerge('ip:col-span-1 ip:items-center ip:justify-center ip:flex ip:flex-col ip:gap-1', small ? 'ip:p-2 ip:min-w-12' : 'ip:sm:p-3 ip:min-w-16', align === 'left' ? 'ip:order-2' : 'ip:order-1')}>
                    {InfoTimestamp && (
                        <div className="ip:hidden ip:sm:flex ip:flex-col ip:items-center ip:gap-1">
                            <div className={twMerge('ip:flex ip:items-baseline ip:justify-center ip:gap-1 ip:leading-none ip:font-medium ip:whitespace-nowrap', small ? 'ip:text-lg' : 'ip:text-xl')}>
                                <span>{InfoTimestamp.hour}:{InfoTimestamp.minute}</span>
                            </div>
                            <div className="ip:leading-none ip:opacity-75 ip:text-xs ip:text-center ip:whitespace-nowrap">
                                {InfoTimestamp.dayWeek} {InfoTimestamp.dayMonth} {InfoTimestamp.month}
                            </div>
                            {/* <TimezoneIndicator className="ip:ml-1" /> */}
                            {InfoOffset != null && (
                                <div className="ip:opacity-50 ip:text-3xs ip:text-center">
                                    +{`000${InfoOffset}`.slice(-3)}
                                </div>
                            )}
                        </div>
                    )}

                    {InfoTimestamp && (
                        <div className={twMerge("ip:text-sm ip:text-center ip:text-black ip:dark:text-white ip:nowrap ip:flex ip:gap-1 ip:sm:hidden ip:font-medium ip:sm:font-normal ip:p-2 ip:align-center",  align === 'left' ? 'ip:order-2' : 'ip:order-1')}>
                            <span>{InfoTimestamp.dayWeek} </span>
                            <span>{InfoTimestamp.dayMonth} </span>
                            <span>{InfoTimestamp.month} </span>
                            <span>{InfoTimestamp.hour}:{InfoTimestamp.minute}</span>
                            {/* <TimezoneIndicator className="ip:items-center ip:justify-center ip:align-center ip:text-center ip:content-center" /> */}
                            {InfoOffset && (
                                <span className={ twMerge('ip:text-gray-500 ip:text-3xs ip:text-center ip:content-center',)} >
                                    (+{`0${InfoOffset}`.slice(-3)})
                                </span>
                            )}
                        </div>
                    )}
                    {InfoTime && (
                        <div className={twMerge('ip:leading-none ip:font-medium ip:text-center ip:p-2', small ? 'ip:text-sm ip:sm:text-lg' : 'ip:text-sm ip:sm:text-xl')} >
                            {InfoTime}
                            {/* <TimezoneIndicator className="ip:ml-1" /> */}
                        </div>
                    )}
                </div>


                { (modelInfo as unknown as ModelInfo)?.textLegal && (
                    <div className="ip:col-span-3 ip:order-last ip:text-gray-500 ip:prose ip:text-3xs ip:leading-3 ip:bg-gray-100 ip:dark:bg-dark ip:px-3 ip:py-1 ip:w-full">
                        <span>{(modelInfo as unknown as ModelInfo).textLegal}</span>
                    </div>
                )}
            </div>
            {InfoWarning && (
                <div className="ip:bg-red-500/75 ip:px-3 ip:py-2">
                    <div className="ip:flex ip:gap-2 ip:items-start ip:text-white">
                        <IpExclamationTriangle className="ip:w-4 ip:h-4 ip:mt-0.5"/>
                        <div className="ip:text-2xs ip:leading-4 ip:font-normal ip:sm:max-w-48">
                            {InfoWarning}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MapControlInfo


