import { MapLayer } from '@/@types/weather.types'

export interface TemplateParams {
    model?: string
    run?: string
    period?: string
    element?: string
    level?: string
    unit?: string
    member?: string
    grayscale?: boolean | null
    palette?: string
}

export interface ViewportParams {
    zoom: number
    bounds: {
        north: number
        south: number
        east: number
        west: number
    }
}

export type ApiEnv = 'prod' | 'test'
export type ConnectionType = 'forecast' | 'nowcast' | 'tropicalweather' | 'observation'
export const DEFAULT_API_ENV: ApiEnv = 'prod'
export const API_ENVS: readonly ApiEnv[] = ['prod', 'test']

export function resolveApiEnv(apiEnv: unknown): ApiEnv {
    return API_ENVS.includes(apiEnv as ApiEnv) ? (apiEnv as ApiEnv) : DEFAULT_API_ENV
}

export interface ConnectionConfig {
    apiEnv?: ApiEnv
}

export default abstract class Connection {
    protected config: Required<ConnectionConfig> = { apiEnv: DEFAULT_API_ENV }
    abstract get server(): string | null
    abstract get layers(): string
    abstract getTemplateUrl(): string
    abstract resolveParams({ layer, modelInfo, layersInfo }: any): TemplateParams
    abstract resolveTimestamps({ layer, modelInfo, layersInfo }: any): number[]
    abstract getTextures(
        layer: MapLayer,
        ts: number | undefined | null,
        textureLoadMode: string,
        options?: { signal?: AbortSignal },
    ): Promise<Record<string, any> | undefined>

    setApiEnv(apiEnv: ApiEnv): void {
        this.config.apiEnv = apiEnv
    }

    resolveTemplateUrl(params: TemplateParams): string {
        let url = this.getTemplateUrl()

        const replacements: [string, string][] = [
            ['{model}', params.model ?? ''],
            ['{run}', params.run ?? ''],
            ['{period}', params.period ?? ''],
            ['{element}', params.element ?? ''],
            ['{member}', params.member ? `&member=${params.member}` : ''],
            ['{level}', params.level ? `&level=${params.level}` : ''],
            ['{unit}', params.unit ? `&unit=${encodeURIComponent(params.unit)}` : ''],
            ['{grayscale}', params.grayscale != null ? `&grayscale=${params.grayscale}` : ''],
        ]

        for (const [token, value] of replacements) {
            url = url.replace(token, value)
        }

        if (params.palette) {
            url += `&palette=${params.palette}`
        }

        return url
    }

    resolveViewportUrl(templateUrl: string, viewport: ViewportParams): string {
        const { zoom, bounds } = viewport
        return templateUrl
            .replace('{zoom}', String(zoom))
            .replace('{ne.lat}', String(bounds.north.toFixed(2)))
            .replace('{ne.lng}', String(bounds.east.toFixed(2)))
            .replace('{sw.lat}', String(bounds.south.toFixed(2)))
            .replace('{sw.lng}', String(bounds.west.toFixed(2)))
    }

    buildUrl(params: TemplateParams & { viewport?: ViewportParams }): string {
        const { viewport, ...templateParams } = params
        let url = this.resolveTemplateUrl(templateParams)

        if (viewport) {
            url = this.resolveViewportUrl(url, viewport)
        }

        return url
    }
}
