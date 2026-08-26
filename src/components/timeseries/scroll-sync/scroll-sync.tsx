import {
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { ScrollSyncContext } from './context'

type ScrollSyncProps = {
  children: ReactNode
  proportional?: boolean
  vertical?: boolean
  horizontal?: boolean
  enabled?: boolean
}

export default function ScrollSync({
  children,
  proportional = true,
  vertical = true,
  horizontal = true,
  enabled = true,
}: ScrollSyncProps) {
  const panesRef = useRef<Record<string, HTMLElement[]>>({})
  const nodeGroupsRef = useRef(new Map<HTMLElement, string[]>())
  const listenersRef = useRef(new Map<HTMLElement, EventListener>())
  const optionsRef = useRef({ proportional, vertical, horizontal, enabled })
  optionsRef.current = { proportional, vertical, horizontal, enabled }

  const syncScrollPosition = useCallback(
    (from: HTMLElement, to: HTMLElement) => {
      const {
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollLeft,
        scrollWidth,
        clientWidth,
      } = from
      const { proportional: prop, vertical: vert, horizontal: horiz } =
        optionsRef.current

      const fromTopRange = scrollHeight - clientHeight
      const fromLeftRange = scrollWidth - clientWidth
      const toTopRange = to.scrollHeight - to.clientHeight
      const toLeftRange = to.scrollWidth - to.clientWidth

      if (vert && fromTopRange > 0) {
        to.scrollTop = prop
          ? (toTopRange * scrollTop) / fromTopRange
          : scrollTop
      }
      if (horiz && fromLeftRange > 0) {
        to.scrollLeft = prop
          ? (toLeftRange * scrollLeft) / fromLeftRange
          : scrollLeft
      }
    },
    [],
  )

  const removeEvents = useCallback((node: HTMLElement) => {
    const handler = listenersRef.current.get(node)
    if (handler) {
      node.removeEventListener('scroll', handler)
      listenersRef.current.delete(node)
    }
  }, [])

  const addEvents = useCallback(
    (node: HTMLElement) => {
      if (listenersRef.current.has(node)) {
        return
      }

      const handler = () => {
        if (!optionsRef.current.enabled) {
          return
        }
        const groups = nodeGroupsRef.current.get(node) ?? ['default']
        window.requestAnimationFrame(() => {
          groups.forEach((group) => {
            const panes = panesRef.current[group] ?? []
            panes.forEach((pane) => {
              if (pane === node) {
                return
              }
              removeEvents(pane)
              syncScrollPosition(node, pane)
              window.requestAnimationFrame(() => addEvents(pane))
            })
          })
        })
      }

      node.addEventListener('scroll', handler, { passive: true })
      listenersRef.current.set(node, handler)
    },
    [removeEvents, syncScrollPosition],
  )

  const registerPane = useCallback(
    (node: HTMLElement, groups: string[]) => {
      nodeGroupsRef.current.set(node, groups)
      groups.forEach((group) => {
        if (!panesRef.current[group]) {
          panesRef.current[group] = []
        }
        const list = panesRef.current[group]
        if (!list.includes(node)) {
          if (list.length > 0) {
            syncScrollPosition(list[0], node)
          }
          list.push(node)
        }
      })
      addEvents(node)
    },
    [addEvents, syncScrollPosition],
  )

  const unregisterPane = useCallback(
    (node: HTMLElement, groups: string[]) => {
      removeEvents(node)
      nodeGroupsRef.current.delete(node)
      groups.forEach((group) => {
        const list = panesRef.current[group]
        if (!list) {
          return
        }
        panesRef.current[group] = list.filter((pane) => pane !== node)
      })
    },
    [removeEvents],
  )

  const value = useMemo(
    () => ({ registerPane, unregisterPane }),
    [registerPane, unregisterPane],
  )

  return (
    <ScrollSyncContext.Provider value={value}>
      {children}
    </ScrollSyncContext.Provider>
  )
}
