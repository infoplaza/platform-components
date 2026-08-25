import { useState } from 'react'
import { twMerge } from '@/src/utilities/external/twMerge'
import TimeseriesFooter from './footer'
import { ScrollSync } from './scroll-sync'
import TimeseriesTable from './table'
import TimeseriesToolbar from './toolbar'
import type { TimeseriesDirectionView, TimeseriesForecastProps } from './types'
import { DEFAULT_DIRECTION_VIEW } from './utils'

export default function TimeseriesForecast({
  models,
  model,
  onModelChange,
  run,
  onRunChange,
  elementGroups,
  elementGroup,
  onElementGroupChange,
  blocks,
  locale = 'en',
  timezone = null,
  headerFormat,
  timestamp = null,
  timestamps,
  onTimestampChange,
  scrollToCurrentTime,
  views,
  getIconSrc,
  directionView,
  onDirectionViewChange,
  loading = false,
  className,
  children,
}: TimeseriesForecastProps) {
  const [uncontrolledDirectionView, setUncontrolledDirectionView] =
    useState<TimeseriesDirectionView>(
      directionView ?? DEFAULT_DIRECTION_VIEW,
    )
  const resolvedDirectionView = directionView ?? uncontrolledDirectionView
  const changeDirectionView =
    onDirectionViewChange ?? setUncontrolledDirectionView

  return (
    <div
      className={twMerge(
        'ip-platform ip:flex ip:w-full ip:flex-col ip:bg-white ip:dark:bg-dark/90',
        className,
      )}
    >
      <TimeseriesToolbar
        models={models}
        model={model}
        onModelChange={onModelChange}
        run={run}
        onRunChange={onRunChange}
        locale={locale}
      />

      <div className="ip:min-h-0 ip:flex-1 ip:overflow-auto">
        {loading ? (
          <div className="ip:flex ip:flex-col ip:px-5">
            <div className="ip:h-[232px] ip:w-full ip:animate-pulse ip:self-center ip:rounded-md ip:bg-gray-100 ip:dark:bg-white/10" />
          </div>
        ) : (
          <ScrollSync horizontal vertical={false}>
            <div className="ip:flex ip:flex-col ip:gap-1">
              {blocks.map((block, index) => (
                <TimeseriesTable
                  key={`${block.title ?? 'block'}-${index}`}
                  rows={block.rows}
                  hiddenRows={block.hiddenRows}
                  title={block.title}
                  titleExtra={block.titleExtra}
                  subtitle={block.subtitle}
                  locale={locale}
                  timezone={timezone}
                  headerFormat={headerFormat}
                  timestamp={timestamp}
                  timestamps={timestamps}
                  onTimestampChange={onTimestampChange}
                  scrollToCurrentTime={scrollToCurrentTime}
                  views={views}
                  getIconSrc={getIconSrc}
                  directionView={resolvedDirectionView}
                  onDirectionViewChange={changeDirectionView}
                />
              ))}
              {children}
            </div>
          </ScrollSync>
        )}
      </div>

      {loading ? (
        <div className="ip:flex ip:flex-col ip:px-5 ip:py-2">
          <div className="ip:h-8 ip:w-full ip:animate-pulse ip:self-center ip:rounded-md ip:bg-gray-100 ip:dark:bg-white/10" />
        </div>
      ) : (
        <TimeseriesFooter
          elementGroups={elementGroups}
          elementGroup={elementGroup}
          onElementGroupChange={onElementGroupChange}
        />
      )}
    </div>
  )
}
