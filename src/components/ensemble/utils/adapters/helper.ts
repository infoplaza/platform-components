import type { EnsembleRow } from '../../types'
import type { GradeRange } from '../../grades'

type GradeWithRange = {
  slug: string
  range: GradeRange[]
}

type GradeWithValue = {
  slug: string
  value: number | null
}

export function prefillMissingHourlyData({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  const filledData: EnsembleRow[] = []
  let previousEntry: EnsembleRow | null = null
  const hour = 3600

  for (let i = 0; i < data.length; i++) {
    const entry = data[i]
    if (previousEntry) {
      let expectedTimestamp = previousEntry.metadata.epoch + hour
      while (expectedTimestamp < entry.metadata.epoch) {
        const datetime = new Date(expectedTimestamp * 1000).toISOString()
        filledData.push({
          ...entry,
          metadata: {
            ...entry.metadata,
            epoch: expectedTimestamp,
            datetime,
          },
          datetime,
        })
        expectedTimestamp += hour
      }
    }
    filledData.push(entry)
    previousEntry = entry
  }

  return filledData
}

export function gradeMapper({
  grade,
  values,
  inclusiveMax = true,
}: {
  grade: GradeWithRange[]
  values: Array<number | null>
  inclusiveMax?: boolean
}): Record<string, number> {
  return grade.reduce<Record<string, number>>((acc, { slug, range }) => {
    const count = values.reduce((sum: number, value) => {
      if (value === null) return sum
      const matches = range.filter(({ min = -Infinity, max = Infinity }) =>
        inclusiveMax ? value >= min && value <= max : value >= min && value < max,
      ).length
      return sum + matches
    }, 0)
    const percentage = values.length ? (count / values.length) * 100 : 0
    acc[slug] = parseFloat(percentage.toFixed(2))
    return acc
  }, {})
}

export function valueMapper({
  grade,
  values,
}: {
  grade: GradeWithValue[]
  values: Array<number | null>
}): Record<string, number> {
  return grade.reduce<Record<string, number>>((acc, { slug, value }) => {
    const count = values.reduce((sum: number, val) => {
      if (val === null) return sum
      return sum + (val === value ? 1 : 0)
    }, 0)
    const percentage = values.length ? (count / values.length) * 100 : 0
    acc[slug] = parseFloat(percentage.toFixed(2))
    return acc
  }, {})
}

function median(values: Array<number | null>): number | null {
  const validValues = values.filter(
    (v): v is number => v !== null && typeof v === 'number',
  )
  if (validValues.length === 0) return null
  const sorted = [...validValues].sort((a, b) => a - b).filter((v) => v !== 0)
  if (sorted.length === 0) return null
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

export function aggregator(
  data: EnsembleRow[],
  interval: 'hour',
  _hours?: number,
): EnsembleRow[]
export function aggregator(
  data: EnsembleRow[],
  interval: 'daily',
  _hours?: number,
): Record<string, EnsembleRow[]>
export function aggregator(
  data: EnsembleRow[],
  interval: 'hour' | 'daily' = 'daily',
  _hours = 6,
): EnsembleRow[] | Record<string, EnsembleRow[]> {
  if (interval === 'hour') {
    const grouped = data.reduce<Record<string, EnsembleRow[]>>((acc, entry) => {
      const entryDate = new Date(String(entry.datetime))
      const hour = entryDate.getUTCHours()
      let intervalStartHour: number
      let dateStr: string

      if (hour >= 1 && hour <= 6) {
        intervalStartHour = 0
        dateStr = entryDate.toISOString().split('T')[0]
      } else if (hour >= 7 && hour <= 12) {
        intervalStartHour = 6
        dateStr = entryDate.toISOString().split('T')[0]
      } else if (hour >= 13 && hour <= 18) {
        intervalStartHour = 12
        dateStr = entryDate.toISOString().split('T')[0]
      } else {
        intervalStartHour = 18
        const dateForInterval = new Date(entryDate)
        if (hour === 0) {
          dateForInterval.setUTCDate(dateForInterval.getUTCDate() - 1)
        }
        dateStr = dateForInterval.toISOString().split('T')[0]
      }

      const intervalKey = `${dateStr}T${String(intervalStartHour).padStart(2, '0')}:00:00.000Z`
      if (!acc[intervalKey]) acc[intervalKey] = []
      acc[intervalKey].push(entry)
      return acc
    }, {})

    return Object.keys(grouped).map((intervalKey) => {
      const entries = grouped[intervalKey]
      const summedRawValue = entries.reduce<number[]>((sumArray, entry) => {
        if (!entry.metadata?.rawValue) return sumArray
        return entry.metadata.rawValue.map((value, index) => {
          const numValue = typeof value === 'number' ? value : 0
          return (sumArray[index] || 0) + numValue
        })
      }, [])

      const summedMembers = entries.reduce<Record<string, number>>(
        (memberAcc, entry) => {
          Object.keys(entry)
            .filter((key) => key.startsWith('member'))
            .forEach((memberKey) => {
              const value = entry[memberKey]
              const numericValue = typeof value === 'number' ? value : 0
              memberAcc[memberKey] = parseFloat(
                ((memberAcc[memberKey] || 0) + numericValue).toFixed(2),
              )
            })
          return memberAcc
        },
        {},
      )

      const lastEntry = entries[entries.length - 1]
      const lastEntryDate = new Date(String(lastEntry.datetime))
      return {
        ...summedMembers,
        datetime: lastEntryDate.toISOString(),
        median: median(summedRawValue),
        control: summedMembers.member0,
        metadata: {
          ...lastEntry.metadata,
          rawValue: summedRawValue,
          epoch: Math.floor(lastEntryDate.getTime() / 1000),
          sequence: 6,
        },
      }
    })
  }

  return data.reduce<Record<string, EnsembleRow[]>>((acc, entry) => {
    const entryDate = new Date(String(entry.datetime))
    const hour = entryDate.getUTCHours()
    let dayKey: string
    if (hour === 0) {
      const yesterday = new Date(entryDate)
      yesterday.setUTCDate(yesterday.getUTCDate() - 1)
      dayKey = yesterday.toISOString().split('T')[0]
    } else {
      dayKey = entryDate.toISOString().split('T')[0]
    }
    if (!acc[dayKey]) acc[dayKey] = []
    acc[dayKey].push(entry)
    return acc
  }, {})
}

export function differenceFromPreviousCalculation({
  data,
}: {
  data: EnsembleRow[]
}): EnsembleRow[] {
  return data.reduce<EnsembleRow[]>((acc, entry, index) => {
    if (index > 0) {
      const memberKeys = Object.keys(entry)
        .filter((key) => key.startsWith('member'))
        .sort((a, b) => {
          const numA = parseInt(a.replace('member', ''), 10)
          const numB = parseInt(b.replace('member', ''), 10)
          return numA - numB
        })

      const differences = memberKeys.map((memberKey) => {
        const currentValue = entry[memberKey]
        const previousValue = data[index - 1][memberKey]
        if (
          typeof currentValue === 'number' &&
          typeof previousValue === 'number'
        ) {
          return Math.max(0, currentValue - previousValue)
        }
        return null
      })

      const updatedMemberValues: Record<string, number | null> = {}
      memberKeys.forEach((memberKey, idx) => {
        updatedMemberValues[memberKey] = differences[idx]
      })

      acc.push({
        ...entry,
        ...updatedMemberValues,
        median: median(differences),
        control: updatedMemberValues.member0,
        metadata: {
          ...entry.metadata,
          rawValue: differences,
        },
      })
    }

    if (index === 0) {
      acc.push(entry)
    }
    return acc
  }, [])
}
