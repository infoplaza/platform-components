import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useMap } from 'react-map-gl/maplibre'

// ** Config */
import { imageRendering } from "@/src/config/constants"

// ** Hooks
import { useMapLayerTexture } from "@/src/events/texture"

// ** Context Dependencies */
import { useWeatherMap } from "@/src/providers/weather/weather"
import { useLegendValues } from "@/src/providers/legend/legend"
import { useTimestampMap } from "@/src/redux/timestamps/provider"
// import { useSettings } from "@/context/settings"

// ** Utilities */
import { resolveTimestampsFromLayers } from "@/src/utilities/timestamps"
import { getLegendsFromLayers } from "@/src/utilities/legends"

// ** Helpers */
import { useApplyImageSettings } from "@/src/events/helpers/settings"
import { buildLayersUrlFromMapBounds, type ViewportGetLayersUrlArgs } from "@/src/events/helpers/viewport"

// ** Types */
import type { EnrichedMapLayer } from "@/@types/weather.types"

//** External dependencies */
import { isEmpty } from "lodash"

const MOVE_DEBOUNCE_MS = 200

type MapLayerWeatherProps = {
    children: (mapComponents: Record<number, unknown[]>) => ReactNode
}

export default function MapLayerWeather({ children }: MapLayerWeatherProps) {
    const mapContext = useMap()
    // const { modelApi, nowcastApi, graphicalPreset } = useSettings()
    const modelApi = 'prod'
    const nowcastApi = 'prod'
    const graphicalPreset = 0
    const { modelInfo, layersInfo, elementInfo, month, period, setMonth, setPeriod, setMapState } = useWeatherMap()
    const { setLegends } = useLegendValues()
    const { timestamp, setTimestamps, setTimestamp, setPreloadedData } = useTimestampMap()
    const updateSettings = useApplyImageSettings()

    const [fetchedLayers, setFetchedLayers] = useState<EnrichedMapLayer[]>([])
    const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const abortRef = useRef<AbortController | null>(null)
    const requestIdRef = useRef(0)

    const timestampRef = useRef(timestamp)
    timestampRef.current = timestamp
    const graphicalPresetRef = useRef(graphicalPreset)
    graphicalPresetRef.current = graphicalPreset
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

    // const createGetLayersUrl = useCallback(
    //     (layer: { view: Record<string, any> }, layersUrl: string) =>
    //         (args: ViewportGetLayersUrlArgs) => buildLayersUrlFromMapBounds(layer, layersUrl, args),
    //     []
    // )

    const createGetLayersUrl = useCallback(
        (layersUrl: string) => (args: ViewportGetLayersUrlArgs & { modelInfo: any }) => {
            return buildLayersUrlFromMapBounds(layersUrl, args, modelInfo)
        },
        [modelInfo]
    )

    const layerConfigs = useMemo(() => {
        return (layersInfo?.layers ?? [])
            .filter(l => l.active !== false)
            .map((layer): EnrichedMapLayer => {
                const type = layer.type ?? modelInfo?.type
                const apiEnv = type === 'nowcast' ? nowcastApi : modelApi
                const connection = new layer.view.connection({ apiEnv })
                const layersApi = connection.server
                const params = connection.resolveParams({ layer, modelInfo, layersInfo, month, period })
                const url = connection.resolveTemplateUrl(params)
                const getLayersUrl = createGetLayersUrl(url)

                return {
                    ...layer,
                    layersApi,
                    getLayersUrl,
                    preloading: elementInfo?.preloading ?? true,
                    connection,
                    data: undefined,
                } as EnrichedMapLayer
            })
    }, [layersInfo, modelInfo, nowcastApi, modelApi, createGetLayersUrl, elementInfo?.preloading, month, period])

    const layerConfigsRef = useRef(layerConfigs)
    layerConfigsRef.current = layerConfigs

    useEffect(() => {
        if (modelInfo?.type !== 'climate') {
            return
        }

        if (month == null) {
            setMonth('1')
        }

        if (period == null) {
            setPeriod('1')
        }
    }, [modelInfo?.type, month, period, setMonth, setPeriod])

    const fetchLayers = useCallback(async () => {
        const configs = layerConfigsRef.current
        if (configs.length === 0) return

        abortRef.current?.abort()
        abortTexturesRef.current?.()
        const controller = new AbortController()
        const requestId = requestIdRef.current + 1
        requestIdRef.current = requestId
        abortRef.current = controller
        const isCurrentRequest = () =>
            requestIdRef.current === requestId &&
            abortRef.current === controller &&
            !controller.signal.aborted

        const map = mapContext.current
        if (!map) return
        const bounds = map.getBounds()
        const zoom = map.getZoom()

        const results = await Promise.all(
            configs.map(async (layer): Promise<EnrichedMapLayer> => {
                const rendering = layer.rendering
                const preset =
                    rendering === imageRendering ||
                    (Array.isArray(rendering) && rendering.includes(imageRendering))
                        ? graphicalPresetRef.current
                        : 0
                const layersUrl = layer.getLayersUrl({ bounds, zoom, graphicalPreset: preset })

                if (isEmpty(layersUrl)) return layer

                try {
                    const response = await fetch(layersUrl, { signal: controller.signal })
                    if (response.ok) {
                        const json = await response.json()
                        return { ...layer, data: json, boundingBox: json.boundingbox, layersUrl }
                    }
                } catch (e) {
                    if (e instanceof DOMException && e.name === 'AbortError') return layer
                    const message = e instanceof Error ? e.message : String(e)
                    return { ...layer, data: { layers: [], error: message } } as EnrichedMapLayer
                }
                return layer
            })
        )

        if (isCurrentRequest()) {
            if (!elementInfoRef.current?.refresh) {
                setPreloadedDataRef.current([])
            }
            setFetchedLayers(results)
        }
    }, [mapContext])

    const fetchRef = useRef(fetchLayers)
    fetchRef.current = fetchLayers

    useEffect(() => {
        setFetchedLayers([])

        if (layerConfigs.length === 0) {
            requestIdRef.current += 1
            abortRef.current?.abort()
            abortTexturesRef.current?.()
            setMapStateRef.current?.({ layers: [] })
            return
        }

        fetchLayers().catch((e) => {
            console.error('[DemandEventsProvider] Error fetching layers:', e)
        })
        const effectRequestId = requestIdRef.current

        return () => {
            if (requestIdRef.current === effectRequestId) {
                abortRef.current?.abort()
            }
        }
    }, [layerConfigs, graphicalPreset, fetchLayers])


    useEffect(() => {
        if (fetchedLayers.length === 0) {
            setLegends([])
            setMapStateRef.current?.({ layers: [] })
            return
        }
        const timestamps = fetchedLayers.map((layer) => layer.connection.resolveTimestamps({ layer }))
        const resolved = resolveTimestampsFromLayers(timestamps, timestampRef.current, elementInfoRef.current?.live)
        setTimestampsRef.current(resolved.timestamps)
        if (resolved.timestamp != null) {
            setTimestampRef.current(resolved.timestamp)
        }
        updateSettings(fetchedLayers)
        setLegends(getLegendsFromLayers(fetchedLayers))
        setMapStateRef.current?.({ layers: fetchedLayers })
    }, [fetchedLayers, setLegends])

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
            // Free up browser connection slots immediately so the upcoming
            // fetchLayers request isn't queued behind preload images.
            abortTexturesRef.current?.()
        }

        const onMoveEnd = () => {
            if (moveTimerRef.current != null) {
                clearTimeout(moveTimerRef.current)
            }
            moveTimerRef.current = setTimeout(() => {
                moveTimerRef.current = null
                fetchRef.current()
            }, MOVE_DEBOUNCE_MS)
        }

        map.on('movestart', onMoveStart)
        map.on('moveend', onMoveEnd)

        return () => {
            if (moveTimerRef.current != null) clearTimeout(moveTimerRef.current)
            requestIdRef.current += 1
            abortRef.current?.abort()
            map.off('movestart', onMoveStart)
            map.off('moveend', onMoveEnd)
            setLegends([])
            setMapStateRef.current?.({ layers: [] })
        }
    }, [])

    return children(mapComponents)
}