import {
  BeaufortScale,
  supportedUnits,
  type WindspeedUnit,
} from '../../../grades'
import type { EnsembleRow } from '../../../types'
import { getMinMaxValues } from '../graph'

const WIND_SLUGS = ['overview_windspeed', 'wind_windspeed', 'wave_windspeed']

export function isWindSlug(slug: string | undefined): boolean {
  return Boolean(slug && WIND_SLUGS.includes(slug))
}

export function getBeaufortScalesInRange(
  min: number,
  max: number,
  unit: string,
) {
  if (!supportedUnits.includes(unit as WindspeedUnit)) {
    return null
  }

  const matching = BeaufortScale.filter((scale) => {
    const windspeed = scale.windspeed[unit as WindspeedUnit]
    if (!windspeed) return false
    const scaleMin = Number(windspeed.min)
    const scaleMax = windspeed.max === null ? Infinity : Number(windspeed.max)
    return scaleMin <= max + 5 || scaleMax <= max + 5
  })

  return matching.map((scale, index, array) => ({
    scale: scale.scale,
    name: scale.name,
    color: scale.color,
    unit,
    min: scale.windspeed[unit as WindspeedUnit].min,
    max:
      index === array.length - 1
        ? String(Math.floor(max) + 4)
        : scale.windspeed[unit as WindspeedUnit].max === null
          ? String(Math.floor(max) + 5)
          : scale.windspeed[unit as WindspeedUnit].max,
  }))
}

function getBftTicks(rows: EnsembleRow[], unit: string, modelApi?: string) {
  const { minValue, maxValue } = getMinMaxValues(rows, modelApi)
  return getBeaufortScalesInRange(minValue, maxValue, unit)
}

export function getBftConfig(props: {
  slug?: string
  rows?: EnsembleRow[]
  unit?: string
  modelApi?: string
}) {
  const { slug, rows = [], unit = 'm/s', modelApi } = props
  if (!isWindSlug(slug)) {
    return {}
  }

  const bftTicks = getBftTicks(rows, unit, modelApi) ?? []
  const highestMax = Math.max(
    ...bftTicks.map((item) => parseFloat(String(item.max))),
  )

  return {
    yAxis: {
      domain: [0, highestMax],
    },
    reference: {
      enableBFTLines: bftTicks,
    },
  }
}
