import { useEffect, useLayoutEffect, useMemo, useReducer } from 'react'
import { useControl, useMap } from 'react-map-gl/maplibre'
import { MapLibreOverlay as DeckOverlay } from '@deck.gl/maplibre'
import type { Layer } from '@deck.gl/core'
import { DECK_DEVICE_PROPS, STYLE_EPOCH_DEBOUNCE_MS } from './constants'
import {
    getMapLibreMap,
    installAfterPassGuard,
    installUniformBufferRebind,
    resolveBeforeId,
    type DeckInternal,
} from './maplibre-interleave'

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

type DeckOverlayInternal = {
    setProps: (props: Record<string, unknown>) => void
    _deck?: DeckInternal
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
    // Increments on every basemap `style.load` so deck re-creates custom layers
    // against the new style. Needed when the new beforeId already existed on the
    // previous style (e.g. landcover on remote → marine): resolveBeforeId never
    // goes undefined, and React would otherwise keep Layer instances bound to the
    // old basemap until something else rebuilds layers (e.g. timeline play).
    const [styleLoadGeneration, bumpStyleLoadGeneration] = useReducer(
        (value: number) => value + 1,
        0,
    )

    const resolvedBeforeId = resolveBeforeId(map, Boolean(interleaved), beforeId)

    useLayoutEffect(() => {
        if (!map || !interleaved) {
            return
        }
        installUniformBufferRebind(map)
    }, [map, interleaved])

    useEffect(() => {
        if (!map || !interleaved) {
            return
        }

        const onStyleLoad = () => {
            installUniformBufferRebind(map)
            bumpStyleLoadGeneration()
            bumpStyleEpoch()
        }

        map.on('style.load', onStyleLoad)
        return () => {
            map.off('style.load', onStyleLoad)
        }
    }, [map, interleaved])

    useEffect(() => {
        if (!map || !interleaved) {
            return
        }
        installUniformBufferRebind(map)
        let debounceId: ReturnType<typeof setTimeout> | undefined
        const onStyleLifecycle = () => {
            installUniformBufferRebind(map)
            clearTimeout(debounceId)
            debounceId = setTimeout(() => {
                bumpStyleEpoch()
            }, STYLE_EPOCH_DEBOUNCE_MS)
        }
        map.on('styledata', onStyleLifecycle)
        map.on('idle', onStyleLifecycle)
        return () => {
            clearTimeout(debounceId)
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
        // and paints weather above borders/labels. Prefer a brief blank over wrong order.
        if (!resolvedBeforeId) {
            return []
        }

        // Always clone with the resolved anchor. Reusing instances when
        // props.beforeId already matches leaves deck holding layers bound to the
        // previous basemap after setStyle (non-marine → marine via shared landcover).
        return list.map((layer) => {
            const typed = layer as LayerWithBeforeId
            return typed.clone({ beforeId: resolvedBeforeId })
        })
    }, [layers, interleaved, resolvedBeforeId, styleLoadGeneration])

    overlay.setProps({
        ...rest,
        controller: false,
        layers: normalizedLayers,
        deviceProps: {
            ...deviceProps,
            ...DECK_DEVICE_PROPS,
        },
    })

    useLayoutEffect(() => {
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
