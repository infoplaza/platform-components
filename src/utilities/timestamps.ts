import { isEmpty } from "lodash"

export interface TimestampRecord {
    /** Unix seconds */
    timestamp: number
    index?: number
    loaded?: boolean
    active?: boolean
}

/** Find index of the nearest timestamp to target in an array of timestamp records. */
export function findNearestIndex(records: TimestampRecord[], targetTs: number): number {
    if (!records.length) return -1
    let nearest = 0
    let nearestDiff = Math.abs(records[0].timestamp - targetTs)
    for (let i = 1; i < records.length; i++) {
        const diff = Math.abs(records[i].timestamp - targetTs)
        if (diff < nearestDiff) {
            nearest = i
            nearestDiff = diff
        }
    }
    return nearest
}

/** Layer shape used when intersecting API `layers[].timestamp` across map layers. */
export type LayerWithTimestampData = {
    data?: { layers?: Array<{ timestamp?: number }> } | null
}

/** Intersection of timestamp lists from every layer that has loaded `data`. */
export function computeIntersectionTimestamps(timestamps: number[][]): number[] {
    let newTimestamps: number[] = []
    for (const timestamp of timestamps) {
        if (!isEmpty(timestamp)) {
            if (newTimestamps.length === 0) {
                newTimestamps.push(...timestamp)
            } else {
                newTimestamps = newTimestamps.filter((t) => timestamp.includes(t))
            }
        }
    }
    return newTimestamps
}

/**
 * Keeps the current timestamp when it remains in the intersection, unless `live`
 * or the current value is missing — then picks the timestamp closest to now.
 */
export function pickTimestampForLayers(
    newTimestamps: number[],
    currentTimestamp: number | null,
    live: boolean | undefined
): number | undefined {
    let newTimestamp = newTimestamps.find((t) => t === currentTimestamp) ?? undefined
    if (newTimestamps.length > 0 && (newTimestamp == null || live === true)) {
        newTimestamp = newTimestamps.reduce((a, b) => {
            return Math.abs(b * 1000 - Date.now()) < Math.abs(a * 1000 - Date.now()) ? b : a
        })
    }
    return newTimestamp
}

export type ResolvedTimestamps = {
    timestamps: number[]
    timestamp: number | undefined
}

/**
 * Derives the full timestamp state from the current map layers:
 * computes the intersection of all layer timestamps, then picks the
 * best active timestamp given the current selection and live mode.
 */
export function resolveTimestampsFromLayers(
    timestamps: number[][],
    currentTimestamp: number | null,
    live: boolean | undefined
): ResolvedTimestamps {
    const resolvedTimestamps = computeIntersectionTimestamps(timestamps)
    const timestamp = pickTimestampForLayers(resolvedTimestamps, currentTimestamp, live)
    return { timestamps: resolvedTimestamps, timestamp }
}
