import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { useForecastLayerTexture } from "@/src/events/texture/forecast"
import { useWeatherMap } from "@/src/providers/weather/weather"
import { useLegendValues } from "@/src/providers/legend/legend"
import { useTimestampMap } from "@/src/redux/timestamps/provider"
import { resolveTimestampsFromLayers } from "@/src/utilities/timestamps"
import { getLegendsFromLayers } from "@/src/utilities/legends"
import { useApplyImageSettings } from "@/src/events/helpers/settings"
import {
    buildLayersViewportUrl,
    type ViewportGetLayersUrlArgs,
} from "@/src/events/helpers/viewport"
import type { EnrichedMapLayer } from "@/@types/weather.types"
import { isEmpty } from "lodash"

type SimpleEventsProviderProps = {
    children: (mapComponents: Record<number, unknown[]>) => ReactNode
}

export default function SimpleEventsProvider({ children }: SimpleEventsProviderProps) {
    const { modelInfo, layersInfo, elementInfo, setMapState } = useWeatherMap()
    const { setLegends } = useLegendValues()
    const { timestamp, setTimestamps, setTimestamp } = useTimestampMap()
    const updateSettings = useApplyImageSettings()

    const [fetchedLayers, setFetchedLayers] = useState<EnrichedMapLayer[]>([])
    const timestampRef = useRef(timestamp)
    timestampRef.current = timestamp
    const setMapStateRef = useRef(setMapState)
    setMapStateRef.current = setMapState
    const elementInfoRef = useRef(elementInfo)
    elementInfoRef.current = elementInfo
    const setTimestampsRef = useRef(setTimestamps)
    setTimestampsRef.current = setTimestamps
    const setTimestampRef = useRef(setTimestamp)
    setTimestampRef.current = setTimestamp
    const updateSettingsRef = useRef(updateSettings)
    updateSettingsRef.current = updateSettings

    const { mapComponents, abortAll } = useForecastLayerTexture(fetchedLayers, {
        preloadAll: true,
    })

    const createGetLayersUrl = useCallback(
        (layersUrl: string) =>
            (args: ViewportGetLayersUrlArgs & { modelInfo: unknown }) =>
                buildLayersViewportUrl(layersUrl, args, modelInfo),
        [modelInfo],
    )

    const layerConfigs = useMemo(() => {
        return (layersInfo?.layers ?? [])
            .filter((layer) => layer.active !== false)
            .map((layer): EnrichedMapLayer => {
                const apiEnv = "prod"
                const connection = new layer.view.connection({ apiEnv })
                const layersApi = connection.server
                const params = connection.resolveParams({ layer, modelInfo, layersInfo })
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
    }, [layersInfo, modelInfo, createGetLayersUrl, elementInfo?.preloading])

    useEffect(() => {
        setFetchedLayers([])
        setLegends([])

        if (!modelInfo || layerConfigs.length === 0) {
            setMapStateRef.current({ layers: [] })
            return
        }

        const controller = new AbortController()

        async function fetchAll() {
            const results = await Promise.all(
                layerConfigs.map(async (layer): Promise<EnrichedMapLayer> => {
                    const layersUrl = layer.getLayersUrl({ modelInfo })
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

            if (!controller.signal.aborted) {
                setFetchedLayers(results)
            }
        }

        void fetchAll().catch((error) => {
            if (!controller.signal.aborted) {
                console.error("[SimpleEventsProvider] Error fetching layers:", error)
            }
        })

        return () => {
            controller.abort()
            abortAll()
        }
    }, [layerConfigs, modelInfo, setLegends, abortAll])

    useEffect(() => {
        if (fetchedLayers.length === 0) {
            setLegends([])
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
        setLegends(getLegendsFromLayers(fetchedLayers))
        updateSettingsRef.current(fetchedLayers)
        setMapStateRef.current({ layers: fetchedLayers })
    }, [fetchedLayers, setLegends])

    useEffect(() => {
        return () => {
            setLegends([])
            setMapStateRef.current({ layers: [] })
        }
    }, [setLegends])

    return children(mapComponents)
}
