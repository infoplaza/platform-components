import type { EnsembleBuilderProps } from './types'
import { EnsembleChartBlockProvider, useEnsemble } from './context'

export default function EnsembleBuilder({ children }: EnsembleBuilderProps) {
  const { charts, loading } = useEnsemble()

  if (loading) {
    return (
      <div className="ip:flex ip:flex-col ip:px-2">
        <div className="ip:h-64 ip:w-full ip:animate-pulse ip:self-center ip:rounded-md ip:bg-gray-100 ip:dark:bg-white/10" />
      </div>
    )
  }

  return (
    <div className="ip:flex ip:flex-col ip:gap-4 ip:px-2 ip:py-2">
      {charts.map((block, index) => (
        <EnsembleChartBlockProvider
          key={`${block.title ?? 'chart'}-${index}`}
          block={block}
        >
          {children}
        </EnsembleChartBlockProvider>
      ))}
    </div>
  )
}
