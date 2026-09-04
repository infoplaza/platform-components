import { PrecipitationProbabilityMembers } from '../../grades'
import type { EnsembleRow } from '../../types'
import { gradeMapper } from './helper'

export function precipitationProbabilityAdapter({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  return mapDataPrecipitationProbabilityMembers({ data })
}

export function mapDataPrecipitationProbabilityMembers({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  return data.map((entry) => {
    const gradeResults = gradeMapper({
      grade: PrecipitationProbabilityMembers,
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
