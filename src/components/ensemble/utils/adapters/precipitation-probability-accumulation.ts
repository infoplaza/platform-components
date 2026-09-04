import { PrecipitationProbabilityMembers } from '../../grades'
import type { EnsembleRow } from '../../types'
import {
  aggregator,
  differenceFromPreviousCalculation,
  gradeMapper,
} from './helper'

export function precipitationProbabilityAccumulationAdapter({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  const dataDiff = differenceFromPreviousCalculation({ data })
  const aggregatedData = aggregator(dataDiff, 'hour', 6)
  return mapDataPrecipitationProbabilityAccumulationMembers({
    data: aggregatedData,
    grade: PrecipitationProbabilityMembers,
  })
}

export function precipitationProbabilityAccumulationExpertAdapter({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  const dataDiff = differenceFromPreviousCalculation({ data })
  return aggregator(dataDiff, 'hour', 6)
}

export function mapDataPrecipitationProbabilityAccumulationMembers({
  data,
  grade,
}: {
  data: EnsembleRow[]
  grade: typeof PrecipitationProbabilityMembers
}): EnsembleRow[] {
  return data.map((entry) => {
    const gradeResults = gradeMapper({
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
