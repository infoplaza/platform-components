import { WindDirectionChanceGrade } from '../../grades'
import type { EnsembleRow } from '../../types'
import { gradeMapper } from './helper'

export function windDirectionChanceAdapter({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  return mapDataWindDirectionChanceGrade({ data })
}

export function mapDataWindDirectionChanceGrade({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  return data.map((entry) => {
    const gradeResults = gradeMapper({
      grade: WindDirectionChanceGrade,
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
