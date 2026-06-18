import { useMemo, useRef, type ReactNode } from "react"

// ** Connectors Imports
import { ImageLayerConnector } from "./connectors/image"
// import { ImageAltLayerConnector } from "./connectors/image_alt"
// import { GridLayerConnector } from "./connectors/grid"
// import { DirectionLayerConnector } from "./connectors/direction"
// import { BarbLayerConnector } from "./connectors/barb"
// import { ParticleLayerConnector } from "./connectors/particle"
// import { ContourLayerConnector } from "./connectors/contour"
// import { ContourGeoJsonLayerConnector } from "./connectors/contourgeojson"
// import { StormtracksLayerConnector } from "./connectors/stormtracks"
// import { PlotLayerConnector } from "./connectors/plot"
// import { GradeLayerConnector } from "./connectors/grade"

// ** Context Imports
import { useLayerSettings } from "@/src/providers/settings/layer-settings"
import { useTimestampMap } from "@/src/redux/timestamps/provider"
// import { useObservation } from "../context/observation/observation"
// import { LocationLayerConnector } from "./connectors/location"
// import { useSettings } from "@/context/settings"
// import { GridStyle } from "./grid/style"
// import { RangeLayerConnector } from "./connectors/range"
// import { useMapLocation } from "@/components/_webgl/context"
import type { Layer, LayerRendering } from "@/@types/layer.types"

type ComposedLayer = Layer & Record<string, unknown>

type LayerComposerProps = {
    children: (args: { layers: unknown[] }) => ReactNode
    beforeId?: string
    mapComponents?: Record<number, unknown[]>
}

type RenderingBuilder = {
    condition: (layer: ComposedLayer) => boolean
    create: (layer: ComposedLayer) => unknown[] | unknown | null | undefined
}

type ImageConnectorLayer = ComposedLayer & Parameters<typeof ImageLayerConnector>[0]

const hasRendering = (layer: Layer, type: LayerRendering): boolean =>
    layer.rendering === type ||
    (Array.isArray(layer.rendering) && layer.rendering.includes(type))

const isComposedLayer = (value: unknown): value is ComposedLayer => {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const rendering = (value as { rendering?: unknown }).rendering
    return (
        typeof rendering === 'string' ||
        (Array.isArray(rendering) && rendering.every((entry) => typeof entry === 'string'))
    )
}

const asComposedLayers = (components: unknown[] | undefined): ComposedLayer[] | undefined => {
    if (!components) {
        return undefined
    }

    return components.filter(isComposedLayer)
}

const isImageConnectorLayer = (layer: ComposedLayer): layer is ImageConnectorLayer => {
    const bounds = (layer as { bounds?: unknown }).bounds
    return (
        'image' in layer &&
        Array.isArray(bounds) &&
        bounds.length === 4 &&
        bounds.every((value) => typeof value === 'number')
    )
}

const LayerComposer = ({ children, beforeId, mapComponents }: LayerComposerProps) => {
    const { getLayerState } = useLayerSettings()
    const { timestamp, timebarPlaying } = useTimestampMap()
    // const { locations, locationMarker, theme, state: settingsState } = useSettings()
    // const { selectedPlot } = useObservation()
    // const { location } = useMapLocation()
    const frameSkip = false

    const renderingBuilders = useMemo<RenderingBuilder[]>(() => {
        return [
            {
                condition: (layer: ComposedLayer) =>
                    hasRendering(layer, 'IMAGE_V2') &&
                    getLayerState(layer).imageEnabled &&
                    isImageConnectorLayer(layer),
                create: (layer: ComposedLayer) => {
                    if (!isImageConnectorLayer(layer)) {
                        return null
                    }
                    return ImageLayerConnector(layer, getLayerState(layer), beforeId)
                },
            },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'IMAGE_ALT') && getLayerState(layer).imageEnabled,
            //     create: (layer: Layer) => ImageAltLayerConnector(layer, getLayerState(layer), beforeId),
            // },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'VALUES') && getLayerState(layer).gridValuesEnabled,
            //     create: (layer: Layer) => GridLayerConnector({
            //         ...layer,
            //         id: `${layer.id}-values`,
            //         style: GridStyle.VALUE,
            //     }, getLayerState(layer), beforeId),
            // },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'PARTICLES') && getLayerState(layer).particleEnabled,
            //     create: (layer: Layer) => ParticleLayerConnector(layer, getLayerState(layer), timebarPlaying, beforeId),
            // },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'BARBS') && getLayerState(layer).barbEnabled,
            //     create: (layer: Layer) => BarbLayerConnector({
            //         ...layer,
            //         id: `${layer.id}-barbs`,
            //     }, getLayerState(layer), beforeId),
            // },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'DIRECTIONS') && getLayerState(layer).directionEnabled,
            //     create: (layer: Layer) => DirectionLayerConnector({
            //         ...layer,
            //         id: `${layer.id}-directions`,
            //     }, getLayerState(layer), beforeId),
            // },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'CONTOURS') && getLayerState(layer).contourEnabled,
            //     create: (layer: Layer) => ContourLayerConnector(layer, beforeId, getLayerState(layer)),
            // },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'RANGE'),
            //     create: (layer: Layer) => RangeLayerConnector(layer),
            // },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'STORMTRACKS'),
            //     create: (layer: Layer) => StormtracksLayerConnector(layer, beforeId, getLayerState(layer)),
            // },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'PLOT'),
            //     create: (layer: Layer) => PlotLayerConnector({
            //         ...layer,
            //         id: `${layer.id}-plot`,
            //         selectedPlotId: selectedPlot?.locationId ?? null,
            //     }, getLayerState(layer)),
            // },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'GRADES') && getLayerState(layer).gradeEnabled,
            //     create: (layer: Layer) => GradeLayerConnector({
            //         ...layer,
            //         id: `${layer.id}-grades`,
            //         state: getLayerState(layer),
            //     }, beforeId),
            // },
            // {
            //     condition: (layer: Layer) => hasRendering(layer, 'CONTOURGEOJSON') && getLayerState(layer).contourGeoJsonEnabled,
            //     create: (layer: Layer) => ContourGeoJsonLayerConnector(layer, beforeId, getLayerState(layer)),
            // },
        ]
    }, [beforeId, getLayerState, timebarPlaying])

    // Remembers the last timestamp whose components were rendered so we can
    // keep showing it while the current timestamp's components are still
    // loading. Falls back through `mapComponents` so a layers/mode reset
    // (which empties the map) drops the fallback too instead of rendering
    // stale layers from a previous generation.
    const lastValidTsRef = useRef<number | null>(null)

    const mapping = useMemo(() => {
        if (!mapComponents || !timestamp) {
            return undefined
        }

        if (mapComponents[timestamp]) {
            lastValidTsRef.current = timestamp
            return asComposedLayers(mapComponents[timestamp])
        }

        if (!frameSkip) {
            return asComposedLayers(mapComponents[timestamp])
        }

        const fallbackTs = lastValidTsRef.current
        if (fallbackTs != null && mapComponents[fallbackTs]) {
            return asComposedLayers(mapComponents[fallbackTs])
        }

        return undefined
    }, [mapComponents, timestamp, frameSkip])


    const layers = useMemo(() => {
        if (!mapping) {
            return []
        }

        return mapping.flatMap((layer) =>
            renderingBuilders
                .filter(({ condition }) => condition(layer))
                .flatMap(({ create }) => {
                    const created = create(layer)
                    return Array.isArray(created) ? created : [created]
                })
                .filter(Boolean)
        )
    }, [mapping, renderingBuilders])

    // const constants = useMemo(() => {
    //     if (!locationMarker) return []

    //     const selectedIds = (() => {
    //         if (!location) {
    //             return []
    //         }

    //         if (location.id != null) {
    //             return [location.id]
    //         }

    //         const matchedLocation = locations.find((candidate: any) => {
    //             const lat = typeof candidate?.coords_lat === 'number' ? candidate.coords_lat : candidate?.latLng?.lat
    //             const lng = typeof candidate?.coords_lng === 'number' ? candidate.coords_lng : candidate?.latLng?.lng

    //             if (typeof lat !== 'number' || typeof lng !== 'number') {
    //                 return false
    //             }

    //             return lat.toFixed(4) === location.lat.toFixed(4) && lng.toFixed(4) === location.lng.toFixed(4)
    //         })

    //         return matchedLocation?.id != null ? [matchedLocation.id] : []
    //     })()

    //     return [
    //         LocationLayerConnector(locations, { selectedIds, zoom, theme: theme?.css ?? 'light' }, beforeId),
    //     ].filter(Boolean)
    // }, [location, locationMarker, locations, theme, zoom, beforeId])

    return (
        <>
            {children({ layers })}
        </>
    )
}

export default LayerComposer