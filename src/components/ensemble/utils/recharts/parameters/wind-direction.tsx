import WindDirectionChanceTooltip from '../../../graph/tooltips/wind-direction-chance-tooltip'

const ALLOWED = ['overview_winddirectionchance']

export function getWindDirectionConfig(props: { slug?: string }) {
  const { slug } = props
  if (!slug || !ALLOWED.includes(slug)) {
    return { tooltip: {} }
  }
  return {
    tooltip: {
      content: <WindDirectionChanceTooltip />,
      wrapperStyle: WindDirectionChanceTooltip.wrapperStyle,
    },
  }
}
