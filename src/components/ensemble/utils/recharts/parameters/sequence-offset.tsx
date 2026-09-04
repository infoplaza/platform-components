import SequenceLabel from '../../../graph/labels/sequence-label'
import type { EnsembleRow } from '../../../types'

const SEQUENCE_REFERENCE = [
  { label: '1 hour data', slug: '1hour', start: 0, sequence: 1 },
  { label: '3 hour data', slug: '3hour', start: 93, sequence: 3 },
  { label: '6 hour data', slug: '6hour', start: 143, sequence: 6 },
]

const ALLOWED = [
  'overview_winddirectionchance',
  'overview_cloudcovertotal',
  'moisture_cloudcovertotal',
  'moisture_cloudcovershading',
  'precipitation_precipitationtype',
  'winter_frost_probability_overview',
  'winter_precipitationtype',
  'summer_precipitationprobability',
]

function getSequenceReference(sequence: EnsembleRow[]) {
  const seen = new Set<number | undefined>()
  return sequence
    .filter((item) => {
      if (seen.has(item.metadata.sequence)) return false
      seen.add(item.metadata.sequence)
      return true
    })
    .map(({ metadata }) => ({
      datetime: metadata.datetime,
      offset: metadata.sequence,
    }))
}

function getLines(sequence: EnsembleRow[]) {
  return getSequenceReference(sequence).map(({ datetime, offset }) => ({
    value: new Date(datetime).getTime(),
    label: (
      <SequenceLabel
        label={
          SEQUENCE_REFERENCE.find((item) => item.sequence === offset)?.label
        }
      />
    ),
    strokeDasharray: '5 5',
    stroke: '#2E2E2E',
    strokeWidth: 1,
  }))
}

export function getSequenceOffsetConfig(props: {
  slug?: string
  rows?: EnsembleRow[]
}) {
  const { slug, rows = [] } = props
  if (!slug || !ALLOWED.includes(slug)) {
    return { reference: {} }
  }
  return {
    reference: {
      highPriority: {
        xLines: getLines(rows),
      },
    },
  }
}
