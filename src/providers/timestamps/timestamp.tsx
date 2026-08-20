/**
 * Map index context: provides current map index for multi-map support.
 * Timestamp state lives in Redux; use TimestampProvider and useTimestampMap from @/components/_webgl/redux/timestamp.
 */

import React, { createContext, useContext } from 'react'

const MapIndexContext = createContext<number>(0)

export const MapIndexProvider = MapIndexContext.Provider

export function useMapIndex(): number {
    return useContext(MapIndexContext)
}
