// Nowcast-specific layer type definitions that extend from base Layer types

import { Layer, Item, LayerGroup, LayerConfig, Endpoints } from './layer';

// Nowcast-specific layer that extends base Layer
export interface NowcastLayer extends Omit<Layer, 'element'> {
    model?: string
    element?: string
    period?: string
}

// Nowcast-specific item options
export interface NowcastItemOptions {
    legend?: {
        type: string
    }
    timebar?: {
        acceptedMinutes?: number[]
    }
}

// Nowcast-specific item that extends base Item
export interface NowcastItem extends Omit<Item, 'layers' | 'options'> {
    layers: NowcastLayer[]
    refresh?: number | null
    claims?: string | null | string[]
    timestampFilter?: {
        hours: number
        start: number
    }
    options?: NowcastItemOptions
    borderColor?: string
}


// Nowcast-specific layer group
export interface NowcastLayerGroup extends Omit<LayerGroup, 'items'> {
    i18n: string
    items: NowcastItem[]
}

// Nowcast-specific endpoints
export interface NowcastEndpoints extends Endpoints {
    rust?: {
        server: string
        timeseries: string
        layers: string
    }
}

// Nowcast-specific layer configuration
export interface NowcastLayerConfig extends Omit<LayerConfig, 'endpoint' | 'layers'> {
    endpoint: NowcastEndpoints
    layers: NowcastLayerGroup[]
}
