import { useEnsembleChartBlockContext, useEnsembleContext } from './context'
import EnsembleGraph from './graph'
import type { EnsembleChartProps } from './types'

export default function EnsembleChart({
  id,
  title: titleProp,
  titleExtra: titleExtraProp,
  subtitle: subtitleProp,
  config: configProp,
  fixedWidth,
  fixedHeight,
}: EnsembleChartProps) {
  const block = useEnsembleChartBlockContext()
  const ctx = useEnsembleContext()

  const config = configProp ?? block?.config
  if (!config) {
    return null
  }

  return (
    <EnsembleGraph
      id={id ?? block?.title ?? ctx?.model ?? ''}
      title={titleProp ?? block?.title}
      titleExtra={titleExtraProp ?? block?.titleExtra}
      subtitle={subtitleProp ?? block?.subtitle}
      config={config}
      fixedWidth={fixedWidth}
      fixedHeight={fixedHeight}
    />
  )
}
