import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// ** Redux */
import type { AppDispatch, RootState } from '@/src/redux/timestamps/store'
import { timestampSlice } from '@/src/redux/timestamps/slices'
import { selectTimestamp, selectTimestamps, selectPreloadedData, selectTimebarPlaying } from '@/src/redux/timestamps/selectors'

// ** Utilities */
import { aggregateMapLayers, buildTimestampsInfo } from '@/src/providers/weather/utils'
import type { TimestampInfo } from '@/@types/weather.types'
import { useWeatherMap } from '@/src/providers/weather/weather'
import { useMapIndex } from '@/src/providers/timestamps/timestamp'
// import { Experimental_MapWeatherContainerContext } from '@/context/_experimental/map/weather_container'
// import { useThrottle } from '@/hooks/trottle'

const { setTimestamp: setTimestampAction, setTimestamps: setTimestampsAction, setPreloadedData: setPreloadedDataAction, setPreloadedDataUpdater, addUrlToPreload: addUrlToPreloadAction } = timestampSlice.actions

export interface TimestampContextValue {
    timestamp: number | null
    timestamps: number[] | null
    preloadedData: string[]
    setTimestamp: (timestamp: number) => void
    setTimestamps: (timestamps: number[] | null) => void
    setPreloadedData: React.Dispatch<React.SetStateAction<string[]>>
    timestampsInfo: TimestampInfo[]
    addUrlToPreload: (url: string) => void
    timebarPlaying: boolean
}

export const TimestampContext = createContext<TimestampContextValue | null>(null)


export const TimestampProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const mapIndex = useMapIndex()
    const dispatch = useDispatch<AppDispatch>()
    const { mapState } = useWeatherMap()
    // /** Optional: when absent (no layout provider), per-map Redux timestamps behave as before. */
    // const { setTimestamp: setMergedTimestamp, mergeTimebars, timestamp: mergedTimestamp } = useContext(Experimental_MapWeatherContainerContext)

    const timestamp = useSelector((s: RootState) =>
        selectTimestamp(mapIndex)(s)
    )
    const timestamps = useSelector((s: RootState) =>
        selectTimestamps(mapIndex)(s)
    )
    const preloadedData = useSelector((s: RootState) =>
        selectPreloadedData(mapIndex)(s)
    )
    const timebarPlaying = useSelector((s: RootState) =>
        selectTimebarPlaying(mapIndex)(s)
    )

    const timestampsInfo = useMemo((): TimestampInfo[] => {
        const aggregated = aggregateMapLayers(mapState?.layers)
        return buildTimestampsInfo(aggregated, preloadedData)
    }, [mapState?.layers, preloadedData])

    // const publishMergedTimestamp = useThrottle(
    //     useCallback(
    //         (ts: number) => {
    //             setMergedTimestamp(ts)
    //         },
    //         [setMergedTimestamp]
    //     ),
    //     50
    // )

    const setTimestamp = useCallback(
        (ts: number) => {
            if (!ts) return
            dispatch(setTimestampAction({ mapIndex, timestamp: ts }))
            // publishMergedTimestamp(ts)
        },
        [dispatch, mapIndex]
    )

    // When merge timebars is on, apply shared container time to this map if it exists in this map's series
    // (mirrors context/_experimental/map/weather.js)
    // useEffect(() => {
    //     if (!mergeTimebars) {
    //         return
    //     }

    //     const shared = mergedTimestamp
    //     if (
    //         shared != null &&
    //         shared !== timestamp &&
    //         timestamps?.includes(shared)
    //     ) {
    //         dispatch(setTimestampAction({ mapIndex, timestamp: mergedTimestamp }))
    //     }
    // }, [mergeTimebars, mergedTimestamp, dispatch, mapIndex, timestamp, timestamps])

    const setTimestamps = useCallback(
        (tss: number[] | null) => {
            dispatch(setTimestampsAction({ mapIndex, timestamps: tss }))
        },
        [dispatch, mapIndex]
    )

    const setPreloadedData = useCallback(
        (value: React.SetStateAction<string[]>) => {
            if (typeof value === 'function') {
                dispatch(
                    setPreloadedDataUpdater({
                        mapIndex,
                        updater: value,
                    })
                )
            } else {
                dispatch(
                    setPreloadedDataAction({
                        mapIndex,
                        data: value,
                    })
                )
            }
        },
        [dispatch, mapIndex]
    )

    const addUrlToPreload = useCallback(
        (url: string) => {
            if (!url) return
            dispatch(addUrlToPreloadAction({ mapIndex, url }))
        },
        [dispatch, mapIndex]
    )

    const value = useMemo<TimestampContextValue>(
        () => ({
            timestamp,
            timestamps,
            preloadedData,
            setTimestamp,
            setTimestamps,
            setPreloadedData,
            timestampsInfo,
            addUrlToPreload,
            timebarPlaying,
        }),
        [
            timestamp,
            timestamps,
            preloadedData,
            setTimestamp,
            setTimestamps,
            setPreloadedData,
            timestampsInfo,
            addUrlToPreload,
            timebarPlaying,
        ]
    )

    return (
        <TimestampContext.Provider value={value}>
            {children}
        </TimestampContext.Provider>
    )
}

/**
 * Hook to access timestamp state (Redux behind Context). Use within TimestampProvider (and thus MapIndexProvider + Redux Provider).
 */
export function useTimestampMap(): TimestampContextValue {
    const context = useContext(TimestampContext)
    if (!context) {
        throw new Error(
            'useTimestampMap must be used within a TimestampProvider (inside Redux Provider and MapIndexProvider)'
        )
    }
    return context
}
