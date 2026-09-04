import { TotalCloudCoverageGrade } from '../../grades'
import type { EnsembleRow } from '../../types'
import { gradeMapper } from './helper'

export function totalCloudCoverageAdapter({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  return mapDataTotalCloudCoverageGrade({ data })
}

export function mapDataTotalCloudCoverageGrade({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  return data.map((entry) => {
    const gradeResults = gradeMapper({
      grade: TotalCloudCoverageGrade,
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
