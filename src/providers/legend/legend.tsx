import React, { createContext, useContext, useMemo, useState } from 'react'

import type { LegendInfo } from '@/src/utilities/legends'
export { getLegendsFromLayers } from '@/src/utilities/legends'

export interface LegendValuesContextValue {
    legends: LegendInfo[]
    setLegends: React.Dispatch<React.SetStateAction<LegendInfo[]>>
}

export const LegendValuesContext = createContext<LegendValuesContextValue | null>(null)

export function LegendValuesProvider({ children }: { children: React.ReactNode }) {
    const [legends, setLegends] = useState<LegendInfo[]>([])

    const value = useMemo(() => ({
        legends,
        setLegends,
    }), [legends])

    return (
        <LegendValuesContext.Provider value={value}>
            {children}
        </LegendValuesContext.Provider>
    )
}

export function useLegendValues(): LegendValuesContextValue {
    const context = useContext(LegendValuesContext)
    if (!context) {
        throw new Error('useLegendValues must be used within a LegendValuesProvider')
    }

    return context
}
