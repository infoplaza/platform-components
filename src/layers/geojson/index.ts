import { CompositeLayer } from '@deck.gl/core'
import type { LayerProps, DefaultProps, UpdateParameters, LayersList } from '@deck.gl/core'
import { GeoJsonLayer as DeckGeoJsonLayer } from '@deck.gl/layers'
import type { GeoJsonLayerProps as DeckGeoJsonLayerProps } from '@deck.gl/layers'
import { PathStyleExtension } from '@deck.gl/extensions'
import type { Feature, FeatureCollection } from 'geojson'

type _GeoJsonCustomLayerProps = {
    data: FeatureCollection | Feature | Feature[] | null
    filled: boolean
    stroked: boolean
    extruded: boolean
    pointRadiusMinPixels: number
    pointRadiusMaxPixels: number
    pointRadiusScale: number
    lineWidthMinPixels: number
    lineWidthMaxPixels: number
    lineWidthScale: number
    /** deck.gl units for `getLineWidth` — use `'pixels'` for screen-space strokes. */
    lineWidthUnits: 'meters' | 'common' | 'pixels'
    getFillColor: DeckGeoJsonLayerProps['getFillColor']
    getLineColor: DeckGeoJsonLayerProps['getLineColor']
    getLineWidth: DeckGeoJsonLayerProps['getLineWidth']
    getPointRadius: DeckGeoJsonLayerProps['getPointRadius']
    getElevation: DeckGeoJsonLayerProps['getElevation']
    pickable: boolean
    autoHighlight: boolean
    highlightColor: [number, number, number, number]
    getDashArray: [number, number] | ((d: unknown) => [number, number]) | null
    dashJustified: boolean
    dashGapPickable: boolean
    minZoom: number | null
    maxZoom: number | null
    topmost: boolean
    beforeId: string | undefined
}

export type GeoJsonCustomLayerProps = _GeoJsonCustomLayerProps & LayerProps

const defaultProps: DefaultProps<GeoJsonCustomLayerProps> = {
    data: { type: 'object', value: null },
    filled: { type: 'boolean', value: true },
    stroked: { type: 'boolean', value: true },
    extruded: { type: 'boolean', value: false },
    pointRadiusMinPixels: { type: 'number', value: 2 },
    pointRadiusMaxPixels: { type: 'number', value: 10 },
    pointRadiusScale: { type: 'number', value: 1 },
    lineWidthMinPixels: { type: 'number', value: 1 },
    lineWidthMaxPixels: { type: 'number', value: 10 },
    lineWidthScale: { type: 'number', value: 1 },
    lineWidthUnits: { type: 'object', value: 'meters' },
    getFillColor: { type: 'accessor', value: [0, 128, 255, 180] },
    getLineColor: { type: 'accessor', value: [0, 0, 0, 255] },
    getLineWidth: { type: 'accessor', value: 1 },
    getPointRadius: { type: 'accessor', value: 5 },
    getElevation: { type: 'accessor', value: 0 },
    pickable: { type: 'boolean', value: true },
    autoHighlight: { type: 'boolean', value: false },
    highlightColor: { type: 'color', value: [255, 255, 0, 128] },
    getDashArray: { type: 'accessor', value: null },
    dashJustified: { type: 'boolean', value: false },
    dashGapPickable: { type: 'boolean', value: false },
    minZoom: { type: 'object', value: null },
    maxZoom: { type: 'object', value: null },
    topmost: { type: 'boolean', value: false },
    beforeId: { type: 'object', value: undefined },
}

export class GeoJsonCustomLayer<ExtraPropsT extends {} = {}> extends CompositeLayer<ExtraPropsT & Required<_GeoJsonCustomLayerProps>> {
    static layerName = 'GeoJsonCustomLayer'
    static defaultProps = defaultProps

    declare state: CompositeLayer['state'] & {
        props?: GeoJsonCustomLayerProps
    }

    renderLayers(): LayersList {
        const { props } = this.state
        if (!props?.data) {
            return []
        }

        const {
            data,
            filled,
            stroked,
            extruded,
            pointRadiusMinPixels,
            pointRadiusMaxPixels,
            pointRadiusScale,
            lineWidthMinPixels,
            lineWidthMaxPixels,
            lineWidthScale,
            lineWidthUnits,
            getFillColor,
            getLineColor,
            getLineWidth,
            getPointRadius,
            getElevation,
            pickable,
            autoHighlight,
            highlightColor,
            getDashArray,
            dashJustified,
            dashGapPickable,
        } = this.props

        const extensions = getDashArray ? [new PathStyleExtension({ dash: true })] : []

        return [
            new DeckGeoJsonLayer(this.getSubLayerProps({
                id: 'geojson',
                data,
                filled,
                stroked,
                extruded,
                pointRadiusMinPixels,
                pointRadiusMaxPixels,
                pointRadiusScale,
                lineWidthMinPixels,
                lineWidthMaxPixels,
                lineWidthScale,
                lineWidthUnits,
                getFillColor,
                getLineColor,
                getLineWidth,
                getPointRadius,
                getElevation,
                pickable,
                autoHighlight,
                highlightColor,
                ...(getDashArray ? { getDashArray, dashJustified, dashGapPickable } : {}),
                extensions,
                updateTriggers: this.props.updateTriggers,
                parameters: {
                    cullMode: 'back',
                    depthCompare: 'always',
                    ...this.props.parameters,
                },
            })),
        ]
    }

    shouldUpdateState(params: UpdateParameters<this>): boolean {
        const { changeFlags } = params

        return (
            super.shouldUpdateState(params) ||
            Boolean(changeFlags.propsChanged) ||
            Boolean(changeFlags.dataChanged) ||
            Boolean(changeFlags.updateTriggersChanged)
        )
    }

    updateState(params: UpdateParameters<this>): void {
        super.updateState(params)
        this.setState({ props: params.props })
    }
}
