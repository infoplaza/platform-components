import { createSelector } from '@reduxjs/toolkit'
import type { TimestampMapState, TimestampState } from './slices'
import { getMapState } from './slices'

// Minimal state shape so this file doesn't depend on the store (avoids circular deps).
export type TimestampRootState = { timestamp: TimestampState }

const selectTimestampRoot = (state: TimestampRootState) => state.timestamp

export const selectTimestampState = (mapIndex: number) =>
    createSelector(
        [selectTimestampRoot],
        (root): TimestampMapState => getMapState(root, mapIndex)
    )

export const selectTimestamp = (mapIndex: number) =>
    createSelector(
        [selectTimestampRoot],
        (root) => getMapState(root, mapIndex).timestamp
    )

export const selectTimestamps = (mapIndex: number) =>
    createSelector(
        [selectTimestampRoot],
        (root) => getMapState(root, mapIndex).timestamps
    )

export const selectPreloadedData = (mapIndex: number) =>
    createSelector(
        [selectTimestampRoot],
        (root) => getMapState(root, mapIndex).preloadedData
    )

export const selectTimebarPlaying = (mapIndex: number) =>
    createSelector(
        [selectTimestampRoot],
        (root) => getMapState(root, mapIndex).timebarPlaying ?? false
    )
