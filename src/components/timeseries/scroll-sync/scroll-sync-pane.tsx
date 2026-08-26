import {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  type HTMLAttributes,
} from 'react'
import { ScrollSyncContext } from './context'

type ScrollSyncPaneProps = HTMLAttributes<HTMLDivElement> & {
  group?: string | string[]
}

function toGroups(group: string | string[] | undefined): string[] {
  if (group == null) {
    return ['default']
  }
  return Array.isArray(group) ? group : [group]
}

const ScrollSyncPane = forwardRef<HTMLDivElement, ScrollSyncPaneProps>(
  function ScrollSyncPane({ group = 'default', children, ...props }, forwardedRef) {
    const innerRef = useRef<HTMLDivElement | null>(null)
    const { registerPane, unregisterPane } = useContext(ScrollSyncContext)
    const groups = toGroups(group)
    const groupsKey = groups.join(',')

    useEffect(() => {
      const node = innerRef.current
      if (!node) {
        return
      }
      registerPane(node, groups)
      return () => unregisterPane(node, groups)
    }, [registerPane, unregisterPane, groupsKey])

    return (
      <div
        {...props}
        ref={(node) => {
          innerRef.current = node
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else if (forwardedRef) {
            forwardedRef.current = node
          }
        }}
      >
        {children}
      </div>
    )
  },
)

export default ScrollSyncPane
