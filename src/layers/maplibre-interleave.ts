import type { Map as MapLibreMap } from 'maplibre-gl'

/**
 * Private MapLibre / deck.gl interleaving patches.
 * Verified against maplibre-gl ^6.9 and @deck.gl/maplibre ^9.4.
 * Re-check these hooks when bumping either package.
 */

export type DeckDrawLayersOptions = {
    viewports?: Array<{ id?: string }>
    clearStack?: boolean
    clearCanvas?: boolean
}

export type DeckInternal = {
    userData?: Record<string, unknown>
    device?: { gl?: WebGLRenderingContext }
    props?: {
        onBeforeRender?: (opts: { device?: unknown; gl?: unknown }) => void
        onAfterRender?: (opts: { device?: unknown; gl?: unknown }) => void
    }
    _drawLayers?: (reason: string, opts?: DeckDrawLayersOptions) => void
}

type MapLibreUniformBuffer = {
    upload?: () => void
}

type MapLibrePainterContext = {
    setDirty?: () => void
    frameUniformBuffer?: MapLibreUniformBuffer
    projectionUniformBuffer?: MapLibreUniformBuffer
    terrainUniformBuffer?: MapLibreUniformBuffer
    __platformUboRebind?: boolean
}

/**
 * setDirty marks UBO bindingDirty, but FrameUBO is only upload()'d at frame start.
 * Deck/luma rebinds slots 0–2; MapLibre draw_custom already calls setDirty after
 * custom layers — wrapping it to upload() restores the correct bindBufferBase.
 */
export const installUniformBufferRebind = (map: MapLibreMap) => {
    const context = (map as { painter?: { context?: MapLibrePainterContext } }).painter?.context
    if (!context || context.__platformUboRebind) {
        return
    }

    const originalSetDirty = context.setDirty?.bind(context)
    if (!originalSetDirty) {
        return
    }

    context.setDirty = () => {
        originalSetDirty()
        context.frameUniformBuffer?.upload?.()
        context.projectionUniformBuffer?.upload?.()
        context.terrainUniformBuffer?.upload?.()
    }
    context.__platformUboRebind = true
}

/**
 * MapLibreOverlay may redraw deck after the basemap finishes; that paints weather
 * above borders/labels. Group draws always pass `clearStack`.
 */
export const installAfterPassGuard = (deck: DeckInternal) => {
    if (!deck._drawLayers || deck.userData?.__afterPassGuarded) {
        return
    }

    const originalDrawLayers = deck._drawLayers.bind(deck)
    deck._drawLayers = (reason, opts = {}) => {
        const isAfterMapLibrePass =
            reason === 'maplibre-repaint' &&
            opts.clearCanvas === false &&
            !Object.prototype.hasOwnProperty.call(opts, 'clearStack')

        if (isAfterMapLibrePass) {
            if (deck.userData) {
                deck.userData.currentViewport = null
            }
            const device = deck.device
            const gl = device?.gl
            deck.props?.onBeforeRender?.({ device, gl })
            deck.props?.onAfterRender?.({ device, gl })
            return
        }

        return originalDrawLayers(reason, opts)
    }

    if (!deck.userData) {
        deck.userData = {}
    }
    deck.userData.__afterPassGuarded = true
}

/**
 * Prefer getLayer only — isStyleLoaded() can lag and force a "last" group
 * (weather above labels) for remote basemap styles.
 */
export const resolveBeforeId = (
    map: MapLibreMap | undefined,
    interleaved: boolean,
    beforeId: string | undefined,
): string | undefined => {
    if (!map || !interleaved || !beforeId) {
        return undefined
    }
    return map.getLayer(beforeId) ? beforeId : undefined
}

export const getMapLibreMap = (
    mapRef: { getMap?: () => MapLibreMap } | MapLibreMap | null | undefined,
): MapLibreMap | undefined => {
    if (!mapRef) {
        return undefined
    }
    if (typeof (mapRef as { getMap?: () => MapLibreMap }).getMap === 'function') {
        return (mapRef as { getMap: () => MapLibreMap }).getMap()
    }
    return mapRef as MapLibreMap
}
