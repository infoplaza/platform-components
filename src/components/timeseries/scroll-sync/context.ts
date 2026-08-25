import { createContext } from 'react'

export type ScrollSyncContextValue = {
  registerPane: (node: HTMLElement, groups: string[]) => void
  unregisterPane: (node: HTMLElement, groups: string[]) => void
}

export const ScrollSyncContext = createContext<ScrollSyncContextValue>({
  registerPane: () => {},
  unregisterPane: () => {},
})
