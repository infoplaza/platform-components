import { useControl } from 'react-map-gl/maplibre'
import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox'
import { useCallback } from 'react'
// import { useMetricsPush, type DeckMetrics } from '@/components/_webgl/controls/metrics/context'
// import { useSettings } from '@/context/settings'

const METRICS_INTERVAL_MS = 2000

function DeckGLOverlay(props: any) {
    // const pushMetrics = useMetricsPush()
    // const { showMetrics } = useSettings()

    // const onMetrics = useCallback((raw: Record<string, number>) => {
    //     if (!showMetrics) return
    //     const m: DeckMetrics = {
    //         fps: raw.fps ?? 0,
    //         cpuTime: raw.cpuTime ?? 0,
    //         cpuTimePerFrame: raw.cpuTimePerFrame ?? 0,
    //         gpuTime: raw.gpuTime ?? 0,
    //         gpuTimePerFrame: raw.gpuTimePerFrame ?? 0,
    //         framesRedrawn: raw.framesRedrawn ?? 0,
    //         setPropsTime: raw.setPropsTime ?? 0,
    //         updateAttributesTime: raw.updateAttributesTime ?? 0,
    //         gpuMemory: raw.gpuMemory ?? 0,
    //         bufferMemory: raw.bufferMemory ?? 0,
    //         textureMemory: raw.textureMemory ?? 0,
    //         renderbufferMemory: raw.renderbufferMemory ?? 0,
    //     }
    //     pushMetrics(m)
    // }, [showMetrics, pushMetrics])

    const overlay = useControl(() => new DeckOverlay({
        ...props,
        // _onMetrics: onMetrics,
        // _metricsInterval: METRICS_INTERVAL_MS,
    }))
    overlay.setProps({ ...props })

    return null
}

export default DeckGLOverlay