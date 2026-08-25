import { useMemo } from 'react'
import TimeseriesPills from './pills'
import type { TimeseriesElementGroup } from './types'

export type TimeseriesFooterProps = {
  elementGroups: TimeseriesElementGroup[]
  elementGroup: string
  onElementGroupChange: (key: string) => void
}

export default function TimeseriesFooter({
  elementGroups,
  elementGroup,
  onElementGroupChange,
}: TimeseriesFooterProps) {
  const items = useMemo(
    () =>
      elementGroups.map((group) => ({
        title: group.title,
        value: group.key,
        active: group.key === elementGroup,
        icon: group.icon,
      })),
    [elementGroup, elementGroups],
  )

  if (items.length === 0) {
    return null
  }

  return (
    <div className="ip:flex ip:bg-white/90 ip:px-2 ip:py-2 ip:backdrop-blur-xl ip:dark:bg-dark ip:md:px-4">
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
