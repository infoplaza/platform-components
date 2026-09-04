import { PrecipitationTypeMembers } from '../../grades'
import type { EnsembleRow } from '../../types'
import { valueMapper } from './helper'

export function precipitationTypeAdapter({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  return mapDataPrecipitationTypeMembers({
    data,
    grade: PrecipitationTypeMembers,
  })
}

export function mapDataPrecipitationTypeMembers({
  data,
  grade,
}: {
  data: EnsembleRow[]
  grade: typeof PrecipitationTypeMembers
}): EnsembleRow[] {
  return data.map((entry) => {
    const gradeResults = valueMapper({
      grade,
      values: entry.metadata.rawValue,
    })
    return {
      ...gradeResults,
      datetime: entry.datetime,
      metadata: entry.metadata,
      ...(entry.debug ? { debug: entry.debug } : {}),
    }
  })
}
