import { CompositeLayer } from '@deck.gl/core'
import type { Position, Color, LayerProps, DefaultProps, UpdateParameters, CompositeLayerProps, LayersList } from '@deck.gl/core'
import { TextLayer, IconLayer, ScatterplotLayer } from '@deck.gl/layers'
import type { TextLayerProps, IconLayerProps, BitmapBoundingBox } from '@deck.gl/layers'
import type { Texture } from '@luma.gl/core'

// GeoJSON type definitions
type GeoJSONPosition = [number, number] | [number, number, number]
type GeoJSONPoint = { type: 'Point'; coordinates: GeoJSONPosition }
type GeoJSONFeature<T = any, P = any> = { type: 'Feature'; geometry: T; properties: P }
type GeoJSONBBox = [number, number, number, number]
import { DEFAULT_TEXT_FORMAT_FUNCTION, DEFAULT_TEXT_FONT_FAMILY, DEFAULT_TEXT_SIZE, DEFAULT_TEXT_COLOR, DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR, ensureDefaultProps } from '../../_utils/props'
import type { TextFormatFunction } from '../../_utils/props'
import { loadTextureData } from '../../_utils/texture-data'
import type { TextureData } from '../../_utils/texture-data'
import { createTextureCached } from '../../_utils/texture'
import { ImageInterpolation } from '../../_utils/image-interpolation'
import { ImageType } from '../../_utils/image-type'
import type { ImageUnscale } from '../../_utils/image-unscale'
import type { UnitFormat } from '../../_utils/unit-format'
import { isViewportInZoomBounds, getViewportAngle } from '../../_utils/viewport'
import { getViewportGridPositions, getViewportWorldCopyOffsets } from '../../_utils/viewport-grid'
import { getRasterPoints } from '../../_utils/raster-data'
import type { RasterPointProperties } from '../../_utils/raster-data'
// import { parsePalette, type Palette, type Scale } from '../../_utils/palette'
import { paletteColorToGl } from '../../_utils/color'
import type { IconStyle } from '../../_utils/icon-style'
import { GridStyle, GRID_ICON_STYLES } from './style'
import type { Legend } from '../../_utils/pixel-value'

type _GridCompositeLayerProps = CompositeLayerProps & {
  image: TextureData | null;
  image2: TextureData | null;
  imageSmoothing: number;
  imageInterpolation: ImageInterpolation;
  imageWeight: number;
  imageType: ImageType;
  imageUnscale: ImageUnscale;
  imageMinValue: number | null;
  imageMaxValue: number | null;
  bounds: BitmapBoundingBox;
  minZoom: number | null;
  maxZoom: number | null;

  style: GridStyle;
  density: number;
  layout: 'squared' | 'staggered';
  unitFormat: UnitFormat | null;
  textFormatFunction: TextFormatFunction;
  textFontFamily: string;
  textSize: number;
  textColor: Color;
  iconBounds: [number, number] | null;
  iconSize: [number, number] | number;
  iconColor: Color;
  palette: any | null;
  legend?: Legend | null;
  paletteTexture?: TextureData | null;
  isAlphaImage?: boolean;
  paletteBounds?: [number, number];
  grayscale?: boolean;
  isLogScale?: boolean;
  beforeId?: string | null;
} 

export type GridCompositeLayerProps = _GridCompositeLayerProps & LayerProps;

const defaultProps: DefaultProps<GridCompositeLayerProps> = {
    image: { type: 'object', value: null }, // object instead of image to allow reading raw data
    image2: { type: 'object', value: null }, // object instead of image to allow reading raw data
    imageSmoothing: { type: 'number', value: 0 },
    imageInterpolation: { type: 'object', value: ImageInterpolation.CUBIC },
    imageWeight: { type: 'number', value: 0 },
    imageType: { type: 'object', value: ImageType.SCALAR },
    imageUnscale: { type: 'array', value: null },
    imageMinValue: { type: 'object', value: null },
    imageMaxValue: { type: 'object', value: null },
    bounds: { type: 'array', value: [-180, -90, 180, 90], compare: true },
    minZoom: { type: 'object', value: null },
    maxZoom: { type: 'object', value: null },
    style: { type: 'object', value: GridStyle.VALUE },
    density: { type: 'number', value: 0 },
    layout: { type: 'object', value: 'staggered' },
    unitFormat: { type: 'object', value: null },
    textFormatFunction: { type: 'function', value: DEFAULT_TEXT_FORMAT_FUNCTION },
    textFontFamily: { type: 'object', value: DEFAULT_TEXT_FONT_FAMILY },
    textSize: { type: 'number', value: DEFAULT_TEXT_SIZE },
    textColor: { type: 'color', value: DEFAULT_TEXT_COLOR },
    iconBounds: { type: 'array', value: null },
    iconSize: { type: 'object', value: DEFAULT_ICON_SIZE },
    iconColor: { type: 'color', value: DEFAULT_ICON_COLOR },
    palette: { type: 'object', value: null },
    legend: { type: 'object', value: null },
    paletteTexture: { type: 'object', value: null },
    paletteBounds: { type: 'array', value: [0, 0] },
    isLogScale: { type: 'boolean', value: false },
}

export class GridCompositeLayer<ExtraPropsT extends {} = {}> extends CompositeLayer<ExtraPropsT & Required<_GridCompositeLayerProps>> {
    static layerName = 'GridCompositeLayer'
    static defaultProps = defaultProps

    declare state: CompositeLayer['state'] & {
        props?: GridCompositeLayerProps;
        iconStyle?: IconStyle;
        iconAtlasTexture?: Texture;
        // paletteScale?: Scale;
        positions?: GeoJSONPosition[];
        points?: GeoJSONFeature<GeoJSONPoint, RasterPointProperties>[];
        visiblePositions?: GeoJSONPosition[];
        visiblePoints?: GeoJSONFeature<GeoJSONPoint, RasterPointProperties>[];
    }

    renderLayers(): LayersList {
        const { viewport } = this.context
        const { props, visiblePoints, positions } = this.state
        if (!props || !visiblePoints || !positions) {
            return []
        }

        const { id, style, unitFormat, textFormatFunction, textFontFamily, textSize, textColor, iconSize, iconColor, beforeId } = ensureDefaultProps(props, defaultProps)
        const { paletteScale } = this.state

        if (GRID_ICON_STYLES.has(style)) {
            const { iconStyle, iconAtlasTexture } = this.state

            if (!iconStyle || !iconAtlasTexture) {
                return []
            }

            const iconCount = Object.keys(iconStyle.iconMapping).length
            const iconBounds = props.iconBounds ?? iconStyle.iconBounds ?? [0, 0]
            const iconBoundsDelta = iconBounds[1] - iconBounds[0]
            const iconBoundsRatio = (value: number) => (value - iconBounds[0]) / iconBoundsDelta
            const iconSizeDelta = Array.isArray(iconSize) ? iconSize[1] - iconSize[0] : 0

            return [
                new IconLayer({
                    id: `${id}-grid-icon`,
                    data: visiblePoints,
                    getPosition: d => d.geometry.coordinates as Position,
                    getIcon: d => `${Math.min(Math.max(Math.floor(iconBoundsRatio(d.properties.value) * iconCount), 0), iconCount - 1)}`,
                    getSize: d => Array.isArray(iconSize) ? iconSize[0] + (iconBoundsRatio(d.properties.value) * iconSizeDelta) : iconSize,
                    getColor: d => iconColor,
                    getAngle: d => getViewportAngle(viewport, d.properties.direction ? 360 - d.properties.direction : 0),
                    iconAtlas: iconAtlasTexture,
                    iconMapping: iconStyle.iconMapping,
                    billboard: false,
                    sizeBasis: 'height',
                    parameters: {
                        cullMode: 'front', // enable culling to avoid rendering on both sides of the globe; front-face culling because it seems deck.gl uses a wrong winding order and setting frontFace: 'cw' throws "GL_INVALID_ENUM: Enum 0x0000 is currently not supported."
                        depthCompare: 'always', // disable depth test to avoid conflict with Maplibre globe depth buffer, see https://github.com/visgl/deck.gl/issues/9357
                        ...this.props.parameters,
                    },
                } satisfies IconLayerProps<GeoJSONFeature<GeoJSONPoint, RasterPointProperties>>),
            ]
        } else {

            // console.log('renderLayers feeded positions', beforeId)
            return [
                // new ScatterplotLayer({
                //     id: `${id}-grid-scatterplot`,
                //     data: positions,
                //     pickable: true,
                //     autoHighlight: true,
                //     stroked: true,
                //     filled: true,
                //     radiusScale: 15,
                //     radiusMinPixels: 3,
                //     radiusMaxPixels: 10,
                //     lineWidthMinPixels: 1,
                //     lineWidthUnits: 'pixels',
                //     getPosition: (d: GeoJSONFeature<GeoJSONPoint, RasterPointProperties>) => {
                //         // console.log('getPosition feeded position', d)
                //         // return d.geometry.coordinates as Position
                //         return d as unknown as Position
                //     },
                //     getRadius: (d: GeoJSONFeature<GeoJSONPoint, RasterPointProperties>) => {
                //         return 1
                //     },
                //     getFillColor: (d: GeoJSONFeature<GeoJSONPoint, RasterPointProperties>) => paletteScale ? paletteColorToGl(paletteScale(d.properties.value).rgba()) : iconColor,
                //     getLineColor: (d: GeoJSONFeature<GeoJSONPoint, RasterPointProperties>) => iconColor,
                //     getLineWidth: (d: GeoJSONFeature<GeoJSONPoint, RasterPointProperties>) => 1,
                //     updateTriggers: {
                //         getPosition: [visiblePoints],
                //         getRadius: [visiblePoints],
                //         getFillColor: [visiblePoints, iconColor],
                //         getLineColor: [visiblePoints],
                //         getLineWidth: [visiblePoints],
                //     },
                //     beforeId,
                // }),
                new TextLayer({
                    id: `${id}-grid-text`,
                    data: visiblePoints,
                    characterSet: 'auto',
                    // fontSettings: {
                    //     sdf: true,
                    //     buffer: 8
                    // },
                    getPosition: d => d.geometry.coordinates as Position,
                    getText: d => textFormatFunction(d.properties.value, unitFormat),
                    getSize: textSize,
                    getColor: d => textColor,
                    getAngle: getViewportAngle(viewport, 0),
                    getAlignmentBaseline: 'center',
                    getTextAnchor: 'middle',
                    pickable: false,
                    fontFamily: textFontFamily,
                    // fontSettings: { sdf: true },
                    billboard: false,
                    parameters: {
                        cullMode: 'front', // enable culling to avoid rendering on both sides of the globe; front-face culling because it seems deck.gl uses a wrong winding order and setting frontFace: 'cw' throws "GL_INVALID_ENUM: Enum 0x0000 is currently not supported."
                        depthCompare: 'always', // disable depth test to avoid conflict with Maplibre globe depth buffer, see https://github.com/visgl/deck.gl/issues/9357
                        ...this.props.parameters,
                    },
                } satisfies TextLayerProps<GeoJSONFeature<GeoJSONPoint, RasterPointProperties>>),
            ]
        }
    }

    shouldUpdateState(params: UpdateParameters<this>): boolean {
        return super.shouldUpdateState(params) || params.changeFlags.viewportChanged
    }

    initializeState(): void {
        this.#updatePositions()
    }

    updateState(params: UpdateParameters<this>): void {
        const { image, image2, imageSmoothing, imageInterpolation, imageWeight, imageType, imageUnscale, imageMinValue, imageMaxValue, minZoom, maxZoom, style, density, layout, unitFormat, textFormatFunction, textFontFamily, textSize, textColor, iconSize, iconColor, palette, visible } = params.props

        super.updateState(params)

        if (!visible) {
            this.setState({
                points: undefined,
                visiblePoints: undefined,
            })

            return
        }

        if (
            !this.state.iconStyle ||
      style !== params.oldProps.style
        ) {
            this.#updateIconStyle()
        }

        if (
            density !== params.oldProps.density ||
      layout !== params.oldProps.layout ||
      params.changeFlags.viewportChanged
        ) {
            this.#updatePositions()
        }

        if (
            image !== params.oldProps.image ||
      image2 !== params.oldProps.image2 ||
      imageSmoothing !== params.oldProps.imageSmoothing ||
      imageInterpolation !== params.oldProps.imageInterpolation ||
      imageWeight !== params.oldProps.imageWeight ||
      imageType !== params.oldProps.imageType ||
      imageUnscale !== params.oldProps.imageUnscale ||
      imageMinValue !== params.oldProps.imageMinValue ||
      imageMaxValue !== params.oldProps.imageMaxValue ||
      visible !== params.oldProps.visible
        ) {
            this.#updateFeatures()
        }

        if (
            minZoom !== params.oldProps.minZoom ||
      maxZoom !== params.oldProps.maxZoom ||
      params.changeFlags.viewportChanged
        ) {
            this.#updateVisibleFeatures()
        }

        if (palette !== params.oldProps.palette) {
            this.#updatePalette()
        }

        if (
            unitFormat !== params.oldProps.unitFormat ||
      textFormatFunction !== params.oldProps.textFormatFunction ||
      textFontFamily !== params.oldProps.textFontFamily ||
      textSize !== params.oldProps.textSize ||
      textColor !== params.oldProps.textColor ||
      iconSize !== params.oldProps.iconSize ||
      iconColor !== params.oldProps.iconColor
        ) {
            this.#redrawVisibleFeatures()
        }

        this.setState({ props: params.props })
    }

    async #updateIconStyle(): Promise<void> {
        const { device } = this.context
        const { style } = ensureDefaultProps(this.props, defaultProps)
        const iconStyle = GRID_ICON_STYLES.get(style)
        if (!iconStyle) {
            this.setState({
                iconStyle: undefined,
                iconAtlasTexture: undefined,
            })

            return
        }

        this.setState({ iconStyle })

        const iconAtlasData = await loadTextureData(iconStyle.iconAtlas)
        if (!iconAtlasData) {
            return
        }

        const iconAtlasTexture = createTextureCached(device, iconAtlasData)

        this.setState({ iconAtlasTexture })
    }

    #updatePositions(): void {
        const { viewport } = this.context
        const { density, layout } = ensureDefaultProps(this.props, defaultProps)
        const positions = getViewportGridPositions(viewport, density + 3, layout)

        this.setState({ positions })

        this.#updateFeatures()
    }

    #updateFeatures(): void {
        const { image, image2, imageSmoothing, imageInterpolation, imageWeight, imageType, imageUnscale, imageMinValue, imageMaxValue, bounds, legend, paletteTexture, paletteBounds, grayscale, isLogScale } = ensureDefaultProps(this.props, defaultProps)
        const { positions } = this.state
        if (!image || !positions) {
            return
        }

        const imageProperties = { image, image2, imageSmoothing, imageInterpolation, imageWeight, imageType, imageUnscale, imageMinValue, imageMaxValue, legend: legend ?? undefined, paletteTexture: paletteTexture ?? undefined, paletteBounds, isAlphaImage: this.props.isAlphaImage, grayscale, isLogScale }
        
        const points = getRasterPoints(imageProperties, bounds as GeoJSONBBox, positions).features.filter(d => !isNaN(d.properties.value))

        this.setState({ points })

        this.#updateVisibleFeatures()
    }

    #updateVisibleFeatures(): void {
        const { viewport } = this.context
        const { minZoom, maxZoom } = ensureDefaultProps(this.props, defaultProps)
        const { points } = this.state
        if (!points) {
            return
        }

        let visiblePoints: GeoJSONFeature<GeoJSONPoint, RasterPointProperties>[]
        if (isViewportInZoomBounds(viewport, minZoom, maxZoom)) {
            // ScatterplotLayer/IconLayer don't auto-repeat across world copies,
            // so when the visible viewport spans the antimeridian (or shows
            // multiple world copies at low zoom), we duplicate each point with
            // a ±360° longitude shift so they render in every visible copy.
            const offsets = getViewportWorldCopyOffsets(viewport)
            if (offsets.length === 1) {
                visiblePoints = points
            } else {
                visiblePoints = []
                for (const offset of offsets) {
                    if (offset === 0) {
                        for (const p of points) visiblePoints.push(p)
                    } else {
                        for (const p of points) {
                            const [lng, lat, ...rest] = p.geometry.coordinates
                            visiblePoints.push({
                                ...p,
                                geometry: {
                                    ...p.geometry,
                                    coordinates: [lng - offset, lat, ...rest] as GeoJSONPosition,
                                },
                            })
                        }
                    }
                }
            }
        } else {
            visiblePoints = []
        }

        this.setState({ visiblePoints })
    }

    #updatePalette(): void {
        const { palette } = ensureDefaultProps(this.props, defaultProps)
        if (!palette) {
            this.setState({ paletteScale: undefined })

            this.#redrawVisibleFeatures()

            return
        }

        // const paletteScale = parsePalette(palette)

        // this.setState({ paletteScale })

        this.#redrawVisibleFeatures()
    }

    #redrawVisibleFeatures(): void {
        this.setState({ visiblePoints: Array.isArray(this.state.visiblePoints) ? Array.from(this.state.visiblePoints) : this.state.visiblePoints })
    }
}