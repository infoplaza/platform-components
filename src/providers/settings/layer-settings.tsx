'use client'

import React, { createContext, useContext, useCallback, useEffect, useMemo, useReducer, ReactNode } from 'react'
import { ImageInterpolation, type ImageInterpolation as ImageInterpolationType } from '@/src/_utils/image-interpolation'
import StorageService from '@/src/utilities/storage'
import { getLayerSettingsKey, type LayerKeyInput, type ScopedRendering } from './layer-key'
import type { LayerContourGeoJsonColorMode, LayerContourGeoJsonLabelColorMode } from '@/@types/layer.types'

interface RGBAColor {
    r: number
    g: number
    b: number
    a: number
}

/**
 * Fields scoped per IMAGE_V2 layer.
 */
export interface PerLayerImageState {
    imageEnabled: boolean
    imageSmoothing: number
    imageInterpolation: ImageInterpolationType
    imageMinValue: number
    imageMaxValue: number
    imageOpacity: number
    imagePalette: string | null
}

/**
 * Fields scoped per VALUES layer.
 */
export interface PerLayerValuesState {
    gridValuesEnabled: boolean
    density: number
    layout: 'squared' | 'staggered'
    textColor: RGBAColor
    textSize: number
    textFontFamily: string
    /** Number of decimal places used to format grid values. 0 means integer values. */
    textDecimals: number
}

/**
 * Fields scoped per CONTOURS layer.
 */
export interface PerLayerContourState {
    contourEnabled: boolean
    contourInterval: number
    contourMajorInterval: number
    contourWidth: number
    contourColor: RGBAColor
    contourUsePalette: boolean
    contourOpacity: number
}

/**
 * Fields scoped per CONTOURGEOJSON layer.
 */
export interface PerLayerContourGeoJsonState {
    contourGeoJsonEnabled: boolean
    contourGeoJsonInterval: number
    contourGeoJsonLineWidth: number
    contourGeoJsonSmoothing: number
    contourGeoJsonLabelRotation: boolean
    contourGeoJsonColorMode: LayerContourGeoJsonColorMode
    contourGeoJsonColor: RGBAColor
    contourGeoJsonLabelColorMode: LayerContourGeoJsonLabelColorMode
    contourGeoJsonLabelColor: RGBAColor
}

/**
 * Fields scoped per DIRECTIONS layer. Field names are prefixed to avoid
 * colliding with `VALUES` fields when buckets are merged into the flat
 * `LayerSettingsState` via `getLayerState`.
 */
export interface PerLayerDirectionState {
    directionEnabled: boolean
    directionDensity: number
    directionLayout: 'squared' | 'staggered'
    directionIconSize: number
    directionIconColor: RGBAColor
    directionIconUsePalette: boolean
    directionIconOpacity: number
}

/**
 * Fields scoped per BARBS layer. Same shape as the DIRECTIONS bucket since
 * both render through the IconLayer path; kept independent so wind-barb and
 * arrow controls do not couple at the UI or state layer.
 */
export interface PerLayerBarbState {
    barbEnabled: boolean
    barbDensity: number
    barbLayout: 'squared' | 'staggered'
    barbIconSize: number
    barbIconColor: RGBAColor
    barbIconUsePalette: boolean
    barbIconOpacity: number
}

/**
 * Fields scoped per GRADES layer.
 */
export interface PerLayerGradeState {
    gradeEnabled: boolean
    gradeTextColor: RGBAColor
    gradeTextSize: number
    gradeRadius: number
}

/**
 * Truly global (non-scoped) fields. Today only PARTICLES and the few flags
 * shared by stormtracks/grid sit here.
 */
export interface GlobalLayerSettingsState {
    particleEnabled: boolean
    particleNumParticles: number
    particleMaxAge: number
    particleSpeedFactor: number
    particleWidth: number
    particleColor: RGBAColor
    particleUsePalette: boolean
    particleOpacity: number
    particleAnimate: boolean
}

/**
 * The flat shape every connector consumes today. Keeps the connector files
 * unchanged: they read fields directly off this object regardless of which
 * bucket the value originated from.
 */
export interface LayerSettingsState
    extends PerLayerImageState,
        PerLayerValuesState,
        PerLayerContourState,
        PerLayerContourGeoJsonState,
        PerLayerDirectionState,
        PerLayerBarbState,
        PerLayerGradeState,
        GlobalLayerSettingsState {}

const DEFAULT_IMAGE: PerLayerImageState = {
    imageEnabled: true,
    imageSmoothing: 0,
    imageInterpolation: ImageInterpolation.LINEAR,
    imageMinValue: -255,
    imageMaxValue: 255,
    imageOpacity: 1,
    imagePalette: null,
}

const DEFAULT_VALUES: PerLayerValuesState = {
    gridValuesEnabled: true,
    density: 0,
    layout: 'squared',
    textColor: { r: 255, g: 255, b: 255, a: 1 },
    textSize: 12,
    textFontFamily: 'Arial',
    textDecimals: 0,
}

const DEFAULT_CONTOUR: PerLayerContourState = {
    contourEnabled: true,
    contourInterval: 58,
    contourMajorInterval: 76,
    contourWidth: 1.5,
    contourColor: { r: 255, g: 255, b: 255, a: 1 },
    contourUsePalette: false,
    contourOpacity: 0.3,
}

const DEFAULT_CONTOUR_GEOJSON: PerLayerContourGeoJsonState = {
    contourGeoJsonEnabled: true,
    contourGeoJsonInterval: 5,
    contourGeoJsonLineWidth: 1,
    contourGeoJsonSmoothing: 0,
    contourGeoJsonLabelRotation: true,
    contourGeoJsonColorMode: 'palette',
    contourGeoJsonColor: { r: 255, g: 255, b: 255, a: 1 },
    contourGeoJsonLabelColorMode: 'white',
    contourGeoJsonLabelColor: { r: 255, g: 255, b: 255, a: 1 },
}

const DEFAULT_DIRECTION: PerLayerDirectionState = {
    directionEnabled: true,
    directionDensity: 0,
    directionLayout: 'staggered',
    directionIconSize: 30,
    directionIconColor: { r: 255, g: 255, b: 255, a: 1 },
    directionIconUsePalette: true,
    directionIconOpacity: 1,
}

const DEFAULT_BARB: PerLayerBarbState = {
    barbEnabled: true,
    barbDensity: -0.5,
    barbLayout: 'staggered',
    barbIconSize: 28,
    barbIconColor: { r: 255, g: 255, b: 255, a: 1 },
    barbIconUsePalette: false,
    barbIconOpacity: 1,
}

const DEFAULT_GRADE: PerLayerGradeState = {
    gradeEnabled: true,
    gradeTextColor: { r: 255, g: 255, b: 255, a: 1 },
    gradeTextSize: 10,
    gradeRadius: 28,
}

const DEFAULT_GLOBAL: GlobalLayerSettingsState = {
    particleEnabled: true,
    particleNumParticles: 4000,
    particleMaxAge: 35,
    particleSpeedFactor: 3,
    particleWidth: 2,
    particleColor: { r: 255, g: 255, b: 255, a: 1 },
    particleUsePalette: true,
    particleOpacity: 0.3,
    particleAnimate: true,
}

const DEFAULT_FLAT: LayerSettingsState = {
    ...DEFAULT_IMAGE,
    ...DEFAULT_VALUES,
    ...DEFAULT_CONTOUR,
    ...DEFAULT_CONTOUR_GEOJSON,
    ...DEFAULT_DIRECTION,
    ...DEFAULT_BARB,
    ...DEFAULT_GRADE,
    ...DEFAULT_GLOBAL,
}

interface InternalState {
    image: Record<string, Partial<PerLayerImageState>>
    values: Record<string, Partial<PerLayerValuesState>>
    contour: Record<string, Partial<PerLayerContourState>>
    contourGeoJson: Record<string, Partial<PerLayerContourGeoJsonState>>
    direction: Record<string, Partial<PerLayerDirectionState>>
    barb: Record<string, Partial<PerLayerBarbState>>
    grade: Record<string, Partial<PerLayerGradeState>>
    global: GlobalLayerSettingsState
    /** A copy of the most recent values written by the legacy "global" setters
     * for image / values / contour / direction / barb fields. Used as
     * defaults for layers that have not yet been touched. */
    defaults: {
        image: PerLayerImageState
        values: PerLayerValuesState
        contour: PerLayerContourState
        contourGeoJson: PerLayerContourGeoJsonState
        direction: PerLayerDirectionState
        barb: PerLayerBarbState
        grade: PerLayerGradeState
    }
}

type Action =
    | { type: 'image'; key: string; partial: Partial<PerLayerImageState> }
    | { type: 'values'; key: string; partial: Partial<PerLayerValuesState> }
    | { type: 'contour'; key: string; partial: Partial<PerLayerContourState> }
    | { type: 'contourGeoJson'; key: string; partial: Partial<PerLayerContourGeoJsonState> }
    | { type: 'direction'; key: string; partial: Partial<PerLayerDirectionState> }
    | { type: 'barb'; key: string; partial: Partial<PerLayerBarbState> }
    | { type: 'grade'; key: string; partial: Partial<PerLayerGradeState> }
    | { type: 'global'; partial: Partial<GlobalLayerSettingsState> }
    | { type: 'defaultImage'; partial: Partial<PerLayerImageState> }
    | { type: 'defaultValues'; partial: Partial<PerLayerValuesState> }
    | { type: 'defaultContour'; partial: Partial<PerLayerContourState> }
    | { type: 'defaultContourGeoJson'; partial: Partial<PerLayerContourGeoJsonState> }
    | { type: 'defaultDirection'; partial: Partial<PerLayerDirectionState> }
    | { type: 'defaultBarb'; partial: Partial<PerLayerBarbState> }
    | { type: 'defaultGrade'; partial: Partial<PerLayerGradeState> }

const initialState: InternalState = {
    image: {},
    values: {},
    contour: {},
    contourGeoJson: {},
    direction: {},
    barb: {},
    grade: {},
    global: DEFAULT_GLOBAL,
    defaults: {
        image: DEFAULT_IMAGE,
        values: DEFAULT_VALUES,
        contour: DEFAULT_CONTOUR,
        contourGeoJson: DEFAULT_CONTOUR_GEOJSON,
        direction: DEFAULT_DIRECTION,
        barb: DEFAULT_BARB,
        grade: DEFAULT_GRADE,
    },
}

function reducer(state: InternalState, action: Action): InternalState {
    switch (action.type) {
        case 'image':
            return {
                ...state,
                image: {
                    ...state.image,
                    [action.key]: { ...(state.image[action.key] ?? {}), ...action.partial },
                },
            }
        case 'values':
            return {
                ...state,
                values: {
                    ...state.values,
                    [action.key]: { ...(state.values[action.key] ?? {}), ...action.partial },
                },
            }
        case 'contour':
            return {
                ...state,
                contour: {
                    ...state.contour,
                    [action.key]: { ...(state.contour[action.key] ?? {}), ...action.partial },
                },
            }
        case 'contourGeoJson':
            return {
                ...state,
                contourGeoJson: {
                    ...state.contourGeoJson,
                    [action.key]: { ...(state.contourGeoJson[action.key] ?? {}), ...action.partial },
                },
            }
        case 'direction':
            return {
                ...state,
                direction: {
                    ...state.direction,
                    [action.key]: { ...(state.direction[action.key] ?? {}), ...action.partial },
                },
            }
        case 'barb':
            return {
                ...state,
                barb: {
                    ...state.barb,
                    [action.key]: { ...(state.barb[action.key] ?? {}), ...action.partial },
                },
            }
        case 'grade':
            return {
                ...state,
                grade: {
                    ...state.grade,
                    [action.key]: { ...(state.grade[action.key] ?? {}), ...action.partial },
                },
            }
        case 'global':
            return { ...state, global: { ...state.global, ...action.partial } }
        case 'defaultImage':
            return {
                ...state,
                defaults: { ...state.defaults, image: { ...state.defaults.image, ...action.partial } },
            }
        case 'defaultValues':
            return {
                ...state,
                defaults: { ...state.defaults, values: { ...state.defaults.values, ...action.partial } },
            }
        case 'defaultContour':
            return {
                ...state,
                defaults: { ...state.defaults, contour: { ...state.defaults.contour, ...action.partial } },
            }
        case 'defaultContourGeoJson':
            return {
                ...state,
                defaults: { ...state.defaults, contourGeoJson: { ...state.defaults.contourGeoJson, ...action.partial } },
            }
        case 'defaultDirection':
            return {
                ...state,
                defaults: { ...state.defaults, direction: { ...state.defaults.direction, ...action.partial } },
            }
        case 'defaultBarb':
            return {
                ...state,
                defaults: { ...state.defaults, barb: { ...state.defaults.barb, ...action.partial } },
            }
        case 'defaultGrade':
            return {
                ...state,
                defaults: { ...state.defaults, grade: { ...state.defaults.grade, ...action.partial } },
            }
        default:
            return state
    }
}

// Field clamps -------------------------------------------------------------

const clampImage = (partial: Partial<PerLayerImageState>): Partial<PerLayerImageState> => {
    const out: Partial<PerLayerImageState> = { ...partial }
    if (out.imageSmoothing !== undefined) {
        const safe = Number.isFinite(out.imageSmoothing) ? out.imageSmoothing : 0
        out.imageSmoothing = Math.max(0, Math.min(10, safe))
    }
    if (out.imageOpacity !== undefined) {
        const safe = Number.isFinite(out.imageOpacity) ? out.imageOpacity : 1
        out.imageOpacity = Math.max(0, Math.min(1, safe))
    }
    if (out.imageInterpolation !== undefined) {
        const allowed = Object.values(ImageInterpolation)
        if (!allowed.includes(out.imageInterpolation)) {
            out.imageInterpolation = ImageInterpolation.CUBIC
        }
    }
    if (out.imageMinValue !== undefined && !Number.isFinite(out.imageMinValue)) {
        delete out.imageMinValue
    }
    if (out.imageMaxValue !== undefined && !Number.isFinite(out.imageMaxValue)) {
        delete out.imageMaxValue
    }
    return out
}

const clampValues = (partial: Partial<PerLayerValuesState>): Partial<PerLayerValuesState> => {
    const out: Partial<PerLayerValuesState> = { ...partial }
    if (out.density !== undefined) {
        out.density = Math.max(-1, Math.min(1, out.density))
    }
    if (out.textSize !== undefined) {
        out.textSize = Math.max(8, Math.min(32, out.textSize))
    }
    if (out.textDecimals !== undefined) {
        // Allow callers (e.g. config) to pass null to mean "use default".
        if (out.textDecimals === null || !Number.isFinite(out.textDecimals)) {
            out.textDecimals = DEFAULT_VALUES.textDecimals
        } else {
            out.textDecimals = Math.max(0, Math.min(6, Math.round(out.textDecimals)))
        }
    }
    return out
}

const clampContour = (partial: Partial<PerLayerContourState>): Partial<PerLayerContourState> => {
    const out: Partial<PerLayerContourState> = { ...partial }
    if (out.contourInterval !== undefined) {
        const safe = Number.isFinite(out.contourInterval) ? out.contourInterval : 1
        out.contourInterval = Math.max(0.000001, safe)
    }
    if (out.contourMajorInterval !== undefined) {
        const safe = Number.isFinite(out.contourMajorInterval) ? out.contourMajorInterval : 0
        out.contourMajorInterval = Math.max(0, safe)
    }
    if (out.contourWidth !== undefined) {
        const safe = Number.isFinite(out.contourWidth) ? out.contourWidth : 1
        out.contourWidth = Math.max(0.1, safe)
    }
    if (out.contourOpacity !== undefined) {
        const safe = Number.isFinite(out.contourOpacity) ? out.contourOpacity : 1
        out.contourOpacity = Math.max(0, Math.min(1, safe))
    }
    return out
}

const clampContourGeoJson = (partial: Partial<PerLayerContourGeoJsonState>): Partial<PerLayerContourGeoJsonState> => {
    const out: Partial<PerLayerContourGeoJsonState> = { ...partial }
    if (out.contourGeoJsonInterval !== undefined) {
        const safe = Number.isFinite(out.contourGeoJsonInterval) ? out.contourGeoJsonInterval : DEFAULT_CONTOUR_GEOJSON.contourGeoJsonInterval
        out.contourGeoJsonInterval = Math.max(1, Math.min(10, Math.round(safe)))
    }
    if (out.contourGeoJsonLineWidth !== undefined) {
        const safe = Number.isFinite(out.contourGeoJsonLineWidth) ? out.contourGeoJsonLineWidth : DEFAULT_CONTOUR_GEOJSON.contourGeoJsonLineWidth
        out.contourGeoJsonLineWidth = Math.max(0.1, safe)
    }
    if (out.contourGeoJsonSmoothing !== undefined) {
        const safe = Number.isFinite(out.contourGeoJsonSmoothing) ? out.contourGeoJsonSmoothing : DEFAULT_CONTOUR_GEOJSON.contourGeoJsonSmoothing
        out.contourGeoJsonSmoothing = Math.max(0, Math.min(3, Math.round(safe)))
    }
    if (
        out.contourGeoJsonColorMode !== undefined &&
        !['white', 'black', 'custom', 'palette'].includes(out.contourGeoJsonColorMode)
    ) {
        out.contourGeoJsonColorMode = DEFAULT_CONTOUR_GEOJSON.contourGeoJsonColorMode
    }
    if (
        out.contourGeoJsonLabelColorMode !== undefined &&
        !['white', 'black', 'custom', 'palette'].includes(out.contourGeoJsonLabelColorMode)
    ) {
        out.contourGeoJsonLabelColorMode = DEFAULT_CONTOUR_GEOJSON.contourGeoJsonLabelColorMode
    }
    return out
}

const clampDirection = (partial: Partial<PerLayerDirectionState>): Partial<PerLayerDirectionState> => {
    const out: Partial<PerLayerDirectionState> = { ...partial }
    if (out.directionDensity !== undefined) {
        const safe = Number.isFinite(out.directionDensity) ? out.directionDensity : 0
        out.directionDensity = Math.max(-1, Math.min(1, safe))
    }
    if (out.directionIconSize !== undefined) {
        const safe = Number.isFinite(out.directionIconSize) ? out.directionIconSize : 30
        out.directionIconSize = Math.max(8, Math.min(96, safe))
    }
    if (out.directionIconOpacity !== undefined) {
        const safe = Number.isFinite(out.directionIconOpacity) ? out.directionIconOpacity : 1
        out.directionIconOpacity = Math.max(0, Math.min(1, safe))
    }
    return out
}

const clampBarb = (partial: Partial<PerLayerBarbState>): Partial<PerLayerBarbState> => {
    const out: Partial<PerLayerBarbState> = { ...partial }
    if (out.barbDensity !== undefined) {
        const safe = Number.isFinite(out.barbDensity) ? out.barbDensity : 0
        out.barbDensity = Math.max(-1, Math.min(1, safe))
    }
    if (out.barbIconSize !== undefined) {
        const safe = Number.isFinite(out.barbIconSize) ? out.barbIconSize : 28
        out.barbIconSize = Math.max(8, Math.min(96, safe))
    }
    if (out.barbIconOpacity !== undefined) {
        const safe = Number.isFinite(out.barbIconOpacity) ? out.barbIconOpacity : 1
        out.barbIconOpacity = Math.max(0, Math.min(1, safe))
    }
    return out
}

const clampGrade = (partial: Partial<PerLayerGradeState>): Partial<PerLayerGradeState> => {
    const out: Partial<PerLayerGradeState> = { ...partial }
    if (out.gradeTextSize !== undefined) {
        const safe = Number.isFinite(out.gradeTextSize) ? out.gradeTextSize : DEFAULT_GRADE.gradeTextSize
        out.gradeTextSize = Math.max(6, Math.min(48, safe))
    }
    if (out.gradeRadius !== undefined) {
        const safe = Number.isFinite(out.gradeRadius) ? out.gradeRadius : DEFAULT_GRADE.gradeRadius
        out.gradeRadius = Math.max(4, Math.min(96, safe))
    }
    return out
}

const clampGlobal = (partial: Partial<GlobalLayerSettingsState>): Partial<GlobalLayerSettingsState> => {
    const out: Partial<GlobalLayerSettingsState> = { ...partial }
    if (out.particleNumParticles !== undefined) {
        const safe = Number.isFinite(out.particleNumParticles) ? out.particleNumParticles : 1
        out.particleNumParticles = Math.max(1, Math.min(1000000, Math.round(safe)))
    }
    if (out.particleMaxAge !== undefined) {
        const safe = Number.isFinite(out.particleMaxAge) ? out.particleMaxAge : 1
        out.particleMaxAge = Math.max(1, Math.min(255, Math.round(safe)))
    }
    if (out.particleSpeedFactor !== undefined) {
        const safe = Number.isFinite(out.particleSpeedFactor) ? out.particleSpeedFactor : 0
        out.particleSpeedFactor = Math.max(0, Math.min(50, safe))
    }
    if (out.particleWidth !== undefined) {
        const safe = Number.isFinite(out.particleWidth) ? out.particleWidth : 1
        out.particleWidth = Math.max(0.1, safe)
    }
    if (out.particleOpacity !== undefined) {
        const safe = Number.isFinite(out.particleOpacity) ? out.particleOpacity : 1
        out.particleOpacity = Math.max(0, Math.min(1, safe))
    }
    return out
}

// Persistence ---------------------------------------------------------------

const LAYER_SETTINGS_STORAGE_KEY = 'state-layer-settings-v1'
const LAYER_SETTINGS_STORAGE_VERSION = 1

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

const sanitizeBucket = <T extends object>(
    value: unknown,
    clamp: (partial: Partial<T>) => Partial<T>,
): Record<string, Partial<T>> => {
    const out: Record<string, Partial<T>> = {}
    if (!isRecord(value)) {
        return out
    }

    for (const [key, partial] of Object.entries(value)) {
        if (isRecord(partial)) {
            out[key] = clamp(partial as Partial<T>)
        }
    }
    return out
}

const sanitizeDefaults = (value: unknown): InternalState['defaults'] => {
    const defaults = isRecord(value) ? value : {}
    return {
        image: { ...DEFAULT_IMAGE, ...clampImage(defaults.image as Partial<PerLayerImageState>) },
        values: { ...DEFAULT_VALUES, ...clampValues(defaults.values as Partial<PerLayerValuesState>) },
        contour: { ...DEFAULT_CONTOUR, ...clampContour(defaults.contour as Partial<PerLayerContourState>) },
        contourGeoJson: {
            ...DEFAULT_CONTOUR_GEOJSON,
            ...clampContourGeoJson(defaults.contourGeoJson as Partial<PerLayerContourGeoJsonState>),
        },
        direction: { ...DEFAULT_DIRECTION, ...clampDirection(defaults.direction as Partial<PerLayerDirectionState>) },
        barb: { ...DEFAULT_BARB, ...clampBarb(defaults.barb as Partial<PerLayerBarbState>) },
        grade: { ...DEFAULT_GRADE, ...clampGrade(defaults.grade as Partial<PerLayerGradeState>) },
    }
}

const getInitialState = (fallback: InternalState = initialState): InternalState => {
    const stored = StorageService.get(LAYER_SETTINGS_STORAGE_KEY) as unknown
    if (!isRecord(stored) || stored.version !== LAYER_SETTINGS_STORAGE_VERSION) {
        return fallback
    }

    return {
        image: sanitizeBucket(stored.image, clampImage),
        values: sanitizeBucket(stored.values, clampValues),
        contour: sanitizeBucket(stored.contour, clampContour),
        contourGeoJson: sanitizeBucket(stored.contourGeoJson, clampContourGeoJson),
        direction: sanitizeBucket(stored.direction, clampDirection),
        barb: sanitizeBucket(stored.barb, clampBarb),
        grade: sanitizeBucket(stored.grade, clampGrade),
        global: {
            ...DEFAULT_GLOBAL,
            ...clampGlobal(isRecord(stored.global) ? stored.global : {}),
        },
        defaults: sanitizeDefaults(stored.defaults),
    }
}

const getPersistedState = (state: InternalState) => ({
    version: LAYER_SETTINGS_STORAGE_VERSION,
    image: state.image,
    values: state.values,
    contour: state.contour,
    contourGeoJson: state.contourGeoJson,
    direction: state.direction,
    barb: state.barb,
    grade: state.grade,
    global: state.global,
    defaults: state.defaults,
})

// Context value ------------------------------------------------------------

export interface LegacyLayerActions {
    setDensity: (density: number) => void
    resetDensity: () => void
    setLayout: (layout: 'squared' | 'staggered') => void
    resetLayout: () => void
    setTextColor: (color: RGBAColor) => void
    setTextSize: (size: number) => void
    resetTextSize: () => void
    setTextFontFamily: (fontFamily: string) => void
    resetTextFontFamily: () => void
    setTextDecimals: (decimals: number) => void
    resetTextDecimals: () => void
    setGridValuesEnabled: (enabled: boolean) => void
    setImageEnabled: (enabled: boolean) => void
    setImageSmoothing: (smoothing: number) => void
    setImageInterpolation: (interpolation: ImageInterpolationType) => void
    setImageMinValue: (value: number) => void
    setImageMaxValue: (value: number) => void
    setImageOpacity: (opacity: number) => void
    setContourEnabled: (enabled: boolean) => void
    setContourInterval: (interval: number) => void
    setContourMajorInterval: (majorInterval: number) => void
    setContourWidth: (width: number) => void
    setContourColor: (color: RGBAColor) => void
    setContourUsePalette: (usePalette: boolean) => void
    setContourOpacity: (opacity: number) => void
    setContourGeoJsonEnabled: (enabled: boolean) => void
    setParticleEnabled: (enabled: boolean) => void
    setParticleNumParticles: (numParticles: number) => void
    setParticleMaxAge: (maxAge: number) => void
    setParticleSpeedFactor: (speedFactor: number) => void
    setParticleWidth: (width: number) => void
    setParticleColor: (color: RGBAColor) => void
    setParticleUsePalette: (usePalette: boolean) => void
    setParticleOpacity: (opacity: number) => void
    setParticleAnimate: (animate: boolean) => void
    setImagePalette: (palette: string) => void
    setDirectionEnabled: (enabled: boolean) => void
    setDirectionDensity: (density: number) => void
    resetDirectionDensity: () => void
    setDirectionLayout: (layout: 'squared' | 'staggered') => void
    resetDirectionLayout: () => void
    setDirectionIconSize: (size: number) => void
    resetDirectionIconSize: () => void
    setDirectionIconColor: (color: RGBAColor) => void
    setDirectionIconUsePalette: (usePalette: boolean) => void
    setDirectionIconOpacity: (opacity: number) => void
    setBarbEnabled: (enabled: boolean) => void
    setBarbDensity: (density: number) => void
    resetBarbDensity: () => void
    setBarbLayout: (layout: 'squared' | 'staggered') => void
    resetBarbLayout: () => void
    setBarbIconSize: (size: number) => void
    resetBarbIconSize: () => void
    setBarbIconColor: (color: RGBAColor) => void
    setBarbIconUsePalette: (usePalette: boolean) => void
    setBarbIconOpacity: (opacity: number) => void
    setGradeEnabled: (enabled: boolean) => void
    setGradeTextColor: (color: RGBAColor) => void
    setGradeTextSize: (size: number) => void
    resetGradeTextSize: () => void
    setGradeRadius: (radius: number) => void
    resetGradeRadius: () => void
}

export interface LayerSettingsContextValue {
    /** Flat default-shaped state merged from current defaults + global. Kept
     * for backwards compatibility with consumers that only need defaults. */
    state: LayerSettingsState
    /** Legacy global-style actions; updates the defaults used for layers that
     * have not been individually configured. */
    actions: LegacyLayerActions

    /** Build the merged flat state for a specific layer (used by the composer). */
    getLayerState: (layer: LayerKeyInput) => LayerSettingsState
    /** Per-bucket reads. */
    getImageState: (layer: LayerKeyInput) => PerLayerImageState
    getValuesState: (layer: LayerKeyInput) => PerLayerValuesState
    getContourState: (layer: LayerKeyInput) => PerLayerContourState
    getContourGeoJsonState: (layer: LayerKeyInput) => PerLayerContourGeoJsonState
    getDirectionState: (layer: LayerKeyInput) => PerLayerDirectionState
    getBarbState: (layer: LayerKeyInput) => PerLayerBarbState
    getGradeState: (layer: LayerKeyInput) => PerLayerGradeState
    /** Whether a layer/rendering bucket already has user, restored, or applied config state. */
    hasLayerState: (layer: LayerKeyInput, rendering: ScopedRendering) => boolean
    /** Per-bucket writes. */
    setImageState: (layer: LayerKeyInput, partial: Partial<PerLayerImageState>) => void
    setValuesState: (layer: LayerKeyInput, partial: Partial<PerLayerValuesState>) => void
    setContourState: (layer: LayerKeyInput, partial: Partial<PerLayerContourState>) => void
    setContourGeoJsonState: (layer: LayerKeyInput, partial: Partial<PerLayerContourGeoJsonState>) => void
    setDirectionState: (layer: LayerKeyInput, partial: Partial<PerLayerDirectionState>) => void
    setBarbState: (layer: LayerKeyInput, partial: Partial<PerLayerBarbState>) => void
    setGradeState: (layer: LayerKeyInput, partial: Partial<PerLayerGradeState>) => void
}

const LayerSettingsContext = createContext<LayerSettingsContextValue | undefined>(undefined)

interface LayerSettingsProviderProps {
    children: ReactNode
}

export const LayerSettingsProvider: React.FC<LayerSettingsProviderProps> = ({ children }) => {
    const [internal, dispatch] = useReducer(reducer, initialState, getInitialState)

    useEffect(() => {
        StorageService.set(LAYER_SETTINGS_STORAGE_KEY, getPersistedState(internal))
    }, [internal])

    // Per-layer reads --------------------------------------------------------

    const getImageState = useCallback(
        (layer: LayerKeyInput): PerLayerImageState => {
            const key = getLayerSettingsKey(layer, 'IMAGE_V2')
            return { ...internal.defaults.image, ...(internal.image[key] ?? {}) }
        },
        [internal.defaults.image, internal.image]
    )

    const getValuesState = useCallback(
        (layer: LayerKeyInput): PerLayerValuesState => {
            const key = getLayerSettingsKey(layer, 'VALUES')
            return { ...internal.defaults.values, ...(internal.values[key] ?? {}) }
        },
        [internal.defaults.values, internal.values]
    )

    const getContourState = useCallback(
        (layer: LayerKeyInput): PerLayerContourState => {
            const key = getLayerSettingsKey(layer, 'CONTOURS')
            return { ...internal.defaults.contour, ...(internal.contour[key] ?? {}) }
        },
        [internal.defaults.contour, internal.contour]
    )

    const getContourGeoJsonState = useCallback(
        (layer: LayerKeyInput): PerLayerContourGeoJsonState => {
            const key = getLayerSettingsKey(layer, 'CONTOURGEOJSON')
            return { ...internal.defaults.contourGeoJson, ...(internal.contourGeoJson[key] ?? {}) }
        },
        [internal.defaults.contourGeoJson, internal.contourGeoJson]
    )

    const getDirectionState = useCallback(
        (layer: LayerKeyInput): PerLayerDirectionState => {
            const key = getLayerSettingsKey(layer, 'DIRECTIONS')
            return { ...internal.defaults.direction, ...(internal.direction[key] ?? {}) }
        },
        [internal.defaults.direction, internal.direction]
    )

    const getBarbState = useCallback(
        (layer: LayerKeyInput): PerLayerBarbState => {
            const key = getLayerSettingsKey(layer, 'BARBS')
            return { ...internal.defaults.barb, ...(internal.barb[key] ?? {}) }
        },
        [internal.defaults.barb, internal.barb]
    )

    const getGradeState = useCallback(
        (layer: LayerKeyInput): PerLayerGradeState => {
            const key = getLayerSettingsKey(layer, 'GRADES')
            return { ...internal.defaults.grade, ...(internal.grade[key] ?? {}) }
        },
        [internal.defaults.grade, internal.grade]
    )

    const getLayerState = useCallback(
        (layer: LayerKeyInput): LayerSettingsState => {
            return {
                ...internal.defaults.image,
                ...internal.defaults.values,
                ...internal.defaults.contour,
                ...internal.defaults.contourGeoJson,
                ...internal.defaults.direction,
                ...internal.defaults.barb,
                ...internal.defaults.grade,
                ...internal.global,
                ...(internal.image[getLayerSettingsKey(layer, 'IMAGE_V2')] ?? {}),
                ...(internal.values[getLayerSettingsKey(layer, 'VALUES')] ?? {}),
                ...(internal.contour[getLayerSettingsKey(layer, 'CONTOURS')] ?? {}),
                ...(internal.contourGeoJson[getLayerSettingsKey(layer, 'CONTOURGEOJSON')] ?? {}),
                ...(internal.direction[getLayerSettingsKey(layer, 'DIRECTIONS')] ?? {}),
                ...(internal.barb[getLayerSettingsKey(layer, 'BARBS')] ?? {}),
                ...(internal.grade[getLayerSettingsKey(layer, 'GRADES')] ?? {}),
            }
        },
        [
            internal.defaults.image,
            internal.defaults.values,
            internal.defaults.contour,
            internal.defaults.contourGeoJson,
            internal.defaults.direction,
            internal.defaults.barb,
            internal.defaults.grade,
            internal.global,
            internal.image,
            internal.values,
            internal.contour,
            internal.contourGeoJson,
            internal.direction,
            internal.barb,
            internal.grade,
        ]
    )

    const hasLayerState = useCallback(
        (layer: LayerKeyInput, rendering: ScopedRendering): boolean => {
            const key = getLayerSettingsKey(layer, rendering)
            switch (rendering) {
                case 'IMAGE_V2':
                    return internal.image[key] !== undefined
                case 'VALUES':
                    return internal.values[key] !== undefined
                case 'CONTOURS':
                    return internal.contour[key] !== undefined
                case 'CONTOURGEOJSON':
                    return internal.contourGeoJson[key] !== undefined
                case 'DIRECTIONS':
                    return internal.direction[key] !== undefined
                case 'BARBS':
                    return internal.barb[key] !== undefined
                case 'GRADES':
                    return internal.grade[key] !== undefined
                default:
                    return false
            }
        },
        [internal.image, internal.values, internal.contour, internal.contourGeoJson, internal.direction, internal.barb, internal.grade]
    )

    // Per-layer writes -------------------------------------------------------

    const setImageState = useCallback((layer: LayerKeyInput, partial: Partial<PerLayerImageState>) => {
        const key = getLayerSettingsKey(layer, 'IMAGE_V2')
        dispatch({ type: 'image', key, partial: clampImage(partial) })
    }, [])

    const setValuesState = useCallback((layer: LayerKeyInput, partial: Partial<PerLayerValuesState>) => {
        const key = getLayerSettingsKey(layer, 'VALUES')
        dispatch({ type: 'values', key, partial: clampValues(partial) })
    }, [])

    const setContourState = useCallback((layer: LayerKeyInput, partial: Partial<PerLayerContourState>) => {
        const key = getLayerSettingsKey(layer, 'CONTOURS')
        dispatch({ type: 'contour', key, partial: clampContour(partial) })
    }, [])

    const setContourGeoJsonState = useCallback((layer: LayerKeyInput, partial: Partial<PerLayerContourGeoJsonState>) => {
        const key = getLayerSettingsKey(layer, 'CONTOURGEOJSON')
        dispatch({ type: 'contourGeoJson', key, partial: clampContourGeoJson(partial) })
    }, [])

    const setDirectionState = useCallback((layer: LayerKeyInput, partial: Partial<PerLayerDirectionState>) => {
        const key = getLayerSettingsKey(layer, 'DIRECTIONS')
        dispatch({ type: 'direction', key, partial: clampDirection(partial) })
    }, [])

    const setBarbState = useCallback((layer: LayerKeyInput, partial: Partial<PerLayerBarbState>) => {
        const key = getLayerSettingsKey(layer, 'BARBS')
        dispatch({ type: 'barb', key, partial: clampBarb(partial) })
    }, [])

    const setGradeState = useCallback((layer: LayerKeyInput, partial: Partial<PerLayerGradeState>) => {
        const key = getLayerSettingsKey(layer, 'GRADES')
        dispatch({ type: 'grade', key, partial: clampGrade(partial) })
    }, [])

    // Legacy global-style actions: write to defaults / global ----------------

    const actions = useMemo<LegacyLayerActions>(() => ({
        setDensity: (v) => dispatch({ type: 'defaultValues', partial: clampValues({ density: v }) }),
        resetDensity: () => dispatch({ type: 'defaultValues', partial: { density: DEFAULT_VALUES.density } }),
        setLayout: (v) => dispatch({ type: 'defaultValues', partial: { layout: v } }),
        resetLayout: () => dispatch({ type: 'defaultValues', partial: { layout: 'staggered' } }),
        setTextColor: (v) => dispatch({ type: 'defaultValues', partial: { textColor: v } }),
        setTextSize: (v) => dispatch({ type: 'defaultValues', partial: clampValues({ textSize: v }) }),
        resetTextSize: () => dispatch({ type: 'defaultValues', partial: { textSize: DEFAULT_VALUES.textSize } }),
        setTextFontFamily: (v) => dispatch({ type: 'defaultValues', partial: { textFontFamily: v } }),
        resetTextFontFamily: () => dispatch({ type: 'defaultValues', partial: { textFontFamily: DEFAULT_VALUES.textFontFamily } }),
        setTextDecimals: (v) => dispatch({ type: 'defaultValues', partial: clampValues({ textDecimals: v }) }),
        resetTextDecimals: () => dispatch({ type: 'defaultValues', partial: { textDecimals: DEFAULT_VALUES.textDecimals } }),
        setGridValuesEnabled: (v) => dispatch({ type: 'defaultValues', partial: { gridValuesEnabled: v } }),
        setImageEnabled: (v) => dispatch({ type: 'defaultImage', partial: { imageEnabled: v } }),
        setImageSmoothing: (v) => dispatch({ type: 'defaultImage', partial: clampImage({ imageSmoothing: v }) }),
        setImageInterpolation: (v) => dispatch({ type: 'defaultImage', partial: clampImage({ imageInterpolation: v }) }),
        setImageMinValue: (v) => dispatch({ type: 'defaultImage', partial: clampImage({ imageMinValue: v }) }),
        setImageMaxValue: (v) => dispatch({ type: 'defaultImage', partial: clampImage({ imageMaxValue: v }) }),
        setImageOpacity: (v) => dispatch({ type: 'defaultImage', partial: clampImage({ imageOpacity: v }) }),
        setImagePalette: (v) => dispatch({ type: 'defaultImage', partial: { imagePalette: v } }),
        setContourEnabled: (v) => dispatch({ type: 'defaultContour', partial: { contourEnabled: v } }),
        setContourInterval: (v) => dispatch({ type: 'defaultContour', partial: clampContour({ contourInterval: v }) }),
        setContourMajorInterval: (v) => dispatch({ type: 'defaultContour', partial: clampContour({ contourMajorInterval: v }) }),
        setContourWidth: (v) => dispatch({ type: 'defaultContour', partial: clampContour({ contourWidth: v }) }),
        setContourColor: (v) => dispatch({ type: 'defaultContour', partial: { contourColor: v } }),
        setContourUsePalette: (v) => dispatch({ type: 'defaultContour', partial: { contourUsePalette: v } }),
        setContourOpacity: (v) => dispatch({ type: 'defaultContour', partial: clampContour({ contourOpacity: v }) }),
        setContourGeoJsonEnabled: (v) => dispatch({ type: 'defaultContourGeoJson', partial: { contourGeoJsonEnabled: v } }),
        setParticleEnabled: (v) => dispatch({ type: 'global', partial: { particleEnabled: v } }),
        setParticleNumParticles: (v) => dispatch({ type: 'global', partial: clampGlobal({ particleNumParticles: v }) }),
        setParticleMaxAge: (v) => dispatch({ type: 'global', partial: clampGlobal({ particleMaxAge: v }) }),
        setParticleSpeedFactor: (v) => dispatch({ type: 'global', partial: clampGlobal({ particleSpeedFactor: v }) }),
        setParticleWidth: (v) => dispatch({ type: 'global', partial: clampGlobal({ particleWidth: v }) }),
        setParticleColor: (v) => dispatch({ type: 'global', partial: { particleColor: v } }),
        setParticleUsePalette: (v) => dispatch({ type: 'global', partial: { particleUsePalette: v } }),
        setParticleOpacity: (v) => dispatch({ type: 'global', partial: clampGlobal({ particleOpacity: v }) }),
        setParticleAnimate: (v) => dispatch({ type: 'global', partial: { particleAnimate: v } }),
        setDirectionEnabled: (v) => dispatch({ type: 'defaultDirection', partial: { directionEnabled: v } }),
        setDirectionDensity: (v) => dispatch({ type: 'defaultDirection', partial: clampDirection({ directionDensity: v }) }),
        resetDirectionDensity: () => dispatch({ type: 'defaultDirection', partial: { directionDensity: DEFAULT_DIRECTION.directionDensity } }),
        setDirectionLayout: (v) => dispatch({ type: 'defaultDirection', partial: { directionLayout: v } }),
        resetDirectionLayout: () => dispatch({ type: 'defaultDirection', partial: { directionLayout: DEFAULT_DIRECTION.directionLayout } }),
        setDirectionIconSize: (v) => dispatch({ type: 'defaultDirection', partial: clampDirection({ directionIconSize: v }) }),
        resetDirectionIconSize: () => dispatch({ type: 'defaultDirection', partial: { directionIconSize: DEFAULT_DIRECTION.directionIconSize } }),
        setDirectionIconColor: (v) => dispatch({ type: 'defaultDirection', partial: { directionIconColor: v } }),
        setDirectionIconUsePalette: (v) => dispatch({ type: 'defaultDirection', partial: { directionIconUsePalette: v } }),
        setDirectionIconOpacity: (v) => dispatch({ type: 'defaultDirection', partial: clampDirection({ directionIconOpacity: v }) }),
        setBarbEnabled: (v) => dispatch({ type: 'defaultBarb', partial: { barbEnabled: v } }),
        setBarbDensity: (v) => dispatch({ type: 'defaultBarb', partial: clampBarb({ barbDensity: v }) }),
        resetBarbDensity: () => dispatch({ type: 'defaultBarb', partial: { barbDensity: DEFAULT_BARB.barbDensity } }),
        setBarbLayout: (v) => dispatch({ type: 'defaultBarb', partial: { barbLayout: v } }),
        resetBarbLayout: () => dispatch({ type: 'defaultBarb', partial: { barbLayout: DEFAULT_BARB.barbLayout } }),
        setBarbIconSize: (v) => dispatch({ type: 'defaultBarb', partial: clampBarb({ barbIconSize: v }) }),
        resetBarbIconSize: () => dispatch({ type: 'defaultBarb', partial: { barbIconSize: DEFAULT_BARB.barbIconSize } }),
        setBarbIconColor: (v) => dispatch({ type: 'defaultBarb', partial: { barbIconColor: v } }),
        setBarbIconUsePalette: (v) => dispatch({ type: 'defaultBarb', partial: { barbIconUsePalette: v } }),
        setBarbIconOpacity: (v) => dispatch({ type: 'defaultBarb', partial: clampBarb({ barbIconOpacity: v }) }),
        setGradeEnabled: (v) => dispatch({ type: 'defaultGrade', partial: { gradeEnabled: v } }),
        setGradeTextColor: (v) => dispatch({ type: 'defaultGrade', partial: { gradeTextColor: v } }),
        setGradeTextSize: (v) => dispatch({ type: 'defaultGrade', partial: clampGrade({ gradeTextSize: v }) }),
        resetGradeTextSize: () => dispatch({ type: 'defaultGrade', partial: { gradeTextSize: DEFAULT_GRADE.gradeTextSize } }),
        setGradeRadius: (v) => dispatch({ type: 'defaultGrade', partial: clampGrade({ gradeRadius: v }) }),
        resetGradeRadius: () => dispatch({ type: 'defaultGrade', partial: { gradeRadius: DEFAULT_GRADE.gradeRadius } }),
    }), [])

    const state = useMemo<LayerSettingsState>(() => ({
        ...internal.defaults.image,
        ...internal.defaults.values,
        ...internal.defaults.contour,
        ...internal.defaults.contourGeoJson,
        ...internal.defaults.direction,
        ...internal.defaults.barb,
        ...internal.defaults.grade,
        ...internal.global,
    }), [internal.defaults.image, internal.defaults.values, internal.defaults.contour, internal.defaults.contourGeoJson, internal.defaults.direction, internal.defaults.barb, internal.defaults.grade, internal.global])

    const value = useMemo<LayerSettingsContextValue>(() => ({
        state,
        actions,
        getLayerState,
        getImageState,
        getValuesState,
        getContourState,
        getContourGeoJsonState,
        getDirectionState,
        getBarbState,
        getGradeState,
        hasLayerState,
        setImageState,
        setValuesState,
        setContourState,
        setContourGeoJsonState,
        setDirectionState,
        setBarbState,
        setGradeState,
    }), [state, actions, getLayerState, getImageState, getValuesState, getContourState, getContourGeoJsonState, getDirectionState, getBarbState, getGradeState, hasLayerState, setImageState, setValuesState, setContourState, setContourGeoJsonState, setDirectionState, setBarbState, setGradeState])

    return (
        <LayerSettingsContext.Provider value={value}>
            {children}
        </LayerSettingsContext.Provider>
    )
}

// Hooks --------------------------------------------------------------------

export const useLayerSettings = (): LayerSettingsContextValue => {
    const context = useContext(LayerSettingsContext)
    if (context === undefined) {
        throw new Error('useLayerSettings must be used within a LayerSettingsProvider')
    }
    return context
}

/**
 * Convenience hook returning per-layer image settings together with bound
 * setter actions. Used by ImageSettings to read/write only the active layer's
 * image-bucket state.
 */
export const useImageSettingsFor = (layer: LayerKeyInput) => {
    const ctx = useLayerSettings()
    const state = ctx.getImageState(layer)
    const actions = useMemo(() => ({
        setImageEnabled: (v: boolean) => ctx.setImageState(layer, { imageEnabled: v }),
        setImageSmoothing: (v: number) => ctx.setImageState(layer, { imageSmoothing: v }),
        setImageInterpolation: (v: ImageInterpolationType) => ctx.setImageState(layer, { imageInterpolation: v }),
        setImageMinValue: (v: number) => ctx.setImageState(layer, { imageMinValue: v }),
        setImageMaxValue: (v: number) => ctx.setImageState(layer, { imageMaxValue: v }),
        setImageOpacity: (v: number) => ctx.setImageState(layer, { imageOpacity: v }),
        setImagePalette: (v: string) => ctx.setImageState(layer, { imagePalette: v }),
    }), [ctx, layer])
    return { state, actions }
}

/**
 * Convenience hook returning per-layer values (grid) settings.
 */
export const useValuesSettingsFor = (layer: LayerKeyInput) => {
    const ctx = useLayerSettings()
    const state = ctx.getValuesState(layer)
    const actions = useMemo(() => ({
        setGridValuesEnabled: (v: boolean) => ctx.setValuesState(layer, { gridValuesEnabled: v }),
        setDensity: (v: number) => ctx.setValuesState(layer, { density: v }),
        resetDensity: () => ctx.setValuesState(layer, { density: DEFAULT_VALUES.density }),
        setLayout: (v: 'squared' | 'staggered') => ctx.setValuesState(layer, { layout: v }),
        resetLayout: () => ctx.setValuesState(layer, { layout: 'staggered' }),
        setTextColor: (v: RGBAColor) => ctx.setValuesState(layer, { textColor: v }),
        setTextSize: (v: number) => ctx.setValuesState(layer, { textSize: v }),
        resetTextSize: () => ctx.setValuesState(layer, { textSize: DEFAULT_VALUES.textSize }),
        setTextFontFamily: (v: string) => ctx.setValuesState(layer, { textFontFamily: v }),
        resetTextFontFamily: () => ctx.setValuesState(layer, { textFontFamily: DEFAULT_VALUES.textFontFamily }),
        setTextDecimals: (v: number) => ctx.setValuesState(layer, { textDecimals: v }),
        resetTextDecimals: () => ctx.setValuesState(layer, { textDecimals: DEFAULT_VALUES.textDecimals }),
    }), [ctx, layer])
    return { state, actions }
}

/**
 * Convenience hook returning per-layer contour settings.
 */
export const useContourSettingsFor = (layer: LayerKeyInput) => {
    const ctx = useLayerSettings()
    const state = ctx.getContourState(layer)
    const actions = useMemo(() => ({
        setContourEnabled: (v: boolean) => ctx.setContourState(layer, { contourEnabled: v }),
        setContourInterval: (v: number) => ctx.setContourState(layer, { contourInterval: v }),
        setContourMajorInterval: (v: number) => ctx.setContourState(layer, { contourMajorInterval: v }),
        setContourWidth: (v: number) => ctx.setContourState(layer, { contourWidth: v }),
        setContourColor: (v: RGBAColor) => ctx.setContourState(layer, { contourColor: v }),
        setContourUsePalette: (v: boolean) => ctx.setContourState(layer, { contourUsePalette: v }),
        setContourOpacity: (v: number) => ctx.setContourState(layer, { contourOpacity: v }),
    }), [ctx, layer])
    return { state, actions }
}

/**
 * Convenience hook returning per-layer GeoJSON contour settings.
 */
export const useContourGeoJsonSettingsFor = (layer: LayerKeyInput) => {
    const ctx = useLayerSettings()
    const state = ctx.getContourGeoJsonState(layer)
    const actions = useMemo(() => ({
        setContourGeoJsonEnabled: (v: boolean) => {
            ctx.setContourGeoJsonState(layer, { contourGeoJsonEnabled: v })
        },
        setContourGeoJsonInterval: (v: number) => {
            ctx.setContourGeoJsonState(layer, { contourGeoJsonInterval: v })
        },
        setContourGeoJsonLineWidth: (v: number) => {
            ctx.setContourGeoJsonState(layer, { contourGeoJsonLineWidth: v })
        },
        setContourGeoJsonSmoothing: (v: number) => {
            ctx.setContourGeoJsonState(layer, { contourGeoJsonSmoothing: v })
        },
        setContourGeoJsonLabelRotation: (v: boolean) => {
            ctx.setContourGeoJsonState(layer, { contourGeoJsonLabelRotation: v })
        },
        setContourGeoJsonColorMode: (v: LayerContourGeoJsonColorMode) => {
            ctx.setContourGeoJsonState(layer, { contourGeoJsonColorMode: v })
        },
        setContourGeoJsonColor: (v: RGBAColor) => {
            ctx.setContourGeoJsonState(layer, { contourGeoJsonColor: v })
        },
        setContourGeoJsonLabelColorMode: (v: LayerContourGeoJsonLabelColorMode) => {
            ctx.setContourGeoJsonState(layer, { contourGeoJsonLabelColorMode: v })
        },
        setContourGeoJsonLabelColor: (v: RGBAColor) => {
            ctx.setContourGeoJsonState(layer, { contourGeoJsonLabelColor: v })
        },
    }), [ctx, layer])
    return { state, actions }
}

/**
 * Convenience hook returning per-layer direction settings.
 */
export const useDirectionSettingsFor = (layer: LayerKeyInput) => {
    const ctx = useLayerSettings()
    const state = ctx.getDirectionState(layer)
    const actions = useMemo(() => ({
        setDirectionEnabled: (v: boolean) => ctx.setDirectionState(layer, { directionEnabled: v }),
        setDirectionDensity: (v: number) => ctx.setDirectionState(layer, { directionDensity: v }),
        resetDirectionDensity: () => ctx.setDirectionState(layer, { directionDensity: DEFAULT_DIRECTION.directionDensity }),
        setDirectionLayout: (v: 'squared' | 'staggered') => ctx.setDirectionState(layer, { directionLayout: v }),
        resetDirectionLayout: () => ctx.setDirectionState(layer, { directionLayout: DEFAULT_DIRECTION.directionLayout }),
        setDirectionIconSize: (v: number) => ctx.setDirectionState(layer, { directionIconSize: v }),
        resetDirectionIconSize: () => ctx.setDirectionState(layer, { directionIconSize: DEFAULT_DIRECTION.directionIconSize }),
        setDirectionIconColor: (v: RGBAColor) => ctx.setDirectionState(layer, { directionIconColor: v }),
        setDirectionIconUsePalette: (v: boolean) => ctx.setDirectionState(layer, { directionIconUsePalette: v }),
        setDirectionIconOpacity: (v: number) => ctx.setDirectionState(layer, { directionIconOpacity: v }),
    }), [ctx, layer])
    return { state, actions }
}

/**
 * Convenience hook returning per-layer barb settings.
 */
export const useBarbSettingsFor = (layer: LayerKeyInput) => {
    const ctx = useLayerSettings()
    const state = ctx.getBarbState(layer)
    const actions = useMemo(() => ({
        setBarbEnabled: (v: boolean) => ctx.setBarbState(layer, { barbEnabled: v }),
        setBarbDensity: (v: number) => ctx.setBarbState(layer, { barbDensity: v }),
        resetBarbDensity: () => ctx.setBarbState(layer, { barbDensity: DEFAULT_BARB.barbDensity }),
        setBarbLayout: (v: 'squared' | 'staggered') => ctx.setBarbState(layer, { barbLayout: v }),
        resetBarbLayout: () => ctx.setBarbState(layer, { barbLayout: DEFAULT_BARB.barbLayout }),
        setBarbIconSize: (v: number) => ctx.setBarbState(layer, { barbIconSize: v }),
        resetBarbIconSize: () => ctx.setBarbState(layer, { barbIconSize: DEFAULT_BARB.barbIconSize }),
        setBarbIconColor: (v: RGBAColor) => ctx.setBarbState(layer, { barbIconColor: v }),
        setBarbIconUsePalette: (v: boolean) => ctx.setBarbState(layer, { barbIconUsePalette: v }),
        setBarbIconOpacity: (v: number) => ctx.setBarbState(layer, { barbIconOpacity: v }),
    }), [ctx, layer])
    return { state, actions }
}

/**
 * Convenience hook returning per-layer weather grade settings.
 */
export const useGradeSettingsFor = (layer: LayerKeyInput) => {
    const ctx = useLayerSettings()
    const state = ctx.getGradeState(layer)
    const actions = useMemo(() => ({
        setGradeEnabled: (v: boolean) => ctx.setGradeState(layer, { gradeEnabled: v }),
        setGradeTextColor: (v: RGBAColor) => ctx.setGradeState(layer, { gradeTextColor: v }),
        setGradeTextSize: (v: number) => ctx.setGradeState(layer, { gradeTextSize: v }),
        resetGradeTextSize: () => ctx.setGradeState(layer, { gradeTextSize: DEFAULT_GRADE.gradeTextSize }),
        setGradeRadius: (v: number) => ctx.setGradeState(layer, { gradeRadius: v }),
        resetGradeRadius: () => ctx.setGradeState(layer, { gradeRadius: DEFAULT_GRADE.gradeRadius }),
    }), [ctx, layer])
    return { state, actions }
}

export { LayerSettingsContext, DEFAULT_FLAT as DEFAULT_LAYER_SETTINGS_STATE }
