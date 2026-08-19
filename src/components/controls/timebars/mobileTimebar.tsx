import React, { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { IpLoadingSpinner, IpPause, IpPlay, IpScrollIcon, IpSwipeGestureIcon } from '@/src/components/icons'
import { formatTime } from '@/src/utilities/date'
import useKeyPress from '@/src/hooks/keypress'

import { useStorageState } from "@/src/utilities/storageState"
import { twMerge } from "@/src/utilities/external/twMerge"
import { useThrottle } from "@/src/hooks/throttle"
import { findNearestIndex } from "@/src/utilities/timestamps"
import type { TimestampRecord } from "@/src/utilities/timestamps"
import type { SupportedLocale } from "@/src/utilities/date"

import { useWeatherMap } from "@/src/providers/weather/weather"
import { useSyncTimebarPlaying, useTimestampMap } from "@/src/redux/timestamps"

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

interface MarkProps {
    key: number | string
    style?: React.CSSProperties
    className?: string
}

export default function MapControlMobileTimebar({ language, timezone, small = false, onlyActive = false, playButton = true, onChange = null, className, options = {} }: MapControlTimebarProps) {
    const utcTimezone = false
    const state: { timeSkip?: number; frameSkip?: number } = { timeSkip: 0, frameSkip: 0 }
    const weatherContext = useWeatherMap()
    const { timestamp, timestampsInfo, setTimestamp } = useTimestampMap()
    const playing = useRef<boolean>(false)
    const playingTimeout = useRef<number | null>(null)
    const [playingButton, setPlayingButton] = useState<boolean>(false)
    const [index, setIndex] = useState<number | null>(null)
    const [playingSpeed, setPlayingSpeed] = useStorageState<number>("play-speed", 1)
    const [autoplay, setAutoplay] = useState<boolean>(false)

    useSyncTimebarPlaying(playingButton || autoplay)

    const mainDivRef = useRef<HTMLDivElement>(null)
    const timestampsBarRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const touchContainerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const isDraggingRef = useRef<boolean>(false)
    const dragStartX = useRef<number>(0)
    const dragStartTranslateX = useRef<number>(0)
    const currentTranslateX = useRef<number>(0)
    const [showTooltip, setShowTooltip] = useStorageState<boolean>("mobile-timebar-tooltip-shown", true)
    const [isFadingOut, setIsFadingOut] = useState<boolean>(false)
    const tooltipTimeoutRef = useRef<number | null>(null)

    const throttledSetTimestamp = useThrottle(
        (ts: number) => {
            setTimestamp(ts)
        },
        50
    )

    const disablePlayButton = autoplay

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

    const formattedTimestamps = useMemo(() => {
        return mapTimestamps.map((_, i) => formatStep(i))
    }, [mapTimestamps, formatStep])

    const marksType = useMemo(() => {
        if (mapTimestamps.length <= 1) {
            return 'hours'
        }

        const timeRange = mapTimestamps[mapTimestamps.length - 1].timestamp - mapTimestamps[0].timestamp
        return timeRange > 3600 * 32 ? 'days' : 'hours'
    }, [mapTimestamps])

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
            setIndex(i)
            throttledSetTimestamp(step.timestamp)
        },
        [mapTimestamps, throttledSetTimestamp]
    )

    const getMinSegmentWidth = useCallback((): number => {
        if (typeof window === 'undefined') return 10
        return window.innerWidth >= 768 ? 10 : 10
    }, [])

    const getSegmentWidth = useCallback((containerWidth: number): number => {
        const minWidth = getMinSegmentWidth()
        const calculatedWidth = containerWidth / mapTimestamps.length
        return Math.max(calculatedWidth, minWidth)
    }, [mapTimestamps.length, getMinSegmentWidth])

    const getTranslateXForIndex = useCallback((idx: number): number => {
        if (!timestampsBarRef.current || !containerRef.current || mapTimestamps.length === 0) return 0

        const containerRect = containerRef.current.getBoundingClientRect()
        const containerWidth = containerRect.width || containerRef.current.clientWidth || 0
        const centerPosition = containerWidth / 2

        const segmentWidth = getSegmentWidth(containerWidth)

        const timestampPosition = idx * segmentWidth + segmentWidth / 2

        const translateX = centerPosition - timestampPosition

        const minTranslate = centerPosition - (mapTimestamps.length - 0.5) * segmentWidth
        const maxTranslate = centerPosition - 0.5 * segmentWidth

        return Math.max(minTranslate, Math.min(maxTranslate, translateX))
    }, [mapTimestamps.length, getSegmentWidth])

    useEffect(() => {
        if (!timestampsBarRef.current || index === null || isDragging) return

        const translateX = getTranslateXForIndex(index)
        currentTranslateX.current = translateX
        timestampsBarRef.current.style.transform = `translateX(${translateX}px)`
    }, [index, getTranslateXForIndex, isDragging])

    useEffect(() => {
        if (!timestampsBarRef.current || index === null) return

        const handleResize = () => {
            const translateX = getTranslateXForIndex(index)
            currentTranslateX.current = translateX
            if (timestampsBarRef.current) {
                timestampsBarRef.current.style.transform = `translateX(${translateX}px)`
            }
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', handleResize)
        }
    }, [index, getTranslateXForIndex])

    const getIndexFromTranslateX = useCallback((translateX: number): number => {
        if (!containerRef.current || mapTimestamps.length === 0) return 0

        const containerRect = containerRef.current.getBoundingClientRect()
        const containerWidth = containerRect.width || containerRef.current.clientWidth || 0
        const centerPosition = containerWidth / 2

        const segmentWidth = getSegmentWidth(containerWidth)

        const positionUnderCenter = centerPosition - translateX
        const calculatedIndex = Math.round(positionUnderCenter / segmentWidth)

        return Math.max(0, Math.min(mapTimestamps.length - 1, calculatedIndex))
    }, [mapTimestamps.length, getSegmentWidth])

    const stop = useCallback(() => {
        if (playingTimeout.current != null) {
            clearTimeout(playingTimeout.current)
        }

        playing.current = false
        setPlayingButton(false)
    }, [])

    const handleDragStart = useCallback((clientX: number) => {
        setIsDragging(true)
        isDraggingRef.current = true
        dragStartX.current = clientX
        dragStartTranslateX.current = currentTranslateX.current
        stop()
    }, [stop])

    const handleDragMove = useCallback((clientX: number) => {
        if (!isDraggingRef.current || !timestampsBarRef.current || !containerRef.current) return

        const deltaX = clientX - dragStartX.current
        const newTranslateX = dragStartTranslateX.current + deltaX

        const containerRect = containerRef.current.getBoundingClientRect()
        const containerWidth = containerRect.width || containerRef.current.clientWidth || 0
        const centerPosition = containerWidth / 2
        const segmentWidth = getSegmentWidth(containerWidth)

        const minTranslate = centerPosition - (mapTimestamps.length - 0.5) * segmentWidth
        const maxTranslate = centerPosition - 0.5 * segmentWidth

        const clampedTranslateX = Math.max(minTranslate, Math.min(maxTranslate, newTranslateX))
        currentTranslateX.current = clampedTranslateX
        timestampsBarRef.current.style.transform = `translateX(${clampedTranslateX}px)`

        const newIndex = getIndexFromTranslateX(clampedTranslateX)
        if (newIndex !== index) {
            onSliderChange(newIndex)
        }
    }, [index, getIndexFromTranslateX, onSliderChange, mapTimestamps.length, getSegmentWidth])

    const handleDragEnd = useCallback(() => {
        if (!isDraggingRef.current) return

        setIsDragging(false)
        isDraggingRef.current = false

        if (timestampsBarRef.current) {
            const currentIndex = getIndexFromTranslateX(currentTranslateX.current)
            const snapTranslateX = getTranslateXForIndex(currentIndex)
            currentTranslateX.current = snapTranslateX
            timestampsBarRef.current.style.transform = `translateX(${snapTranslateX}px)`
            onSliderChange(currentIndex)
        }

        if (showTooltip) {
            if (tooltipTimeoutRef.current != null) {
                clearTimeout(tooltipTimeoutRef.current)
            }

            tooltipTimeoutRef.current = window.setTimeout(() => {
                setIsFadingOut(true)
                setTimeout(() => {
                    setShowTooltip(false)
                }, 500)
            }, 500)
        }
    }, [getIndexFromTranslateX, getTranslateXForIndex, onSliderChange, showTooltip, setShowTooltip])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        handleDragStart(e.clientX)

        const handleMouseMove = (e: MouseEvent) => {
            handleDragMove(e.clientX)
        }

        const handleMouseUp = () => {
            handleDragEnd()
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }, [handleDragStart, handleDragMove, handleDragEnd])

    const handleTouchStartNative = useCallback((e: TouchEvent) => {
        if (e.touches.length !== 1) return
        e.preventDefault()
        handleDragStart(e.touches[0].clientX)
    }, [handleDragStart])

    const handleTouchMoveNative = useCallback((e: TouchEvent) => {
        if (e.touches.length !== 1 || !isDraggingRef.current) return
        e.preventDefault()
        handleDragMove(e.touches[0].clientX)
    }, [handleDragMove])

    const handleTouchEndNative = useCallback((e: TouchEvent) => {
        e.preventDefault()
        handleDragEnd()
    }, [handleDragEnd])

    useEffect(() => {
        const container = touchContainerRef.current
        if (!container) return

        container.addEventListener('touchstart', handleTouchStartNative, { passive: false })
        container.addEventListener('touchmove', handleTouchMoveNative, { passive: false })
        container.addEventListener('touchend', handleTouchEndNative, { passive: false })

        return () => {
            container.removeEventListener('touchstart', handleTouchStartNative)
            container.removeEventListener('touchmove', handleTouchMoveNative)
            container.removeEventListener('touchend', handleTouchEndNative)
        }
    }, [handleTouchStartNative, handleTouchMoveNative, handleTouchEndNative])

    const calcTimeout = useCallback(
        (cur: number): number => {
            const base = 500 / playingSpeed
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
        [mapTimestamps.length, onSliderChange, calcTimeout]
    )

    const onButtonPlay = useCallback(() => {
        if (playing.current) {
            stop()

            return
        }

        playing.current = true
        setPlayingButton(true)

        nextStep(index ?? 0)

    }, [index, nextStep, stop])

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
    }, [index, stop, state.timeSkip, mapTimestamps, onSliderChange])

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
    }, [index, mapTimestamps.length, stop, state.timeSkip, mapTimestamps, onSliderChange])

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

    const throttledSetIndex = useThrottle(
        (ix: number) => {
            setIndex(ix)
        },
        50
    )

    useEffect(() => {
        const ts = timestamp

        if (!ts) {
            if (playing.current) {
                stop()
            }

            return
        }

        const exactMatch = mapTimestamps.findIndex((m: TimestampInfo) => m.timestamp == ts)
        if (exactMatch >= 0) {
            return
        }

        if (mapTimestamps.length > 0) {
            const nearestIndex = findNearestIndex(mapTimestamps as unknown as TimestampRecord[], ts)
            throttledSetIndex(nearestIndex)
        }
    }, [
        timestamp,
        mapTimestamps,
        onChange,
        stop,
        throttledSetIndex,
    ])

    useEffect(() => {
        return () => {
            return stop()
        }
    }, [stop])

    useEffect(() => {
        return () => {
            if (tooltipTimeoutRef.current != null) {
                clearTimeout(tooltipTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (playingButton) {
            stop()
            onButtonPlay()
        }
    }, [playingSpeed])

    useEffect(() => {
        if (!playing.current){
            return
        }
        if (index == null) {
            return
        }

        const next = mapTimestamps[index + 1]
        if (!next){
            return
        }
        if (next?.procent < 100 || !next?.active){

            if (next?.active) {
                setAutoplay(true)
            }

            stop()
        }
    }, [mapTimestamps, index, playing.current, stop])

    const updateIndex = useCallback(() => {
        if (index == null) {
            return
        }
        const currentStep = mapTimestamps[index]
        if (currentStep?.timestamp === timestamp){
            return
        }

        const currentIndex = mapTimestamps.findIndex((m: TimestampInfo) => m.timestamp == timestamp)
        if (currentIndex <= 0){
            return
        }
        setIndex(currentIndex)
    }, [mapTimestamps, index, timestamp])

    useEffect(() => {
        if (playing.current === true){
            return
        }

        updateIndex()
    }, [mapTimestamps, playing.current, updateIndex])

    useEffect(() => {
        if (index || index === 0){
            return
        }

        updateIndex()
    }, [index, mapTimestamps, updateIndex])

    const getElements = useCallback((timestamps: TimestampInfo[], startIndex: number, count: number = 10): TimestampInfo[] => {
        const len = timestamps.length
        const actualCount = Math.min(count, len)

        return Array.from({ length: actualCount }, (_, i) =>
            timestamps[(startIndex + i) % len]
        )
    }, [])

    const getHoursPerDay = useCallback((formattedTimes: (FormattedTime | null)[]) => {
        const dayMap = new Map<string, number>()

        formattedTimes.forEach((fmt) => {
            if (!fmt) return

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

        const nextSteps = getElements(mapTimestamps, index + 1, 10)
        if (nextSteps.length && nextSteps.every((step) => step?.active && step?.procent >= 100)) {
            onButtonPlay()
            setAutoplay(false)
        }
    }, [mapTimestamps, index, onButtonPlay, autoplay, getElements])

    const timestampInfo = useMemo(() => {
        if (timestamp == null) return null
        const locale = (language as SupportedLocale) || "en"
        return formatTime(timestamp * 1000, locale, timezone ?? 'UTC', utcTimezone)
    }, [timestamp, language, timezone, utcTimezone])

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

            const dayKey = `${cur.dayMonth}-${cur.month}-${cur.dayWeek}`
            const dayMap = getHoursPerDay(formattedTimestamps)
            const hoursInCurrentDay = dayMap.get(dayKey) || 0

            if (hoursInCurrentDay < 10) {
                return { subtitle: true }
            }

            return { subtitle: `${cur.hour}:${cur.minute}` }
        },
        [formattedTimestamps, marksType, getHoursPerDay]
    )

    const renderMarksHandler = useCallback((props: MarkProps) => {
        const { subtitle, titleSM, titleMD } = markStep(typeof props.key === 'number' ? props.key : parseInt(String(props.key))) || {}

        return (
            <div
                className={twMerge(
                        'ip:absolute ip:z-0 ip:border-l ip:border-dark/50 ip:dark:border-white/50 ip:top-2 ip:left-2.5 ip:h-7 ip:md:h-8',
                        subtitle ? 'ip:opacity-30' : '',
                    )}>
                <div className={twMerge('ip:dark:text-white ip:text-center', ['ip:text-xs ip:md:text-sm ip:pl-0.5 ip:pt-2'])}>
                    <div className="ip:font-light ip:relative">
                        <div className={twMerge('ip:text-2xs ip:sm:text-xs')}>
                            {titleMD}
                        </div>
                    </div>
                    <span className="ip:inline ip:font-base ip:text-4xs">
                        {subtitle}
                    </span>
                </div>
            </div>
        )
    }, [markStep])

    return (
        <div
            ref={mainDivRef}
            tabIndex={0}
            className={twMerge('ip:outline-none ip:focus:outline-none ip:select-none ip:pointer-events-auto ip:bg-white/80 ip:dark:bg-dark/80 ip:backdrop-blur-md ip:w-full ip:transition-all ip:duration-1000 ip:relative', [className, index != null && timestamp != null && weatherContext.elementInfo?.live !== true ? 'ip:max-h-screen' : 'ip:max-h-0'])}
        >
            {(index != null && timestamp != null && mapTimestamps.length > 1) ?
                <div
                    ref={touchContainerRef}
                    className='ip:flex ip:gap-3'
                    style={{ touchAction: 'none' }}
                    onWheel={onWheel}
                    onMouseDown={handleMouseDown}
                >
                    <div className={twMerge('ip:grow ip:relative')}>
                        <div className={twMerge("ip:absolute ip:top-0 ip:right-0 ip:text-3xs ip:text-center ip:text-gray-500 ip:font-light ip:dark:text-white ip:nowrap ip:flex ip:gap-1 ip:sm:hidden ip:sm:font-normal ip:p-2")}>
                            <span>{timestampInfo?.dayWeek} </span>
                            <span>{timestampInfo?.dayMonth} </span>
                            <span>{timestampInfo?.month} </span>
                            <span className="ip:font-medium">{timestampInfo?.hour}:{timestampInfo?.minute} </span>
                        </div>
                        <div className={twMerge('ip:relative ip:mt-6')}>
                            <div ref={containerRef} className="ip:relative ip:w-full ip:min-h-9">
                                <div className="ip:absolute ip:inset-0">
                                    <div
                                        ref={timestampsBarRef}
                                        className={twMerge(
                                            'ip:flex ip:relative ip:shadow-lg ip:rounded-full',
                                            isDragging ? 'ip:transition-none' : 'ip:transition-transform ip:duration-200 ip:ease-out',
                                            autoplay && !playingButton && 'ip:animate-pulse'
                                        )}
                                        style={{
                                            transform: `translateX(${currentTranslateX.current}px)`,
                                            cursor: isDragging ? 'grabbing' : 'grab',
                                        }}
                                    >
                                        {showTooltip && (
                                            <div className={twMerge(
                                                "ip:absolute ip:-top-2 ip:-left-[85px] ip:flex ip:items-center ip:gap-1 ip:z-50 ip:sm:hidden ip:text-gray-500 ip:dark:text-white ip:transition-opacity ip:duration-500",
                                                isFadingOut ? "ip:opacity-0" : "ip:opacity-100"
                                            )}>
                                                <IpSwipeGestureIcon className={twMerge('ip:size-6 ip:animate-jiggle')} />
                                                <span className="ip:text-2xs ip:text-center ip:font-light ">
                                                    <span className="ip:font-medium ip:italic">Swipe</span>
                                                </span>
                                            </div>
                                        )}
                                        {(mapTimestamps).map((ts: TimestampInfo, idx: number) => (
                                            <div key={`${ts.timestamp}-${idx}`}
                                                className={
                                                    twMerge(
                                                        "ip:relative ip:flex-1 ip:min-w-[10px] ip:h-2 ip:w-full",
                                                        idx == 0 && 'ip:w-3 ip:min-w-3 ip:-ml-3 ip:rounded-l-full',
                                                        idx === mapTimestamps.length - 1 && 'ip:w-3 ip:min-w-3 ip:-mr-3 ip:rounded-r-full',
                                                        ts.loaded && 'ip:bg-primary/75',
                                                        !ts.loaded && 'ip:bg-yellow-400/75',
                                                        !ts.active && 'ip:bg-red-500/75',
                                                    )}>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    className="ip:absolute ip:inset-0 ip:pointer-events-none ip:overflow-visible"
                                    style={{ height: '0.5rem' }}
                                >
                                    <div
                                        className={twMerge(
                                            'ip:flex ip:h-2 ip:relative',
                                            isDragging ? 'ip:transition-none' : 'ip:transition-transform ip:duration-200 ip:ease-out',
                                        )}
                                        style={{
                                            transform: `translateX(${currentTranslateX.current}px)`,
                                        }}
                                    >
                                        {(mapTimestamps).map((ts: TimestampInfo, idx: number) => (
                                            <div
                                                key={ts.timestamp}
                                                className="ip:relative ip:flex-1 ip:min-w-[10px]"
                                            >
                                                {((marksType === 'days' && marksDays.includes(idx)) ||
                                                  (marksType === 'hours' && marksHours.includes(idx))) && (
                                                    <div
                                                        className="ip:absolute ip:top-0 ip:left-1/2 ip:z-10"
                                                        style={{ transform: 'translateX(-0.625rem)' }}
                                                    >
                                                        {renderMarksHandler({ key: idx } as MarkProps)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                : null
            }
            {(index != null && timestamp != null && mapTimestamps.length > 1) && (
                <div className={twMerge('ip:absolute ip:left-1/2 ip:top-4 ip:-translate-x-1/2 ip:-translate-y-1/2 ip:z-40 ip:pointer-events-none ip:mt-3')}>
                    <button
                        disabled={disablePlayButton}
                        type="button"
                        onClick={onButtonPlay}
                        onTouchStart={(e) => {
                            e.stopPropagation()
                        }}
                        onTouchEnd={(e) => {
                            e.stopPropagation()
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation()
                        }}
                        className={
                            twMerge(
                                'ip:cursor-pointer ip:size-12 ip:flex ip:place-items-center ip:place-content-center ip:rounded-full ip:pointer-events-auto ip:shadow-lg',
                                'ip:border-[3px] ip:border-white ip:dark:border-white',
                                [
                                    playingButton ? 'ip:bg-white ip:text-primary ip:border-[3px] ip:border-primary' : 'ip:bg-primary ip:text-white',
                                    disablePlayButton ? 'ip:cursor-not-allowed ip:bg-gray-200' : '',
                                    autoplay ? 'ip:cursor-not-allowed ip:bg-primary' : '',
                                ]
                            )} >

                        {isDragging && !playingButton && !autoplay && (
                            <IpScrollIcon className={twMerge('ip:size-9 ip:animate-pulse')} />
                        )}

                        {playingButton &&(
                            <IpPause className={twMerge('ip:size-8')} />
                        )}

                        {!playingButton && !autoplay && !isDragging && (
                            <IpPlay className={twMerge('ip:size-8')} />
                        )}

                        {autoplay && !playingButton && (
                            <IpLoadingSpinner className={twMerge('ip:size-9')} />
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
