import { useMemo } from 'react'
import TimeseriesPills from '../timeseries/pills'
import { useTimeseriesChartsContext } from './context'
import { DEFAULT_LAND_TIMESERIES_CHART_GROUPS } from './defaults'
import type { TimeseriesChartElementGroup } from './types'

export type TimeseriesChartsFooterProps = {
  elementGroups?: TimeseriesChartElementGroup[]
  visibleGroups?: string[]
  onVisibleGroupsChange?: (keys: string[]) => void
  loading?: boolean
}

export default function TimeseriesChartsFooter({
  elementGroups: elementGroupsProp,
  visibleGroups: visibleGroupsProp,
  onVisibleGroupsChange: onVisibleGroupsChangeProp,
  loading: loadingProp,
}: TimeseriesChartsFooterProps) {
  const ctx = useTimeseriesChartsContext()
  const elementGroups =
    elementGroupsProp ?? ctx?.elementGroups ?? DEFAULT_LAND_TIMESERIES_CHART_GROUPS
  const visibleGroups = visibleGroupsProp ?? ctx?.visibleGroups
  const onVisibleGroupsChange =
    onVisibleGroupsChangeProp ?? ctx?.onVisibleGroupsChange
  const loading = loadingProp ?? ctx?.loading ?? false

  const groupItems = useMemo(() => {
    if (!elementGroups.length || !visibleGroups) return []
    const visible = new Set(visibleGroups)
    return elementGroups.map((group) => ({
      title: group.title,
      value: group.key,
      active: visible.has(group.key),
      icon: group.icon,
    }))
  }, [elementGroups, visibleGroups])

  if (loading) {
    return (
      <div className="ip:flex ip:flex-col ip:px-2 ip:py-2">
        <div className="ip:h-8 ip:w-full ip:animate-pulse ip:self-center ip:rounded-md ip:bg-gray-100 ip:dark:bg-white/10" />
      </div>
    )
  }

  if (groupItems.length === 0 || !onVisibleGroupsChange || !visibleGroups) {
    return null
  }

  return (
    <div className="ip:sticky ip:bottom-0 ip:flex ip:items-center ip:justify-between ip:gap-2 ip:overflow-auto ip:bg-white/90 ip:px-2 ip:py-2 ip:backdrop-blur-xl ip:dark:bg-dark ip:dark:text-white">
      <TimeseriesPills
        items={groupItems}
        toggle
        onChange={(key) => {
          const visible = new Set(visibleGroups)
          if (visible.has(key)) {
            if (visible.size === 1) {
              return
            }
            visible.delete(key)
          } else {
            visible.add(key)
          }
          onVisibleGroupsChange(
            elementGroups
              .map((group) => group.key)
              .filter((entry) => visible.has(entry)),
          )
        }}
        maxItems={10}
        minItems={0}
        resize={false}
      />
    </div>
  )
}
