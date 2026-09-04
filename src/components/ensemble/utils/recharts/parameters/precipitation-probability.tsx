import PrecipitationProbabilityLegend from '../../../graph/legends/precipitation-probability-legend'
import PrecipitationProbabilityTooltip from '../../../graph/tooltips/precipitation-probability-tooltip'

const ALLOWED = [
  'overview_precipitationprobability',
  'precipitation_precipitationprobability',
  'summer_precipitationprobability',
]

export function getPrecipitationProbabilityConfig(props: { slug?: string }) {
  const { slug } = props
  return {
    legend: {
      content: <PrecipitationProbabilityLegend />,
    },
    tooltip: slug && ALLOWED.includes(slug)
      ? {
          content: <PrecipitationProbabilityTooltip decimalPlace={1} />,
          wrapperStyle: PrecipitationProbabilityTooltip.wrapperStyle,
        }
      : {},
  }
}
