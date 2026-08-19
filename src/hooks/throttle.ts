import { useCallback, useRef } from 'react'

export function useThrottle<T extends (...args: any[]) => any>(fn: T, delay: number = 100): T {
    const last = useRef(0)

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now()
            if (now - last.current >= delay) {
                last.current = now
                fn(...args)
            }
        },
        [fn, delay]
    ) as T
}
