import React, { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useStorageState } from '@/src/utilities/storageState'

export interface DisplaySettingsState {
    advanceLayerSettings: boolean
    frameSkip: boolean
}

export interface DisplaySettingsContextValue {
    advanceLayerSettings: boolean
    setAdvanceLayerSettings: (value: boolean) => void
    frameSkip: boolean
    setFrameSkip: (value: boolean) => void
    state: DisplaySettingsState
}

const DisplaySettingsContext = createContext<DisplaySettingsContextValue | null>(null)

export function DisplaySettingsProvider({ children }: { children: ReactNode }) {
    const [advanceLayerSettings, setAdvanceLayerSettings] = useStorageState('setting-layers-advance-settings', false)
    const [frameSkip, setFrameSkip] = useStorageState('setting-layers-frame-skip', false)

    const value = useMemo<DisplaySettingsContextValue>(() => ({
        advanceLayerSettings,
        setAdvanceLayerSettings,
        frameSkip,
        setFrameSkip,
        state: { advanceLayerSettings, frameSkip },
    }), [advanceLayerSettings, setAdvanceLayerSettings, frameSkip, setFrameSkip])

    return (
        <DisplaySettingsContext.Provider value={value}>
            {children}
        </DisplaySettingsContext.Provider>
    )
}

export function useDisplaySettings(): DisplaySettingsContextValue {
    const context = useContext(DisplaySettingsContext)
    if (!context) {
        throw new Error('useDisplaySettings must be used within a DisplaySettingsProvider')
    }
    return context
}
