import { useMemo } from 'react'
import { useTimeseriesContext } from './context'
import TimeseriesPills from './pills'
import type { TimeseriesElementGroup } from './types'

export type TimeseriesFooterProps = {
  elementGroups?: TimeseriesElementGroup[]
  elementGroup?: string
  onElementGroupChange?: (key: string) => void
  loading?: boolean
}

export default function TimeseriesFooter({
  elementGroups: elementGroupsProp,
  elementGroup: elementGroupProp,
  onElementGroupChange: onElementGroupChangeProp,
  loading: loadingProp,
}: TimeseriesFooterProps) {
  const ctx = useTimeseriesContext()
  const elementGroups = elementGroupsProp ?? ctx?.elementGroups
  const elementGroup = elementGroupProp ?? ctx?.elementGroup
  const onElementGroupChange =
    onElementGroupChangeProp ?? ctx?.onElementGroupChange
  const loading = loadingProp ?? ctx?.loading ?? false

  const items = useMemo(() => {
    if (!elementGroups || elementGroup == null) {
      return []
    }
    return elementGroups.map((group) => ({
      title: group.title,
      value: group.key,
      active: group.key === elementGroup,
      icon: group.icon,
    }))
  }, [elementGroup, elementGroups])

  if (loading) {
    return (
      <div className="ip:flex ip:flex-col ip:px-5 ip:py-2">
        <div className="ip:h-8 ip:w-full ip:animate-pulse ip:self-center ip:rounded-md ip:bg-gray-100 ip:dark:bg-white/10" />
      </div>
    )
  }

  if (items.length === 0 || !onElementGroupChange) {
    return null
  }

  return (
    <div className="ip:flex ip:bg-white/90 ip:px-2 ip:py-2 ip:backdrop-blur-xl ip:dark:bg-dark">
      <TimeseriesPills
        items={items}
        onChange={onElementGroupChange}
        maxItems={10}
        minItems={0}
        resize={false}
      />
    </div>
  )
}
