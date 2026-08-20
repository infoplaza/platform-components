import type { LayerGroup } from '@/@types/layer.types'

/**
 * Geographic bounds reported by the upstream `/models` endpoint for a model.
 */
export interface ModelBoundingBox {
  north: number
  west: number
  south: number
  east: number
}

/**
 * A single element (parameter) exposed by a model, as returned by the upstream
 * `/models` endpoint.
 */
export interface ModelElement {
  id: string
  name: string
  /** Default unit for the element. Absent for elements without units (e.g. wind vector). */
  unitDefault?: string
  units: string[]
  levels: string[]
}

/**
 * Raw model as returned by the upstream `/models` endpoint, before enrichment.
 */
export interface RawModel {
  id: string
  name: string
  beta: boolean
  institute: string
  resolution: string
  region: string
  regionCategory: string
  type: string
  category: string
  runtimeLast: number
  runtimes: number[]
  runtimesHours: number[]
  sequence: string
  maxzoom: number
  boundingbox: ModelBoundingBox
  elements: ModelElement[]
}

/**
 * A `RawModel` enriched with a `slug` and the computed `elementGroups`
 * collection derived from the FORECAST config.
 */
export interface TransformedModel extends RawModel {
  slug: string
  elementGroups: LayerGroup[]
}
