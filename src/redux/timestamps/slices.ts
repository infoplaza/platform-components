import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// --- Per-map state (serializable only; no mapLayers - derived in component from weather context) ---
export interface TimestampMapState {
    timestamp: number | null
    timestamps: number[] | null
    preloadedData: string[]
    /** True while the timebar is playing (manual or autoplay) — used to tune texture prefetch. */
    timebarPlaying: boolean
}

const initialMapState: TimestampMapState = {
    timestamp: null,
    timestamps: null,
    preloadedData: [],
    timebarPlaying: false,
}

// --- Slice state: keyed by map index for multi-map support ---
export interface TimestampState {
    byMap: Record<number, TimestampMapState>
}

const initialState: TimestampState = {
    byMap: {},
}

export function getMapState(
    state: TimestampState,
    mapIndex: number
): TimestampMapState {
    if (!state.byMap[mapIndex]) {
        return { ...initialMapState }
    }
    return state.byMap[mapIndex]
}

export const timestampSlice = createSlice({
    name: 'timestamp',
    initialState,
    reducers: {
        setTimestamp: (
            state,
            action: PayloadAction<{ mapIndex: number; timestamp: number }>
        ) => {
            const { mapIndex, timestamp } = action.payload
            if (!state.byMap[mapIndex]) state.byMap[mapIndex] = { ...initialMapState }
            if (state.byMap[mapIndex].timestamp !== timestamp) {
                state.byMap[mapIndex].timestamp = timestamp
            }
        },
        setTimestamps: (
            state,
            action: PayloadAction<{ mapIndex: number; timestamps: number[] | null }>
        ) => {
            const { mapIndex, timestamps } = action.payload
            if (!state.byMap[mapIndex]) state.byMap[mapIndex] = { ...initialMapState }
            state.byMap[mapIndex].timestamps = timestamps
        },
        setPreloadedData: (
            state,
            action: PayloadAction<{ mapIndex: number; data: string[] }>
        ) => {
            const { mapIndex, data } = action.payload
            if (!state.byMap[mapIndex]) state.byMap[mapIndex] = { ...initialMapState }
            state.byMap[mapIndex].preloadedData = data
        },
        setPreloadedDataUpdater: (
            state,
            action: PayloadAction<{
                mapIndex: number
                updater: (prev: string[]) => string[]
            }>
        ) => {
            const { mapIndex, updater } = action.payload
            if (!state.byMap[mapIndex]) state.byMap[mapIndex] = { ...initialMapState }
            state.byMap[mapIndex].preloadedData = updater(
                state.byMap[mapIndex].preloadedData
            )
        },
        addUrlToPreload: (
            state,
            action: PayloadAction<{ mapIndex: number; url: string }>
        ) => {
            const { mapIndex, url } = action.payload
            if (!url) return
            if (!state.byMap[mapIndex]) state.byMap[mapIndex] = { ...initialMapState }
            const prev = state.byMap[mapIndex].preloadedData
            if (!prev.includes(url)) {
                state.byMap[mapIndex].preloadedData = [...prev, url]
            }
        },
        setTimebarPlaying: (
            state,
            action: PayloadAction<{ mapIndex: number; playing: boolean }>
        ) => {
            const { mapIndex, playing } = action.payload
            if (!state.byMap[mapIndex]) state.byMap[mapIndex] = { ...initialMapState }
            state.byMap[mapIndex].timebarPlaying = playing
        },
    },
})

export const {
    setTimestamp,
    setTimestamps,
    setPreloadedData,
    setPreloadedDataUpdater,
    addUrlToPreload,
    setTimebarPlaying,
} = timestampSlice.actions
