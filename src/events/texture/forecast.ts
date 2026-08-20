import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

//** Providers */
import { useMapIndex } from '@/src/providers/timestamps/timestamp'
import { useLayerSettings } from '@/src/providers/settings/layer-settings'
import { selectTimebarPlaying } from '@/src/redux/timestamps/selectors'
import { useTimestampMap } from '@/src/redux/timestamps/provider'

//** Types */
import type { EnrichedMapLayer } from "@/@types/weather.types"

//** Utils */
import { clearTextureDataCache } from '@/src/_utils/texture-data'
import { disposeTextureCache } from '@/src/_utils/texture'
import { hasRendering } from '@/src/_utils/type'

let activeHookCount = 0

type TextureRequest = {
    generation: number
    signal: AbortSignal
}

export type MapLayerTextureOptions = {
    preloadAll?: boolean
}

export function useForecastLayerTexture(
    layers: EnrichedMapLayer[],
    options: MapLayerTextureOptions = {},
) {
    const preloadAll = options.preloadAll ?? false
    const { getContourGeoJsonState } = useLayerSettings()
    const frameSkip = false
    const textureLoadMode = 'image'
    const { timestamp, addUrlToPreload, preloadedData } = useTimestampMap()
    const mapIndex = useMapIndex()
    const timebarPlaying = useSelector(selectTimebarPlaying(mapIndex))

    const contourGeoJsonIntervalKey = useMemo(() => {
        return layers
            .map((layer) => {
                if (!hasRendering(layer, 'CONTOURGEOJSON')) {
                    return ''
                }

                return getContourGeoJsonState(layer).contourGeoJsonInterval
            })
            .join('|')
    }, [layers, getContourGeoJsonState])

    const textureLayers = useMemo(() => {
        const contourGeoJsonIntervals = contourGeoJsonIntervalKey.split('|')

        return layers.map((layer, index) => {
            if (!hasRendering(layer, 'CONTOURGEOJSON')) {
                return layer
            }

            const contourGeoJsonInterval = Number(contourGeoJsonIntervals[index])
            return {
                ...layer,
                settings: {
                    ...layer.settings,
                    contourGeoJson: {
                        ...layer.settings?.contourGeoJson,
                        contourGeoJsonInterval,
                    },
                },
            }
        })
    }, [layers, contourGeoJsonIntervalKey])
    const [mapComponents, setMapComponents] = useState<Record<number, unknown[]>>({})
    const mapComponentsRef = useRef<Record<number, unknown[]>>({})
    mapComponentsRef.current = mapComponents
    const layersRef = useRef(textureLayers)
    layersRef.current = textureLayers
    const preloadedDataRef = useRef(preloadedData)
    preloadedDataRef.current = preloadedData
    const prevTimebarPlayingRef = useRef(false)
    const prevLayersRef = useRef(textureLayers)

    const prevTextureLoadModeRef = useRef(textureLoadMode)

    const currentLoadPromiseRef = useRef<Promise<unknown>>(Promise.resolve())
    const currentLoadTsRef = useRef<number | null | undefined>(undefined)
    const abortControllerRef = useRef<AbortController | null>(null)
    if (abortControllerRef.current === null) {
        abortControllerRef.current = new AbortController()
    }
    const textureGenerationRef = useRef(0)

    const disposeFrameRef = useRef<number | null>(null)
    const disposeResolveRef = useRef<(() => void) | null>(null)

    const getCurrentTextureRequest = useCallback((): TextureRequest => {
        if (abortControllerRef.current === null) {
            abortControllerRef.current = new AbortController()
        }

        return {
            generation: textureGenerationRef.current,
            signal: abortControllerRef.current.signal,
        }
    }, [])

    const isCurrentTextureRequest = useCallback((request: TextureRequest) => {
        return (
            textureGenerationRef.current === request.generation &&
            abortControllerRef.current?.signal === request.signal &&
            !request.signal.aborted
        )
    }, [])

    const beginTextureGeneration = useCallback((options?: { clearComponents?: boolean }): TextureRequest => {
        textureGenerationRef.current += 1
        abortControllerRef.current?.abort()
        abortControllerRef.current = new AbortController()

        if (options?.clearComponents) {
            setMapComponents({})
            mapComponentsRef.current = {}
        }

        return {
            generation: textureGenerationRef.current,
            signal: abortControllerRef.current.signal,
        }
    }, [])

    const scheduleCacheDispose = useCallback(() => {
        if (disposeFrameRef.current != null) {
            cancelAnimationFrame(disposeFrameRef.current)
            disposeFrameRef.current = null
        }
        if (disposeResolveRef.current) {
            disposeResolveRef.current()
            disposeResolveRef.current = null
        }

        return new Promise<void>((resolve) => {
            disposeResolveRef.current = resolve
            disposeFrameRef.current = requestAnimationFrame(() => {
                disposeFrameRef.current = requestAnimationFrame(() => {
                    disposeFrameRef.current = null
                    if (activeHookCount <= 1) {
                        clearTextureDataCache()
                        disposeTextureCache()
                    }
                    disposeResolveRef.current = null
                    resolve()
                })
            })
        })
    }, [])

    const createLayer = useCallback(async (layer: EnrichedMapLayer, ts: number | undefined | null, request: TextureRequest) => {
            const signal = request.signal
            const result = await layer.connection?.getTextures(layer, ts, textureLoadMode, { signal })
            if (!result || !isCurrentTextureRequest(request)) return

            if (result.preloadUrl) {
                addUrlToPreload(result.preloadUrl)
            }
            const { preloadUrl, ...textureData } = result
            return textureData
        },
        [textureLoadMode, addUrlToPreload, isCurrentTextureRequest]
    )

    const getComponentByTimestamp = useCallback(
        async (ts: number | undefined | null, request: TextureRequest) => {
            if (!isCurrentTextureRequest(request)) {
                return []
            }

            const activeLayers = layersRef.current.filter((layer) => layer.active)
            const promises = activeLayers.map(async (layer) => {
                if (!isCurrentTextureRequest(request)) {
                    return
                }
                if (!layer.data && layer.element !== 'Lightning') {
                    return
                }
                if (!ts && layer.element !== 'Lightning') {
                    return
                }

                const result = await createLayer(layer, ts, request).catch((e) => {
                    if (e instanceof DOMException && e.name === 'AbortError') {
                        return undefined
                    }
                    console.error('❌ Error in createLayer:', e)
                    return undefined
                })
                return result
            })

            const results = await Promise.all(promises)
            if (!isCurrentTextureRequest(request)) {
                return []
            }
            return results.filter(Boolean)
        }, [createLayer, isCurrentTextureRequest])

    const preDraw = useCallback(
        async (ts: number | undefined | null, request: TextureRequest) => {
            if (!ts) {
                return
            }
            if (!isCurrentTextureRequest(request)) {
                return
            }

            if (Object.prototype.hasOwnProperty.call(mapComponentsRef.current, ts as PropertyKey)) {
                return
            }

            const components = await getComponentByTimestamp(ts, request)

            if (components.length === 0 || !isCurrentTextureRequest(request)) {
                return
            }

            setMapComponents((prevState) => {
                if (!isCurrentTextureRequest(request)) {
                    return prevState
                }

                return {
                    ...prevState,
                    [ts as number]: components,
                }
            })
        },
        [getComponentByTimestamp, isCurrentTextureRequest]
    )

    const preloadUrl = useCallback(async ({ layer, rawLayer, request }: { layer: EnrichedMapLayer, rawLayer: any, request: TextureRequest }) => {
        if (!isCurrentTextureRequest(request) || preloadedDataRef.current.includes(rawLayer.url) || !rawLayer.url) {
            return
        }

        try {
            const res = await fetch(`${layer.layersApi}${rawLayer.url.replace(/%/ig, '%25')}`, { signal: request.signal })
            if (res.ok && isCurrentTextureRequest(request)) {
                addUrlToPreload(rawLayer.url)
            }
        } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') {
                return
            }
            console.error('[DataElementLayer] preload 👎', rawLayer.url, e)
        }
    }, [addUrlToPreload, isCurrentTextureRequest])


    const preloadTextures = useCallback(
        async (startTimestamp: number | undefined | null, request: TextureRequest) => {
            if (!startTimestamp) {
                return
            }
            const signal = request.signal
            if (!isCurrentTextureRequest(request)) {
                return
            }

            const activeLayers = layersRef.current.filter((layer) => {
                const r = layer.rendering
                if (layer?.preloading === false) {
                    return false
                }
                if (!layer.active || !r) {
                    return false
                }
                return true;
            })

            const runLayer = async (layer: EnrichedMapLayer) => {
                if (!isCurrentTextureRequest(request)) {
                    return
                }
                const data = layer.data
                const layerData = data?.layers?.find((l) => Number(l.timestamp) === startTimestamp)
                const sourcePreloadUrls = data?.layers?.map(({ url }) => url)

                if (!sourcePreloadUrls?.length || !layerData?.url) {
                    return
                }

                const totalUrls = sourcePreloadUrls.length
                const preloadCount = preloadAll
                    ? totalUrls
                    : (timebarPlaying ? 20 : 30)
                if (preloadCount <= 0) {
                    return
                }
                const urlIndex = sourcePreloadUrls.indexOf(layerData.url)
                if (urlIndex === -1) {
                    return
                }

                for (let offset = 1; offset <= preloadCount; offset++) {
                    if (!isCurrentTextureRequest(request) || signal.aborted || !layer.active) {
                        break
                    }
                    const forwardIndex = (urlIndex + offset) % totalUrls
                    const rawLayer = data?.layers?.find((l) => l.url === sourcePreloadUrls[forwardIndex])
                    if (!rawLayer) {
                        continue
                    }
                    try {
                        void preDraw(Number(rawLayer.timestamp), request)
                    } catch (e) {
                        if (e instanceof DOMException && e.name === 'AbortError') {
                            return
                        }
                    }
                }
            }

            activeLayers.forEach((layer) => void runLayer(layer))
        },
        [preDraw, timebarPlaying, frameSkip, isCurrentTextureRequest, preloadUrl, preloadAll]
    )

    const runPreloadAfterCurrent = useCallback(
        async (ts: number | undefined | null, request: TextureRequest) => {
            while (true) {
                if (!isCurrentTextureRequest(request)) return
                const pending = currentLoadPromiseRef.current
                await pending
                if (!isCurrentTextureRequest(request)) return
                if (pending === currentLoadPromiseRef.current) break
            }
            void preloadTextures(ts, request)
        },
        [preloadTextures, isCurrentTextureRequest]
    )

    const schedulePreload = useCallback(
        (ts: number | undefined | null, request: TextureRequest) => {
            if (!isCurrentTextureRequest(request)) {
                return
            }
            void runPreloadAfterCurrent(ts, request)
        },
        [runPreloadAfterCurrent, isCurrentTextureRequest]
    )

    const onDraw = useCallback(
        async (ts: number | undefined | null, request: TextureRequest) => {
            if (!isCurrentTextureRequest(request)) {
                return
            }
            const pending = preDraw(ts, request)
            currentLoadTsRef.current = ts
            currentLoadPromiseRef.current = pending.catch(() => undefined)
            await pending
            if (currentLoadTsRef.current !== ts || !isCurrentTextureRequest(request)) return
            schedulePreload(ts, request)
        },
        [preDraw, schedulePreload, isCurrentTextureRequest]
    )

    const onDrawRef = useRef(onDraw)
    onDrawRef.current = onDraw

    useEffect(() => {
        if (!timestamp) {
            return
        }
            
        const layersChanged = prevLayersRef.current !== textureLayers

        const modeChanged = prevTextureLoadModeRef.current !== textureLoadMode
        prevLayersRef.current = textureLayers

        prevTextureLoadModeRef.current = textureLoadMode

        let cancelled = false
        const request = beginTextureGeneration({ clearComponents: layersChanged || modeChanged })

        const run = async () => {
            if (layersChanged || modeChanged) {
                await scheduleCacheDispose()
                if (cancelled || !isCurrentTextureRequest(request)) return
            }

            if (textureLayers.length > 0 && timestamp) {
                onDrawRef.current(timestamp, request)
            }
        }

        void run()

        return () => {
            cancelled = true
        }
    }, [timestamp, textureLayers, textureLoadMode, beginTextureGeneration, isCurrentTextureRequest, scheduleCacheDispose])

    useEffect(() => {
        if (timebarPlaying && !prevTimebarPlayingRef.current) {
            void runPreloadAfterCurrent(timestamp ?? undefined, getCurrentTextureRequest())
        }
        prevTimebarPlayingRef.current = timebarPlaying
    }, [timebarPlaying, timestamp, runPreloadAfterCurrent, getCurrentTextureRequest])

    useEffect(() => {
        activeHookCount++
        return () => {
            activeHookCount--
            if (disposeFrameRef.current != null) {
                cancelAnimationFrame(disposeFrameRef.current)
                disposeFrameRef.current = null
            }
            if (disposeResolveRef.current) {
                disposeResolveRef.current()
                disposeResolveRef.current = null
            }
            abortControllerRef.current?.abort()
            if (activeHookCount === 0) {
                clearTextureDataCache()
                disposeTextureCache()
            }
        }
    }, [])

    const abortAll = useCallback(() => {
        beginTextureGeneration()
    }, [beginTextureGeneration])

    return { mapComponents, abortAll }
}
