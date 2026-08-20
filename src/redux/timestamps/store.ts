/**
 * Redux store for _webgl (timestamp and future slices).
 * Used by the map widget tree; wrap with Provider in map.tsx.
 */

import { configureStore } from '@reduxjs/toolkit'
import { timestampSlice } from './slices'

export const store = configureStore({
    reducer: {
        timestamp: timestampSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
