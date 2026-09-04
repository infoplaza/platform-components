import { Rectangle } from 'recharts'
import { formatDate } from '@/src/utilities/date'
import PrecipitationProbabilityTooltip from '../../../graph/tooltips/precipitation-probability-tooltip'
import { toSupportedLocale } from '../../locale'

const DATE_SIMPLIFIED_SLUGS = [
  'winter_frost_day_probability',
  'winter_ice_day_probability',
]

export function getDateSimplifiedTooltipConfig(props: {
  slug?: string
  language?: string
}) {
  const { slug, language } = props
  if (!slug || !DATE_SIMPLIFIED_SLUGS.includes(slug)) {
    return { bar: {}, tooltip: {} }
  }
  const locale = toSupportedLocale(language)
  return {
    bar: {
      activeBar: <Rectangle stroke="orange" />,
      type: 'number',
    },
    tooltip: {
      content: <PrecipitationProbabilityTooltip decimalPlace={1} />,
      wrapperStyle: PrecipitationProbabilityTooltip.wrapperStyle,
      labelFormatter: (val: unknown) => {
        const dt = new Date(val as number)
        return formatDate(dt, 'EEEEEE d MMM yyyy', locale)
      },
      cursor: false,
    },
  }
}
