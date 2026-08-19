import { ParticleLayer, ParticleLayerProps } from "@/src/layers/particle"
import { ClipExtension } from "@deck.gl/extensions"
import { ImageType, type ImageType as ImageTypeType } from "@/src/_utils/image-type"
import { ImageInterpolation, type ImageInterpolation as ImageInterpolationType } from "@/src/_utils/image-interpolation"
import type { TextureData } from '@/src/_utils/texture-data'
import type { Palette } from '@/src/_utils/palette'
import {
    DEFAULT_LAYER_SETTINGS_STATE,
    type LayerSettingsState,
} from '@/src/providers/settings/layer-settings'
import type { ConfigColor, LayerConfigSettings } from '@/@types/layer.types'

/**
 * Layer configuration for ParticleLayer creation
 */
interface ParticleLayerConfig {
    image: TextureData
    image2?: TextureData | null
    bounds: [number, number, number, number]
    numParticles?: number
    maxAge?: number
    speedFactor?: number
    time?: number
    seed?: number
    viewportGlobe?: boolean
    viewportBounds?: [number, number, number, number]
    viewportZoomChangeFactor?: number
    imageType?: ImageTypeType | string
    imageUnscale?: [number, number]
    imageMinValue?: number
    imageMaxValue?: number
    imageSmoothing?: number
    imageInterpolation?: ImageInterpolationType | string
    imageWeight?: number
    width?: number
    animate?: boolean
    palette?: Palette | null
    color?: [number, number, number, number]
    minZoom?: number | null
    maxZoom?: number
    opacity?: number
    settings?: LayerConfigSettings
    [key: string]: unknown
}

// Single source of truth: connector-side defaults must match the store
// defaults, otherwise resolveParticleSetting's "state equals default => layer
// wins" branch never fires when state is at the store default value.
const DEFAULT_PARTICLE_NUM_PARTICLES = DEFAULT_LAYER_SETTINGS_STATE.particleNumParticles
const DEFAULT_PARTICLE_MAX_AGE = DEFAULT_LAYER_SETTINGS_STATE.particleMaxAge
const DEFAULT_PARTICLE_SPEED_FACTOR = DEFAULT_LAYER_SETTINGS_STATE.particleSpeedFactor
const DEFAULT_PARTICLE_WIDTH = DEFAULT_LAYER_SETTINGS_STATE.particleWidth
const DEFAULT_PARTICLE_OPACITY = DEFAULT_LAYER_SETTINGS_STATE.particleOpacity
const DEFAULT_PARTICLE_COLOR = DEFAULT_LAYER_SETTINGS_STATE.particleColor
const DEFAULT_PARTICLE_ANIMATE = DEFAULT_LAYER_SETTINGS_STATE.particleAnimate

function toUint8Alpha(value: number) {
    return Math.round(Math.max(0, Math.min(1, value)) * 255)
}

function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } | null {
    const clean = hex.trim().replace(/^#/, '')
    let r = 0, g = 0, b = 0, a = 1
    if (clean.length === 3 || clean.length === 4) {
        r = parseInt(clean[0] + clean[0], 16)
        g = parseInt(clean[1] + clean[1], 16)
        b = parseInt(clean[2] + clean[2], 16)
        if (clean.length === 4) a = parseInt(clean[3] + clean[3], 16) / 255
    } else if (clean.length === 6 || clean.length === 8) {
        r = parseInt(clean.substring(0, 2), 16)
        g = parseInt(clean.substring(2, 4), 16)
        b = parseInt(clean.substring(4, 6), 16)
        if (clean.length === 8) a = parseInt(clean.substring(6, 8), 16) / 255
    } else {
        return null
    }
    if ([r, g, b].some(Number.isNaN) || Number.isNaN(a)) return null
    return { r, g, b, a }
}

function configColorToTuple(color: ConfigColor | undefined): [number, number, number, number] | undefined {
    if (color === undefined) return undefined
    const rgba = typeof color === 'string' ? hexToRgba(color) : color
    if (!rgba) return undefined
    return [rgba.r, rgba.g, rgba.b, toUint8Alpha(rgba.a)]
}

function resolveParticleSetting<T>(
    stateValue: T,
    defaultValue: T,
    layerValue: T | undefined,
    fallbackValue: T
) {
    if (layerValue !== undefined && stateValue === defaultValue) {
        return layerValue
    }

    return stateValue ?? layerValue ?? fallbackValue
}

/**
 * Creates a ParticleLayer for PARTICLES rendering type
 * @param layer - Layer configuration object
 * @returns Created ParticleLayer or null if creation fails
 */
export function ParticleLayerConnector(
    layer: ParticleLayerConfig,
    state: LayerSettingsState,
    timebarPlaying: boolean = false,
    beforeId: string | null = null
): ParticleLayer | null {
    try {
        if (!state.particleEnabled) {
            return null
        }

        // Layer-config defaults declared in forecast.ts (settings.particle.*)
        // win over any legacy top-level layer.* props, and both feed
        // resolveParticleSetting as the "config default" channel.
        const cfg = layer.settings?.particle ?? {}
        const cfgColorTuple = configColorToTuple(cfg.color)
        const layerColorTuple = Array.isArray(layer.color)
            ? (layer.color as [number, number, number, number])
            : undefined

        const numParticles = resolveParticleSetting(
            state.particleNumParticles,
            DEFAULT_PARTICLE_NUM_PARTICLES,
            cfg.numParticles ?? layer.numParticles,
            DEFAULT_PARTICLE_NUM_PARTICLES
        )
        const maxAge = resolveParticleSetting(
            state.particleMaxAge,
            DEFAULT_PARTICLE_MAX_AGE,
            cfg.maxAge ?? layer.maxAge,
            DEFAULT_PARTICLE_MAX_AGE
        )
        const speedFactor = resolveParticleSetting(
            state.particleSpeedFactor,
            DEFAULT_PARTICLE_SPEED_FACTOR,
            cfg.speedFactor ?? layer.speedFactor,
            DEFAULT_PARTICLE_SPEED_FACTOR
        ) * (timebarPlaying ? 2 : 1)
        const width = resolveParticleSetting(
            state.particleWidth,
            DEFAULT_PARTICLE_WIDTH,
            cfg.width ?? layer.width,
            DEFAULT_PARTICLE_WIDTH
        )
        const opacity = resolveParticleSetting(
            state.particleOpacity,
            DEFAULT_PARTICLE_OPACITY,
            cfg.opacity ?? layer.opacity,
            DEFAULT_PARTICLE_OPACITY
        )
        const animate = resolveParticleSetting(
            state.particleAnimate,
            DEFAULT_PARTICLE_ANIMATE,
            cfg.animate ?? layer.animate,
            DEFAULT_PARTICLE_ANIMATE
        )
        const stateColorIsDefault =
            state.particleColor.r === DEFAULT_PARTICLE_COLOR.r &&
            state.particleColor.g === DEFAULT_PARTICLE_COLOR.g &&
            state.particleColor.b === DEFAULT_PARTICLE_COLOR.b &&
            state.particleColor.a === DEFAULT_PARTICLE_COLOR.a
        const configColorTuple = cfgColorTuple ?? layerColorTuple
        const color: [number, number, number, number] = stateColorIsDefault && configColorTuple
            ? configColorTuple
            : [
                state.particleColor.r,
                state.particleColor.g,
                state.particleColor.b,
                toUint8Alpha(state.particleColor.a),
            ]

        const palette =
            state.particleUsePalette && layer.palette
                ? layer.palette
                : null

        // Ensure all required properties are present
        const particleProps = {
            ...layer,
            id: `${layer.id}-wind-particle`,
            extensions: [new ClipExtension()],
            clipBounds: layer.bounds,
            bounds: layer.bounds,
            numParticles,
            maxAge,
            viewportZoomChangeFactor: layer.viewportZoomChangeFactor ?? 1.0,

            imageType: layer.imageType === ImageType.SCALAR || layer.imageType === ImageType.VECTOR ? layer.imageType : ImageType.VECTOR as ImageTypeType,
            // imageUnscale: layer.imageUnscale ?? [-25, 25],
            imageUnscale: null,
            imageSmoothing: layer.imageSmoothing ?? 3,
            imageInterpolation: ImageInterpolation.CUBIC as ImageInterpolationType,
            imageWeight: layer.imageWeight ?? (layer.image2 ? 0.5 : 0),
            speedFactor,
            width,
            pickable: false,
            animate,
            palette,
            capRounded: true,
            jointRounded: true,
            color,
            opacity,
            beforeId,
        }
        
        return new ParticleLayer(particleProps as unknown as ParticleLayerProps)
    } catch (error) {
        console.error('Error creating ParticleLayer:', error)
        return null
    }
}

