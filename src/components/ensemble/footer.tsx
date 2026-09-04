import { useMemo } from 'react'
import TimeseriesPills from '../timeseries/pills'
import { useEnsembleContext } from './context'
import { ENSEMBLE_TIMESERIES } from './defaults'
import type { EnsembleElementGroup, EnsembleView } from './types'

export type EnsembleFooterProps = {
  elementGroups?: EnsembleElementGroup[]
  elementGroup?: string
  onElementGroupChange?: (key: string) => void
  view?: EnsembleView
  onViewChange?: (view: EnsembleView) => void
  loading?: boolean
}

export default function EnsembleFooter({
  elementGroups: elementGroupsProp,
  elementGroup: elementGroupProp,
  onElementGroupChange: onElementGroupChangeProp,
  view: viewProp,
  onViewChange: onViewChangeProp,
  loading: loadingProp,
}: EnsembleFooterProps) {
  const ctx = useEnsembleContext()
  const elementGroups =
    elementGroupsProp ?? ctx?.elementGroups ?? ENSEMBLE_TIMESERIES.groups
  const elementGroup = elementGroupProp ?? ctx?.elementGroup
  const onElementGroupChange =
    onElementGroupChangeProp ?? ctx?.onElementGroupChange
  const view = viewProp ?? ctx?.view
  const onViewChange = onViewChangeProp ?? ctx?.onViewChange
  const loading = loadingProp ?? ctx?.loading ?? false

  const groupItems = useMemo(() => {
    if (!elementGroups.length) return []
    return elementGroups.map((group) => ({
      title: group.title,
      value: group.key,
      active: group.key === elementGroup,
      icon: group.icon,
    }))
  }, [elementGroup, elementGroups])

  const viewItems = useMemo(
    () => [
      { title: 'Basic', value: 'basic', active: view === 'basic' },
      { title: 'Expert', value: 'expert', active: view === 'expert' },
    ],
    [view],
  )

  if (loading) {
    return (
      <div className="ip:flex ip:flex-col ip:px-2 ip:py-2">
        <div className="ip:h-8 ip:w-full ip:animate-pulse ip:self-center ip:rounded-md ip:bg-gray-100 ip:dark:bg-white/10" />
      </div>
    )
  }

  if (groupItems.length === 0 || !onElementGroupChange) {
    return null
  }

  return (
    <div className="ip:sticky ip:bottom-0 ip:flex ip:items-center ip:justify-between ip:gap-2 ip:overflow-auto ip:bg-white/90 ip:px-2 ip:py-2 ip:backdrop-blur-xl ip:dark:bg-dark ip:dark:text-white">
      <TimeseriesPills
        items={groupItems}
        onChange={onElementGroupChange}
        maxItems={10}
        minItems={0}
        resize={false}
      />
      {onViewChange ? (
        <TimeseriesPills
          items={viewItems}
          onChange={(value) => onViewChange(value as EnsembleView)}
          maxItems={2}
          minItems={0}
          resize={false}
        />
      ) : null}
    </div>
  )
}
