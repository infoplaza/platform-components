import type { TimeseriesBuilderProps } from './types'
import { TimeseriesBlockProvider, useTimeseries } from './context'
import { ScrollSync } from './scroll-sync'

export default function TimeseriesBuilder({ children }: TimeseriesBuilderProps) {
  const { blocks, loading } = useTimeseries()

  if (loading) {
    return (
      <div className="ip:flex ip:flex-col ip:px-5">
        <div className="ip:h-58 ip:w-full ip:animate-pulse ip:self-center ip:rounded-md ip:bg-gray-100 ip:dark:bg-white/10" />
      </div>
    )
  }

  return (
    <ScrollSync horizontal vertical={false}>
      <div className="ip:flex ip:flex-col ip:gap-1">
        {blocks.map((block, index) => (
          <TimeseriesBlockProvider
            key={`${block.title ?? 'block'}-${index}`}
            block={block}
          >
            {children}
          </TimeseriesBlockProvider>
        ))}
      </div>
    </ScrollSync>
  )
}
