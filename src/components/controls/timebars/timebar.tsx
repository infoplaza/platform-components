import React, { useEffect, useState, useRef, useMemo, useCallback } from "react"

import * as Unicons from '@/src/components/icons'
import ReactSlider from '@/src/components/sliders'
import { LoadingSpinner as LoadingSpinnerIcon } from "@/src/components/icons"
// import ExportPreviewMarker from "@/components/_experimental/map/control/timebar/ExportPreviewMarker"

// import { useSettings } from "@/src/providers/settings/settings"
import { useWeatherMap } from "@/src/providers/weather/weather"
// import { useSyncTimebarPlaying, useTimestampMap } from "@/components/_webgl/context"
import { useTimestampMap } from "@/src/redux/timestamps"
// import { useExperimental_MapWeatherContainer } from "@/context/_experimental/map/weather_container"

import { formatTime } from '@/src/utilities/date'
import { useStorageState } from "@/src/utilities/storageState"
import { twMerge } from "@/src/utilities/external/twMerge"
import useKeyPress from '@/src/hooks/keypress'

import type { SupportedLocale } from "@/src/utilities/date"
import type { TimestampInfo } from "@/@types/weather.types"

interface FormattedTime {
    dayWeek: string
    dayMonth: string
    month: string
    hour: string
    minute: string
}

interface MarkStep {
    titleSM?: string
    titleMD?: string | React.ReactNode
    subtitle?: string | boolean
}

interface TimebarOptions {
    acceptedMinutes?: string[]
}

interface MapControlTimebarProps {
    language?: string
    timezone?: string
    small?: boolean
    onlyActive?: boolean
    playButton?: boolean
    onChange?: ((data: any) => void) | null
    className?: string
    options?: TimebarOptions
}

interface SliderProps {
    key: string
    'aria-disabled'?: boolean
    'aria-label'?: string
    'aria-labelledby'?: string
    'aria-orientation'?: 'horizontal' | 'vertical'
    'aria-valuemax'?: number
    'aria-valuemin'?: number
    'aria-valuenow'?: number
    className?: string
    onFocus?: () => void
    onMouseDown?: () => void
    onTouchStart?: () => void
    ref?: React.RefObject<any>
    role?: string
    style?: React.CSSProperties
    tabIndex?: number
}

interface SliderState {
    valueNow: number
}

interface MarkProps {
    key: string
    style?: React.CSSProperties
    className?: string
}

export default function MapControlTimebar({ language, timezone, small = false, onlyActive = false, playButton = true, onChange = null, className, options = {} }: MapControlTimebarProps) {
    // const { state, utcTimezone } = useSettings()
    // const { mergeTimebars, playSync, setPlaySync, exportPreviewStep } = useExperimental_MapWeatherContainer()
    const mergeTimebars: boolean = false
    const playSync: boolean = false
    const utcTimezone = false
    const state: { timeSkip?: number; frameSkip?: number } = { timeSkip: 0, frameSkip: 0 }
    const setPlaySync: (value: boolean) => void = () => {}
    const exportPreviewStep = () => {}
    const { elementInfo } = useWeatherMap()
    const { timestamp, timestampsInfo, setTimestamp } = useTimestampMap()

    const [playingButton, setPlayingButton] = useState<boolean>(false)
    const [playingSpeed, setPlayingSpeed] = useStorageState<number>("play-speed", 1)
    const [autoplay, setAutoplay] = useState<boolean>(false)

    // useSyncTimebarPlaying(playingButton || autoplay)

    const playing = useRef<boolean>(false)
    const playingTimeout = useRef<number | null>(null)
    /** Current slider index before advancing; ref avoids stale closures when mapTimestamps / callbacks change each render. */
    // const playCursorRef = useRef(0)
    // const mapTimestampsRef = useRef<TimestampInfo[]>([])
    // const calcTimeoutRef = useRef<(cur: number) => number>(() => 500)
    // const applyTimestampRef = useRef<(ts: number) => void>(() => {})
    const mainDivRef = useRef<HTMLDivElement>(null)

    // const throttledSetTimestamp = useThrottle(
    //     (ts: number) => {
    //         weatherContext.setTimestamp(ts)
    //     },
    //     50
    // )
    const throttledSetTimestamp = useCallback(
        (ts: number) => {
            setTimestamp(ts)
        }, [setTimestamp]
    )

    const disablePlayButton = useMemo(() => {
        return (playSync && !playing.current)
    }, [playSync, autoplay])

    useEffect(() => {
        if (!mergeTimebars){
            return
        }

        if (playingButton === playSync) {
            return
        }

        setPlayingButton(playSync)
    }, [playSync, mergeTimebars])

    const mapTimestamps = useMemo((): TimestampInfo[] => {
        return (timestampsInfo || [])
            .map((ts: TimestampInfo, idx: number): TimestampInfo | null => {
                if (!ts) {
                    return null
                }

                if (onlyActive && !ts.url) {
                    return null
                }

                return { ...ts, index: idx, loaded: ts.procent === 100 }
            })
            .filter((ts): ts is TimestampInfo => ts !== null)
            .sort((a, b) => a.timestamp - b.timestamp)
    }, [timestampsInfo, onlyActive])

    // Derive timestamp index from context (single source of truth)
    const index = useMemo((): number | null => {
        if (timestamp == null || !mapTimestamps.length) return null
        const i = mapTimestamps.findIndex((m) => m.timestamp === timestamp)
        return i >= 0 ? i : null
    }, [timestamp, mapTimestamps])

    const formatStep = useCallback(
        (i: number): FormattedTime | null => {
            const rec = mapTimestamps[i]
            if (!rec) {
                return null
            }
            const t = rec.timestamp * 1000
            const locale = (language as SupportedLocale) || "en"
            return formatTime(t, locale, timezone ?? "UTC", utcTimezone)
        },
        [mapTimestamps, language, timezone, utcTimezone]
    )

    
    // Pre-compute all formatted timestamps to avoid repeated formatStep calls
    const formattedTimestamps = useMemo(() => {
        return mapTimestamps.map((_, i) => formatStep(i))
    }, [mapTimestamps, formatStep])

    // Calculate marks type based on timestamp range
    const marksType = useMemo(() => {
        if (mapTimestamps.length <= 1) {
            return 'hours'
        }
        
        const timeRange = mapTimestamps[mapTimestamps.length - 1].timestamp - mapTimestamps[0].timestamp
        return timeRange > 3600 * 32 ? 'days' : 'hours'
    }, [mapTimestamps])

    // Calculate day marks
    const marksDays = useMemo(() => {
        const acceptedHours = ['00', '06', '12', '18']

        return formattedTimestamps.reduce((acc, fmt, i) => {
            if (fmt && (fmt.dayWeek !== acc.lastDay || acceptedHours.includes(fmt.hour))) {
                return {
                    days: [...acc.days, i],
                    lastDay: fmt.dayWeek
                }
            }
            return acc
        }, { days: [] as number[], lastDay: null as string | null }).days
    }, [formattedTimestamps])

    // Calculate hour marks
    const marksHours = useMemo(() => {
        const acceptedMinutes = options?.acceptedMinutes ?? ['00', '15', '30', '45']

        return formattedTimestamps.reduce((acc, fmt, i) => {
            if (fmt && (fmt.hour !== acc.lastHour || acceptedMinutes.includes(fmt.minute))) {
                return {
                    hours: [...acc.hours, i],
                    lastHour: fmt.hour
                }
            }
            return acc
        }, { hours: [] as number[], lastHour: null as string | null }).hours
    }, [formattedTimestamps, options?.acceptedMinutes])

    const onSliderChange = useCallback(
        (i: number) => {
            const step = mapTimestamps[i]
            if (!step) {
                return
            }
            throttledSetTimestamp(step.timestamp)
        },
        [mapTimestamps, throttledSetTimestamp]
    )

    const calcTimeout = useCallback(
        (cur: number): number => {
            // const speed = (small && mergeTimebars) ? 1 : playingSpeed
            const base = 500 / (playingSpeed)
            const add = 50
            if (cur >= mapTimestamps.length - 1) {
                return base * 4
            }
            const delta =
                mapTimestamps[cur + 1].timestamp - mapTimestamps[cur].timestamp

            const t = base + (add * (delta - 3600)) / 3600

            return Math.min(t, base * 3)
        },
        [playingSpeed, mapTimestamps]
    )

    // mapTimestampsRef.current = mapTimestamps
    // calcTimeoutRef.current = calcTimeout
    // applyTimestampRef.current = throttledSetTimestamp

    const stop = useCallback(() => {
        if (playingTimeout.current != null) {
            clearTimeout(playingTimeout.current)
        }

        if (mergeTimebars){
            setPlaySync(false)
        }

        playing.current = false
        setPlayingButton(false)
    }, [mergeTimebars, setPlaySync])

    const nextStep = useCallback(
        (cur: number) => {
            let next = cur + 1
            if (next >= mapTimestamps.length) {
                next = 0
            }
            onSliderChange(next)

            if (playing.current) {
                playingTimeout.current = window.setTimeout(() => {
                    nextStep(next)
                }, calcTimeout(next))
            }
        },
        [mapTimestamps.length, onSliderChange, calcTimeout, playingSpeed]
    )

    const onButtonPlay = useCallback(() => {
        if (playing.current) {
            stop()

            return
        }

        if (autoplay && !playingButton) {
            setAutoplay(false)
            stop()
            // return
        }

        if (playSync && mergeTimebars) {
            setPlaySync(false)
            stop()

            return
        }

        if (mergeTimebars){
            setPlaySync(true)
        }

        playing.current = true
        setPlayingButton(true)

        nextStep(index ?? 0)

    }, [index, nextStep, stop, mergeTimebars, playing, playSync, setPlaySync, autoplay])

    const onButtonNext = useCallback(() => {
        if (index == null || !mapTimestamps.length) {
            return
        }
        if (playing.current) {
            stop()
        }

        const step = state.timeSkip ? index + state.timeSkip : index + 1
        const wrappedStep = step >= mapTimestamps.length ? (step - mapTimestamps.length) : step
        onSliderChange(wrappedStep)
    }, [index, stop, playing, state.timeSkip, mapTimestamps, onSliderChange])

    const onButtonPrev = useCallback(() => {
        if (index == null || !mapTimestamps.length) {
            return
        }
        if (playing.current) {
            stop()
        }
        const step = state.timeSkip ? index - state.timeSkip : index - 1
        const wrappedStep = step < 0 ? mapTimestamps.length + step : step
        onSliderChange(wrappedStep)
    }, [index, mapTimestamps.length, stop, playing, state.timeSkip, mapTimestamps, onSliderChange])

    const onWheel = useCallback(
        (e: React.WheelEvent) => {
            stop()
            if (e.deltaY < 0) onButtonPrev()
            else onButtonNext()
        },
        [onButtonNext, onButtonPrev, stop]
    )

    useKeyPress(" ", onButtonPlay, null, mainDivRef as React.RefObject<HTMLElement>)
    useKeyPress("ArrowRight", () => {
        onButtonNext()
    }, null, mainDivRef as React.RefObject<HTMLElement>)
    useKeyPress("ArrowLeft", () => {
        onButtonPrev()
    }, null, mainDivRef as React.RefObject<HTMLElement>)

    // useEffect(() => {
    //     const ts = timestamp

    //     if (!ts) {
    //         if (playing.current) {
    //             stop()
    //         }

    //         return
    //     }

    //     // Only correct when the exact timestamp is not available
    //     const exactMatch = mapTimestamps.findIndex((m: TimestampInfo) => m.timestamp === ts)
    //     if (exactMatch >= 0) {
    //         return
    //     }

    //     if (mapTimestamps.length > 0) {
    //         const nearestIndex = findNearestIndex(mapTimestamps as unknown as TimestampRecord[], ts as number)
    //         throttledSetIndex(nearestIndex)
    //     }
    // }, [
    //     timestamp,
    //     mapTimestamps,
    //     onChange,
    //     stop,
    //     playing
    // ])

    useEffect(() => {
        return () => {
            return stop()
        }
    }, [stop])

    useEffect(() => {
        if (playingButton) {
            stop()
        }
    }, [playingSpeed])

    useEffect(() => {
        if (!playing.current){
            return
        }
        if (index == null) {
            return
        }

        const nextStep = mapTimestamps[index + 1]
        if (!nextStep){
            return
        }
        // auto stop playing when preloading is not available or not active on the next step.
        if (nextStep?.procent < 100 || !nextStep?.active){
        // if (!nextStep?.active){ 
            if (nextStep?.active) {
                setAutoplay(true)
            }

            stop()
        }
    }, [mapTimestamps, index, playing.current])

    const getElements = useCallback((timestamps: TimestampInfo[], index: number, count: number = 10): TimestampInfo[] => {
        const len = timestamps.length
        const actualCount = Math.min(count, len)
        
        return Array.from({ length: actualCount }, (_, i) => 
            timestamps[(index + i) % len]
        )
    }, [])

    // Helper function to check if a day has less than 4 hours
    const getHoursPerDay = useCallback((formattedTimes: (FormattedTime | null)[]) => {
        const dayMap = new Map<string, number>()
        
        formattedTimes.forEach((fmt) => {
            if (!fmt) return
            
            // Create a unique key for each day (dayMonth + month + dayWeek)
            const dayKey = `${fmt.dayMonth}-${fmt.month}-${fmt.dayWeek}`
            dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1)
        })
        
        return dayMap
    }, [])

    useEffect(() => {
        if (!autoplay){
            return
        }
        if (index == null) {
            return
        }

        if (playing.current){
            return
        }

        // if (state.frameSkip) {
            // Frame Skip enabled: wait until the next 10 frames are loaded before
            // resuming so playback doesn't immediately re-stall.
            const nextSteps = getElements(mapTimestamps, index + 1, 10)
            if (nextSteps.length && nextSteps.every((step) => step?.active && step?.procent >= 100)) {
                onButtonPlay()
                setAutoplay(false)
            }
            return
        // }

        // // Frame Skip disabled: resume as soon as the immediate next frame is ready,
        // // pairing with the serialized-await preloader in texture.ts.
        // const nextStep = mapTimestamps[index + 1]
        // if (!nextStep){
        //     return
        // }

        // if (nextStep?.active && nextStep?.procent >= 100){
        //     onButtonPlay()
        //     setAutoplay(false)
        // }
    }, [mapTimestamps, index, onButtonPlay, autoplay, state.frameSkip, getElements])

    const SliderComponent = ReactSlider as any


    const markStep = useCallback(
        (key: number): MarkStep | null => {
            const prev = formattedTimestamps[key - 1]
            const cur = formattedTimestamps[key]

            if (!cur) {
                return null
            }
     
            if (marksType === "hours") {
                if ((prev && prev.hour !== cur.hour) || cur.minute === "00") {
                    return { titleSM: cur.hour, titleMD: `${cur.hour}:${cur.minute}` }
                }

                return { subtitle: `${cur.hour}:${cur.minute}` }
            }


            if ((prev && prev.dayWeek !== cur.dayWeek) || cur.hour === "00") {
                return {
                    titleSM: cur.dayWeek,
                    titleMD: (
                        <span className="ip:flex ip:space-x-0.5">
                            <span>{cur.dayWeek}</span> 
                            <span className="ip:font-semibold">{cur.dayMonth}</span>
                        </span>
                    ),
                }
            }

            // Check if current day has less than 4 hours
            const dayKey = `${cur.dayMonth}-${cur.month}-${cur.dayWeek}`
            const dayMap = getHoursPerDay(formattedTimestamps)
            const hoursInCurrentDay = dayMap.get(dayKey) || 0

            // Return null if this day has less than 4 hours
            if (hoursInCurrentDay < 10) {
                return { subtitle: true }
            }

            return { subtitle: `${cur.hour}:${cur.minute}` }
        },
        [formattedTimestamps, marksType, getHoursPerDay]
    )

    const renderMarksHandler = useCallback((props: MarkProps) => {
        const { subtitle, titleSM, titleMD } = markStep(parseInt(props.key)) || {}

        return (
            <div 
                className={
                    twMerge(
                        'ip:absolute ip:z-0 ip:border-l  ip:border-dark/50 ip:dark:border-white/50', 
                        [
                            subtitle ? 'ip:opacity-30 ip:hidden' + (small ? '' : 'ip:lg:block') : '', 
                            small ? 'ip:top-2 ip:h-3' : 'ip:top-2 ip:left-2.5 ip:h-7 ip:md:h-8'
                        ]
                    )
                }>
                <div
                    className={twMerge('ip:dark:text-white', [small ? 'ip:text-xs ip:pl-0.5 ip:pt-0.5' : 'ip:text-xs ip:md:text-sm ip:pl-1 ip:pt-1.5'])}>
                    <div className="ip:font-light ip:mr-1 ip:relative">
                        <div className="ip:block ip:md:hidden">{titleSM}</div>
                        <div className={twMerge("ip:absolute ip:hidden ip:md:block", small && 'ip:text-2xs', !small && 'ip:text-2xs ip:sm:text-xs')}>{titleMD}</div>
                    </div>
                    {!small && (
                        <span className="ip:hidden ip:md:inline ip:font-medium ip:text-2xs">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>
        )
    }, [markStep, small])

    return (
        <div
            ref={mainDivRef}
            tabIndex={0}
            className={twMerge('ip:outline-none ip:focus:outline-none ip:select-none ip:pointer-events-auto ip:bg-white/80 ip:dark:bg-dark/80 ip:backdrop-blur-md ip:border ip:dark:border-white/10 ip:w-full ip:transition-all ip:duration-1000', [className, index != null && timestamp != null && elementInfo?.live !== true ? 'ip:max-h-screen' : 'ip:max-h-0'])}
        >
            {(index != null && timestamp != null && mapTimestamps.length > 1) ?
                <div className='ip:flex ip:sm:gap-3 ip:gap-0'>
                    {playButton ? (
                        <div className={twMerge('ip:shrink-0', [small ? 'ip:p-1' : 'ip:p-1.5 ip:md:py-3 ip:md:pl-3'])}>
                            {autoplay && !playingButton ? (
                                <button
                                    type="button"
                                    title="Stop"
                                    onClick={() => {
                                        setAutoplay(false)
                                        stop()
                                    }}
                                    className={
                                        twMerge(
                                            'ip:hover:bg-opacity-80 ip:cursor-pointer ip:flex ip:place-items-center ip:place-content-center ip:rounded-full ip:bg-primary ip:text-white',
                                            [
                                                small ? 'ip:w-7 ip:h-7' : 'ip:w-10 ip:md:w-12 ip:h-10 ip:md:h-12 ',
                                            ]
                                        )}>
                                    <LoadingSpinnerIcon className={twMerge(small ? 'ip:w-4 ip:h-4' : 'ip:w-7 ip:h-7')} />
                                </button>
                            ) : (
                                <button
                                    disabled={disablePlayButton}
                                    type="button"
                                    onClick={(onButtonPlay)}
                                    className={
                                        twMerge(
                                            'ip:hover:bg-opacity-80 ip:cursor-pointer ip:flex ip:place-items-center ip:place-content-center ip:rounded-full',
                                            [
                                                small ? 'ip:w-7 ip:h-7' : 'ip:w-10 ip:md:w-12 ip:h-10 ip:md:h-12 ',
                                                playingButton ? 'ip:bg-white ip:text-primary' : 'ip:bg-primary ip:text-white',
                                                disablePlayButton ? 'ip:opacity-50 ip:cursor-not-allowed ip:bg-gray-200' : '',
                                            ]
                                        )} >
                                    {playingButton ? (
                                        <Unicons.UilPause className={twMerge(small ? 'ip:w-4 ip:h-4' : 'ip:w-6 ip:h-6')} />
                                    ) : (
                                        <Unicons.UilPlay className={twMerge(small ? 'ip:w-4 ip:h-4' : 'ip:w-6 ip:h-6')} />
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={twMerge('ip:shrink-0', [small ? 'ip:p-1.5' : 'ip:p-1.5 ip:pl-1 ip:md:py-3 ip:md:pl-3'])}>
                            <div className={twMerge(small ? 'ip:h-8' : 'ip:h-10 ip:md:h-12 ')}></div>
                        </div>
                    )}


                    {!small && !playingButton && !autoplay && (
                        <div className="ip:relative ip:place-content-center">
                            <div className="ip:hidden ip:md:flex  ip:items-center">
                                <div className="ip:flex ip:divide-x ip:divide-white/50 ip:h-6">
                                    <div title={`Previous${state.timeSkip ? `: Skip ${state.timeSkip} frames` : ''}`}>
                                        <button type="button"
                                            onClick={() => onButtonPrev()}
                                            className="ip:bg-white ip:text-primary ip:hover:bg-cloud ip:p-1 ip:rounded-l-full ip:w-6">
                                            <Unicons.UilAngleLeftB className="ip:w-4 ip:h-4" />
                                        </button>
                                    </div>
                                    <div title={`Next${state.timeSkip ? `: Skip ${state.timeSkip} frames` : ''}`}>
                                        <button type="button"
                                            onClick={() => onButtonNext()}
                                            className="ip:bg-white ip:text-primary ip:hover:bg-cloud ip:p-1 ip:rounded-r-full ip:w-6">
                                            <Unicons.UilAngleRightB className="ip:w-4 ip:h-4" />
                                        </button>
                                    </div>
                                </div>
                                {/* <div className='self-center absolute bottom-3 left-1/2 -translate-x-1/2'>
                                    <div className='flex gap-1'>
                                        {
                                            timeSkipOptions.map((hour) => {
                                                return (
                                                    <div key={`step-${hour}`}>
                                                        <button type="button"
                                                            disabled={autoplay}
                                                            onClick={() => onTimeSkipHandler(hour)}
                                                            className={
                                                                twMerge(
                                                                    'flex items-center text-3xs place-content-center',
                                                                    [
                                                                        ' text-gray-400 hover:bg-cloud',
                                                                        state.timeSkip === hour ? 'text-primary font-semibold' : '',
                                                                    ]
                                                                )
                                                            }>
                                                            { hour }
                                                        </button>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    )}

                    {((!small && playingButton) || autoplay) && (
                        <div className="ip:hidden ip:md:flex ip:place-content-center ip:items-center">
                            <div className="ip:flex ip:divide-x ip:divide-white/50 ip:h-6 ip:overflow-hidden ip:rounded ip:text-2xs">
                                {[ 1, 2, 4 ].map((speed) => (
                                    <div key={`speed-${speed}`}>
                                        <button type="button"
                                            disabled={autoplay}
                                            onClick={() => setPlayingSpeed(speed)}
                                            className={
                                                twMerge(
                                                    'ip:h-6 ip:w-4 ip:flex ip:items-center ip:place-content-center',
                                                    [
                                                        playingSpeed === speed ? 'ip:bg-primary ip:text-white' : 'ip:bg-white ip:text-primary ip:hover:bg-cloud',
                                                        autoplay ? 'ip:opacity-50 ip:cursor-not-allowed' : '',
                                                    ]
                                                )
                                            }>
                                            { speed }x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    <div className={`ip:grow ip:relative ${small ? 'ip:pr-2' : 'ip:pr-2 ip:md:pr-6 ip:pt-2 ip:md:pt-3'}`}>
                        <div className={twMerge("ip:absolute ip:top-0 ip:right-0 ip:text-3xs ip:text-center ip:text-gray-500 ip:z-100 ip:font-light ip:dark:text-white ip:nowrap ip:flex ip:gap-1 ip:p-2")}>
                            <span>{formattedTimestamps[index]?.dayWeek} </span>
                            <span>{formattedTimestamps[index]?.dayMonth} </span>
                            <span>{formattedTimestamps[index]?.month} </span>
                            <span className="ip:font-medium">{formattedTimestamps[index]?.hour}:{formattedTimestamps[index]?.minute} </span>
                        </div>
                        <div className={twMerge('ip:absolute ip:flex ip:h-2 ip:left-0 ip:rounded-full ip:overflow-hidden', [small ? 'ip:top-4 ip:right-2' : 'ip:top-5 ip:md:top-8 ip:right-2 ip:md:right-4'])}>
                            {(mapTimestamps).map((ts: TimestampInfo) => (
                                <div 
                                    key={`${ts.timestamp}-${ts.index}-${ts.loaded}-${ts.active}`} 
                                    className={
                                        twMerge('ip:flex-1', 
                                            [
                                                ts.loaded && 'ip:bg-primary/75',
                                                !ts.loaded && 'ip:bg-yellow-400/75', 
                                                !ts.active && 'ip:bg-red-500/75', 
                                            ]
                                        )
                                    }></div>
                            ))}
                            {/* <ExportPreviewMarker
                                mapTimestamps={mapTimestamps}
                                currentIndex={index}
                                exportPreviewStep={exportPreviewStep}
                            /> */}
                        </div>
                        <div className={twMerge('ip:relative', [small ? 'ip:mt-4' : 'ip:mt-3 ip:md:mt-5'])} onWheel={onWheel}>
                            <SliderComponent className="ip:bg-transparent ip:h-2 ip:w-full ip:rounded-full ip:relative ip:z-20 ip:focus:outline-none"
                                trackClassName="ip:focus:outline-none slider-track"
                                thumbClassName="ip:focus:outline-none ip:group"
                                marks={marksType === 'days' ? marksDays : marksHours}
                                min={0}
                                max={(mapTimestamps || []).length - 1}
                                step={1}
                                value={index}
                                onChange={onSliderChange}
                                moveDownByStep={onButtonPrev}
                                moveUpByStep={onButtonNext}
                                onSliderClick={stop}
                                renderThumb={(props: any, state: SliderState) =>
                                    <div
                                        key={props.key}
                                        aria-disabled={props['aria-disabled']}
                                        aria-label={props['aria-label']}
                                        aria-labelledby={props['aria-labelledby']}
                                        aria-orientation={props['aria-orientation']}
                                        aria-valuemax={props['aria-valuemax']}
                                        aria-valuemin={props['aria-valuemin']}
                                        aria-valuenow={props['aria-valuenow']}
                                        className={props.className}
                                        onFocus={props.onFocus}
                                        onMouseDown={props.onMouseDown}
                                        onTouchStart={props.onTouchStart}
                                        ref={props.ref}
                                        role={props.role}
                                        style={props.style}
                                        tabIndex={props.tabIndex}
                                    >
                                        <div className={twMerge(
                                            'ip:h-4 ip:w-6 ip:-mt-1 ip:rounded-full ip:border-2 ip:border-dark ip:dark:border-white ip:cursor-pointer ip:transition-scale ip:group-focus:scale-110 ip:group-hover:scale-110',
                                            [
                                                !mapTimestamps[state.valueNow]?.active ? 'ip:bg-red-500' : !mapTimestamps[state.valueNow]?.loaded ? 'ip:bg-yellow-400' : 'ip:bg-primary',
                                                autoplay ? 'ip:animate-pulse': '',
                                            ])} >
                                        </div>
                                        {(() => {
                                            const formattedStep = formattedTimestamps[state.valueNow];
                                            return formattedStep != null ? (
                                                <div className="ip:absolute ip:z-100 ip:bottom-6 ip:-left-5 ip:bg-dark ip:text-white ip:text-xs ip:rounded-md ip:leading-none ip:w-16 ip:py-1 ip:text-center">
                                                    <span className="ip:font-light ip:mr-1 ip:2xs:block ip:hidden">{formattedStep.dayWeek}</span>
                                                    <span className="ip:font-semibold">
                                                        {formattedStep.hour}:{formattedStep.minute}
                                                    </span>
                                                </div>
                                            ) : '';
                                        })()}
                                        <div className="ip:absolute ip:z-30 ip:bottom-5 ip:left-2 ip:w-2 ip:h-2 ip:bg-dark ip:rotate-45"></div>
                                    </div>
                                }
                                renderMark={(props: MarkProps) =>
                                    <div
                                        style={props.style}
                                        className={props.className}
                                        key={props.key}>
                                        {renderMarksHandler(props)}
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>
                : null}
        </div>
    )
} 