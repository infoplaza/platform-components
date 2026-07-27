import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useMap } from "react-map-gl/maplibre"
import { isEmpty } from "lodash"

import { useMapLayerTexture } from "@/src/events/texture"
import { useWeatherMap } from "@/src/providers/weather/weather"
import { useLegendValues } from "@/src/providers/legend/legend"
import { useTimestampMap } from "@/src/redux/timestamps/provider"
import { resolveTimestampsFromLayers } from "@/src/utilities/timestamps"
import { getLegendsFromLayers } from "@/src/utilities/legends"
import { useApplyImageSettings } from "@/src/events/helpers/settings"
import {
    buildLayersUrlFromMapBounds,
    type ViewportGetLayersUrlArgs,
} from "@/src/events/helpers/viewport"
import type { EnrichedMapLayer } from "@/@types/weather.types"

const MOVE_DEBOUNCE_MS = 200

type NowcastEventsProviderProps = {
    children: (mapComponents: Record<number, unknown[]>) => ReactNode
}

export default function NowcastEventsProvider({ children }: NowcastEventsProviderProps) {
    const mapContext = useMap()
    const { modelInfo, layersInfo, elementInfo, month, period, setMapState } = useWeatherMap()
    const { setLegends } = useLegendValues()
    const { timestamp, setTimestamps, setTimestamp, setPreloadedData } = useTimestampMap()
    const updateSettings = useApplyImageSettings()

    const [fetchedLayers, setFetchedLayers] = useState<EnrichedMapLayer[]>([])
    const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const abortRef = useRef<AbortController | null>(null)
    const requestIdRef = useRef(0)

    const timestampRef = useRef(timestamp)
    timestampRef.current = timestamp
    const elementInfoRef = useRef(elementInfo)
    elementInfoRef.current = elementInfo
    const setMapStateRef = useRef(setMapState)
    setMapStateRef.current = setMapState
    const setTimestampsRef = useRef(setTimestamps)
    setTimestampsRef.current = setTimestamps
    const setTimestampRef = useRef(setTimestamp)
    setTimestampRef.current = setTimestamp
    const setPreloadedDataRef = useRef(setPreloadedData)
    setPreloadedDataRef.current = setPreloadedData

    const { mapComponents, abortAll: abortTextures } = useMapLayerTexture(fetchedLayers)
    const abortTexturesRef = useRef(abortTextures)
    abortTexturesRef.current = abortTextures

    const createGetLayersUrl = useCallback(
        (layersUrl: string) =>
            (args: ViewportGetLayersUrlArgs & { modelInfo: unknown }) =>
                buildLayersUrlFromMapBounds(layersUrl, args, modelInfo),
        [modelInfo],
    )

    const layerConfigs = useMemo(() => {
        return (layersInfo?.layers ?? [])
            .filter((layer) => layer.active !== false)
            .map((layer): EnrichedMapLayer => {
                const connection = new layer.view.connection({ apiEnv: "prod" })
                const layersApi = connection.server
                const params = connection.resolveParams({
                    layer,
                    modelInfo,
                    layersInfo,
                    month,
                    period,
                })
                const url = connection.resolveTemplateUrl(params)

                return {
                    ...layer,
                    layersApi: layersApi ?? undefined,
                    getLayersUrl: createGetLayersUrl(url),
                    preloading: elementInfo?.preloading ?? true,
                    connection,
                    data: undefined,
                } as EnrichedMapLayer
            })
    }, [
        layersInfo,
        modelInfo,
        createGetLayersUrl,
        elementInfo?.preloading,
        month,
        period,
    ])

    const layerConfigsRef = useRef(layerConfigs)
    layerConfigsRef.current = layerConfigs

    const fetchLayers = useCallback(async () => {
        const configs = layerConfigsRef.current
        const map = mapContext.current
        if (configs.length === 0 || !map) return

        abortRef.current?.abort()
        abortTexturesRef.current()
        const controller = new AbortController()
        const requestId = requestIdRef.current + 1
        requestIdRef.current = requestId
        abortRef.current = controller
        const isCurrentRequest = () =>
            requestIdRef.current === requestId &&
            abortRef.current === controller &&
            !controller.signal.aborted

        const bounds = map.getBounds()
        const zoom = map.getZoom()

        try {
            const results = await Promise.all(
                configs.map(async (layer): Promise<EnrichedMapLayer> => {
                    const layersUrl = layer.getLayersUrl({
                        bounds,
                        zoom,
                        graphicalPreset: 0,
                    })
                    if (isEmpty(layersUrl)) return layer

                    try {
                        const response = await fetch(layersUrl, { signal: controller.signal })
                        if (response.ok) {
                            const data = await response.json()
                            return {
                                ...layer,
                                data,
                                boundingBox: data.boundingbox,
                                layersUrl,
                            }
                        }
                    } catch (error) {
                        if (error instanceof DOMException && error.name === "AbortError") {
                            return layer
                        }
                        const message = error instanceof Error ? error.message : String(error)
                        return {
                            ...layer,
                            data: { layers: [], error: message },
                        } as EnrichedMapLayer
                    }
                    return layer
                }),
            )

            if (isCurrentRequest()) {
                if (!elementInfoRef.current?.refresh) {
                    setPreloadedDataRef.current([])
                }
                setFetchedLayers(results)
            }
        } catch (error) {
            if (isCurrentRequest()) {
                console.error("[NowcastEventsProvider] Error fetching layers:", error)
            }
        }
    }, [mapContext])

    const fetchRef = useRef(fetchLayers)
    fetchRef.current = fetchLayers

    useEffect(() => {
        setFetchedLayers([])

        if (layerConfigs.length === 0) {
            requestIdRef.current += 1
            abortRef.current?.abort()
            abortTexturesRef.current()
            setMapStateRef.current({ layers: [] })
            return
        }

        void fetchLayers()
        const effectRequestId = requestIdRef.current
        return () => {
            if (requestIdRef.current === effectRequestId) {
                abortRef.current?.abort()
            }
        }
    }, [layerConfigs, fetchLayers])

    useEffect(() => {
        if (fetchedLayers.length === 0) {
            setLegends([])
            setMapStateRef.current({ layers: [] })
            return
        }

        const layerTimestamps = fetchedLayers.map((layer) =>
            layer.connection.resolveTimestamps({ layer }),
        )
        const resolved = resolveTimestampsFromLayers(
            layerTimestamps,
            timestampRef.current,
            elementInfoRef.current?.live,
        )
        setTimestampsRef.current(resolved.timestamps)
        if (resolved.timestamp != null) {
            setTimestampRef.current(resolved.timestamp)
        }
        updateSettings(fetchedLayers)
        setLegends(getLegendsFromLayers(fetchedLayers))
        setMapStateRef.current({ layers: fetchedLayers })
    }, [fetchedLayers, setLegends, updateSettings])

    useEffect(() => {
        const map = mapContext.current
        if (!map) return

        const onMoveStart = () => {
            if (moveTimerRef.current != null) {
                clearTimeout(moveTimerRef.current)
                moveTimerRef.current = null
            }
            requestIdRef.current += 1
            abortRef.current?.abort()
            abortTexturesRef.current()
        }

        const onMoveEnd = () => {
            if (moveTimerRef.current != null) {
                clearTimeout(moveTimerRef.current)
            }
            moveTimerRef.current = setTimeout(() => {
                moveTimerRef.current = null
                void fetchRef.current()
            }, MOVE_DEBOUNCE_MS)
        }

        map.on("movestart", onMoveStart)
        map.on("moveend", onMoveEnd)

        return () => {
            if (moveTimerRef.current != null) clearTimeout(moveTimerRef.current)
            requestIdRef.current += 1
            abortRef.current?.abort()
            map.off("movestart", onMoveStart)
            map.off("moveend", onMoveEnd)
            setLegends([])
            setMapStateRef.current({ layers: [] })
        }
    }, [mapContext, setLegends])

    return children(mapComponents)
}
