import type { TimestampInfo } from '@/@types/weather.types'

export function getPreloadProgress(timestamps: TimestampInfo[]) {
    const active = timestamps.filter((ts) => ts.active)
    const loaded = active.filter((ts) => ts.loaded).length

    return {
        loaded,
        total: active.length,
        isPreloading: active.length > 0 && loaded < active.length,
    }
}
