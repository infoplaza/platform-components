import { ProbabilityOverviewMembers } from '../../grades'
import type { EnsembleRow } from '../../types'
import { gradeMapper } from './helper'

export function frostProbabilityOverviewAdapter({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  return mapDataFrostProbabilityOverviewMembers({
    data,
    grade: ProbabilityOverviewMembers,
  })
}

export function mapDataFrostProbabilityOverviewMembers({
  data,
  grade,
}: {
  data: EnsembleRow[]
  grade: typeof ProbabilityOverviewMembers
}): EnsembleRow[] {
  return data.map((entry) => {
    const gradeResults = gradeMapper({
      grade,
      values: entry.metadata.rawValue,
      inclusiveMax: false,
    })
    return {
      ...gradeResults,
      datetime: entry.datetime,
      metadata: entry.metadata,
      ...(entry.debug ? { debug: entry.debug } : {}),
    }
  })
}
