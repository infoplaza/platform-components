import CustomTooltip from '../../../graph/tooltips/tooltip'

const ONE_DECIMAL_SLUGS = [
  'temperature_temperature',
  'overview_precipitation_expert',
  'overview_precipitation',
  'precipitation_precipitation',
  'overview_temperature',
  'temperature_temperature_2m',
  'temperature_temperaturemin_2m',
  'temperature_temperature_100m',
  'temperature_temperature_200m',
  'summer_temperature',
  'temperature_temperaturemax_2m',
  'precipitation_precipitationtype',
  'overview_precipitationaccumulation_expert',
  'winter_precipitationtype',
  'winter_frost_probability_overview',
]

export function getDecimalTooltipConfig(props: { slug?: string }) {
  const { slug } = props
  if (!slug || !ONE_DECIMAL_SLUGS.includes(slug)) {
    return { tooltip: {} }
  }
  return {
    tooltip: {
      content: <CustomTooltip decimalPlace={1} />,
    },
  }
}
