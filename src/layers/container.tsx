import { useEffect, useMemo, useReducer, useRef } from 'react'
import { useControl, useMap } from 'react-map-gl/maplibre'
import { MapLibreOverlay as DeckOverlay } from '@deck.gl/maplibre'
import type { Layer } from '@deck.gl/core'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { DECK_DEVICE_PROPS } from './constants'

type DeckGLOverlayProps = {
    layers?: Layer[] | null
    interleaved?: boolean
    beforeId?: string
    deviceProps?: Record<string, unknown>
    [key: string]: unknown
}

type LayerWithBeforeId = Layer & {
    props: Layer['props'] & { beforeId?: string }
    clone: (props: Record<string, unknown>) => Layer
}

type DeckDrawLayersOptions = {
    viewports?: Array<{ id?: string }>
    clearStack?: boolean
    clearCanvas?: boolean
}

type DeckInternal = {
    userData?: Record<string, unknown>
    device?: { gl?: WebGLRenderingContext }
    props?: {
        onBeforeRender?: (opts: { device?: unknown; gl?: unknown }) => void
        onAfterRender?: (opts: { device?: unknown; gl?: unknown }) => void
    }
    _drawLayers?: (reason: string, opts?: DeckDrawLayersOptions) => void
}

type DeckOverlayInternal = {
    setProps: (props: Record<string, unknown>) => void
    _deck?: DeckInternal
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

const getMapLibreMap = (
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

/**
 * setDirty marks UBO bindingDirty, but FrameUBO is only upload()'d at frame start.
 * Deck/luma rebinds slots 0–2; MapLibre draw_custom already calls setDirty after
 * custom layers — wrapping it to upload() restores the correct bindBufferBase.
 */
const installUniformBufferRebind = (map: MapLibreMap) => {
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
const installAfterPassGuard = (deck: DeckInternal) => {
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

const resolveBeforeId = (
    map: MapLibreMap | undefined,
    interleaved: boolean,
    beforeId: string | undefined,
): string | undefined => {
    if (!map || !interleaved || !beforeId) {
        return undefined
    }
    // Prefer getLayer only — isStyleLoaded() can lag and force a "last" group
    // (weather above labels) for remote basemap styles.
    return map.getLayer(beforeId) ? beforeId : undefined
}

function DeckGLOverlay({
    layers = [],
    interleaved = true,
    beforeId,
    deviceProps,
    ...rest
}: DeckGLOverlayProps) {
    const maps = useMap()
    const map = getMapLibreMap(maps.current)
    const [, bumpStyleEpoch] = useReducer((value: number) => value + 1, 0)
    const previousResolvedBeforeIdRef = useRef<string | undefined>(undefined)

    // Synchronous: never stamp a beforeId that is missing mid style-switch.
    const resolvedBeforeId = resolveBeforeId(map, Boolean(interleaved), beforeId)
    const anchorRecovered =
        previousResolvedBeforeIdRef.current === undefined &&
        typeof resolvedBeforeId === 'string'

    useEffect(() => {
        previousResolvedBeforeIdRef.current = resolvedBeforeId
    }, [resolvedBeforeId])

    if (map && interleaved) {
        installUniformBufferRebind(map)
    }

    useEffect(() => {
        if (!map || !interleaved) {
            return
        }
        installUniformBufferRebind(map)
        const onStyleLifecycle = () => {
            installUniformBufferRebind(map)
            bumpStyleEpoch()
        }
        map.on('styledata', onStyleLifecycle)
        map.on('idle', onStyleLifecycle)
        return () => {
            map.off('styledata', onStyleLifecycle)
            map.off('idle', onStyleLifecycle)
        }
    }, [map, interleaved])

    const overlay = useControl(
        () =>
            new DeckOverlay({
                interleaved: Boolean(interleaved),
                deviceProps: {
                    ...deviceProps,
                    ...DECK_DEVICE_PROPS,
                },
            }),
    ) as unknown as DeckOverlayInternal

    const normalizedLayers = useMemo(() => {
        const list = (layers ?? []).filter(Boolean) as Layer[]
        if (!interleaved || list.length === 0) {
            return list
        }

        // Never stamp beforeId: undefined — that becomes deck-maplibre-layer-group-last
        // and paints weather above borders/labels. Wait until the basemap anchor exists.
        if (!resolvedBeforeId) {
            return []
        }

        // When the anchor recovers after setStyle, force new layer instances so deck
        // re-resolves custom-layer groups even if beforeId props already match.
        return list.map((layer) => {
            const typed = layer as LayerWithBeforeId
            if (!anchorRecovered && typed.props.beforeId === resolvedBeforeId) {
                return layer
            }
            return typed.clone({ beforeId: resolvedBeforeId })
        })
    }, [layers, interleaved, resolvedBeforeId, anchorRecovered])

    overlay.setProps({
        ...rest,
        controller: false,
        layers: normalizedLayers,
        deviceProps: {
            ...deviceProps,
            ...DECK_DEVICE_PROPS,
        },
    })

    if (interleaved && overlay._deck) {
        installAfterPassGuard(overlay._deck)
    }

    useEffect(() => {
        if (!interleaved) {
            return
        }
        const deck = overlay._deck
        if (deck) {
            installAfterPassGuard(deck)
        }
    }, [overlay, interleaved, normalizedLayers])

    return null
}

export default DeckGLOverlay
