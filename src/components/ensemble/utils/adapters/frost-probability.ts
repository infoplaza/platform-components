import {
  FrostMaxProbabilityMembers,
  FrostMinProbabilityMembers,
} from '../../grades'
import type { EnsembleRow } from '../../types'
import { aggregator, gradeMapper } from './helper'

function removeSequence1Data(data: EnsembleRow[]): EnsembleRow[] {
  return data.filter((entry) => entry.metadata.offset !== 0)
}

export function mapDataFrostProbabilityMembers({
  data,
  grade,
}: {
  data: EnsembleRow[]
  grade: typeof FrostMinProbabilityMembers
}): EnsembleRow[] {
  return data.map((entry) => {
    const gradeResults = gradeMapper({ grade, values: entry.metadata.rawValue })
    return {
      ...gradeResults,
      datetime: entry.datetime,
      metadata: entry.metadata,
      ...(entry.debug ? { debug: entry.debug } : {}),
    }
  })
}

export function dataCorrection({
  dailyData,
  key,
}: {
  dailyData: Record<string, EnsembleRow[]>
  key: string
}): EnsembleRow[] {
  return Object.keys(dailyData).map((date) => {
    const entries = dailyData[date]
    const maxEntry = entries.reduce((max, entry) => {
      const currentValue = (entry[key] as number | undefined) ?? -Infinity
      const maxValue = (max[key] as number | undefined) ?? -Infinity
      return currentValue > maxValue ? entry : max
    }, entries[0])
    return {
      [key]: maxEntry[key],
      datetime: date,
      metadata: maxEntry.metadata,
      ...(maxEntry.debug ? { debug: maxEntry.debug } : {}),
    }
  })
}

export function frostMinProbabilityAdapter(props: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  const data = removeSequence1Data(props.data)
  const mappedData = mapDataFrostProbabilityMembers({
    data,
    grade: FrostMinProbabilityMembers,
  })
  const dailyData = aggregator(mappedData, 'daily')
  return dataCorrection({ dailyData, key: 'minimum_temperature_lt_0' })
}

export function frostMaxProbabilityAdapter({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  const sequenceData = removeSequence1Data(data)
  const dailyData = aggregator(sequenceData, 'daily')

  return Object.keys(dailyData)
    .sort()
    .map((date) => {
      const dayEntries = dailyData[date]
      const numMembers = dayEntries[0]?.metadata?.rawValue?.length || 0
      if (numMembers === 0) {
        return {
          maximum_temperature_lt_0: 0,
          datetime: date,
          metadata: dayEntries[0]?.metadata,
          ...(dayEntries[0]?.debug ? { debug: dayEntries[0].debug } : {}),
        }
      }

      const memberMaxTemps: number[] = []
      for (let memberIndex = 0; memberIndex < numMembers; memberIndex++) {
        let maxTemp = -Infinity
        let hasValue = false
        dayEntries.forEach((entry) => {
          const memberValue = entry.metadata?.rawValue?.[memberIndex]
          if (memberValue !== null && memberValue !== undefined) {
            hasValue = true
            maxTemp = Math.max(maxTemp, memberValue)
          }
        })
        if (hasValue) memberMaxTemps.push(maxTemp)
      }

      const iceDayCount = memberMaxTemps.filter((temp) => temp <= -0.1).length
      const percentage =
        memberMaxTemps.length > 0
          ? (iceDayCount / memberMaxTemps.length) * 100
          : 0

      return {
        maximum_temperature_lt_0: parseFloat(percentage.toFixed(2)),
        datetime: date,
        metadata: dayEntries[0]?.metadata,
        ...(dayEntries[0]?.debug ? { debug: dayEntries[0].debug } : {}),
      }
    })
}
