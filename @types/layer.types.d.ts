// Layer type definitions for weather and forecast layers
import * as Connections from '@/src/connections'
import type { ConnectionType } from '@/src/connections/connection'

// Rendering types based on WEATHER_LAYERS_VIEWS configuration
export type LayerRendering = 
    | 'TILES'
    | 'IMAGE_V2'
    | 'IMAGE_ALT'
    | 'JPEG'
    | 'PARTICLES'
    | 'CONTOURS'
    | 'CONTOURGEOJSON'
    | 'LIGHTNING'
    | 'VALUES'
    | 'DIRECTIONS'
    | 'BARBS'
    | 'SNOW'
    | 'STORMTRACKS'
    | 'RANGE'
    | 'PLOT'
    | 'GRADES'
    | 'GEOJSON';

export type ConfigColor = string | { r: number; g: number; b: number; a: number }

export interface LayerValueSettings {
    gridValuesEnabled?: boolean
    density?: number
    layout?: 'squared' | 'staggered'
    textColor?: ConfigColor
    textSize?: number
    textFontFamily?: string
    /** Number of decimal places used to format grid values. Defaults to 0. */
    textDecimals?: number | null
}

export interface LayerImageSettings {
    imageEnabled?: boolean
    imageSmoothing?: number
    imageInterpolation?: 'NEAREST' | 'LINEAR' | 'CUBIC'
    imageMinValue?: number
    imageMaxValue?: number
    imageOpacity?: number
    imagePalette?: string
    /**
     * Whether the image layer participates in deck.gl picking (hover/click
     * value readouts). Defaults to `true` when omitted. Set `false` for
     * background image fields that should not respond to pointer interactions.
     */
    pickable?: boolean
}

export interface LayerContourSettings {
    contourEnabled?: boolean
    contourInterval?: number
    contourMajorInterval?: number
    contourWidth?: number
    contourColor?: ConfigColor
    contourUsePalette?: boolean
    contourOpacity?: number
}

export type LayerContourGeoJsonColorMode = 'white' | 'black' | 'custom' | 'palette'
export type LayerContourGeoJsonLabelColorMode = 'white' | 'black' | 'custom' | 'palette'

export interface LayerContourGeoJsonSettings {
    contourGeoJsonEnabled?: boolean
    contourGeoJsonInterval?: number
    contourGeoJsonLineWidth?: number
    /** 0 = none, 1 = low, 2 = medium, 3 = high. */
    contourGeoJsonSmoothing?: number
    contourGeoJsonLabelRotation?: boolean
    contourGeoJsonColorMode?: LayerContourGeoJsonColorMode
    contourGeoJsonColor?: ConfigColor
    contourGeoJsonLabelColorMode?: LayerContourGeoJsonLabelColorMode
    contourGeoJsonLabelColor?: ConfigColor
}

export interface LayerParticleSettings {
    numParticles?: number
    maxAge?: number
    speedFactor?: number
    width?: number
    opacity?: number
    color?: ConfigColor
    animate?: boolean
}

export interface LayerDirectionSettings {
    directionEnabled?: boolean
    directionDensity?: number
    directionLayout?: 'squared' | 'staggered'
    directionIconSize?: number
    directionIconColor?: ConfigColor
    directionIconUsePalette?: boolean
    directionIconOpacity?: number
}

export interface LayerBarbSettings {
    barbEnabled?: boolean
    barbDensity?: number
    barbLayout?: 'squared' | 'staggered'
    barbIconSize?: number
    barbIconColor?: ConfigColor
    barbIconUsePalette?: boolean
    barbIconOpacity?: number
}

export interface LayerGradeSettings {
    gradeEnabled?: boolean
    gradeTextColor?: ConfigColor
    gradeTextSize?: number
    gradeRadius?: number
}

export interface LayerConfigSettings {
    value?: LayerValueSettings
    image?: LayerImageSettings
    contour?: LayerContourSettings
    contourGeoJson?: LayerContourGeoJsonSettings
    particle?: LayerParticleSettings
    direction?: LayerDirectionSettings
    barb?: LayerBarbSettings
    grade?: LayerGradeSettings
}

export interface Layer {
    element: string
    connection: keyof typeof Connections
    rendering: LayerRendering | LayerRendering[]
    grayscale?: boolean
    isAlphaImage?: boolean
    type?: ConnectionType
    unitKey?: string
    unit?: string
    units?: string[]
    members?: string[]
    optional?: boolean
    name?: string
    i18n?: string
    level?: string
    /** Uses the item's selected level; `level` remains the fallback/default. */
    selectableLevel?: boolean
    palette?: string
    contourinterval?: number
    interval?: number | null
    settings?: LayerConfigSettings
    active?: boolean
    hideConfiguredValue?: boolean // new option to hide the configured value from the data, only used for VALUES rendering (read in data layer /components/_experimental/map/layer/weather/data.js). Read More: https://infoplaza.atlassian.net/browse/IM-1747
}

export interface LegendOptions {
    type: string
}

export interface ItemOptions {
    legend?: LegendOptions
    timebar?: {
        acceptedMinutes?: number[]
    }
}

export interface Item {
    slug: string
    name: string
    i18n?: string
    icon?: string
    iconUrl?: string
    preloading?: boolean
    description?: string
    layers: Layer[]
    levels?: string[]
    members?: string[]
    isMixedLayers?: boolean
    uniqueElements?: string[]
    badge?: string
    options?: ItemOptions
    timestampFilter?: {
        hours: number
        start: number
    }
}

export interface LayerGroup {
    name: string
    i18n?: string
    items: Item[]
}

export interface Endpoint {
    server?: string
    layers?: string
    models?: string
    palettes?: string
    timeseries?: string
    [key: string]: string | undefined
}

export interface Endpoints {
    prod: Endpoint
    test: Endpoint
    [key: string]: Endpoint
}

export interface LayerConfig {
    endpoint: Endpoints
    layers: LayerGroup[]
}