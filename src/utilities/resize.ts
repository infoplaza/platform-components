import { useEffect, useRef } from 'react'

const useResize = (handler: (event: Event) => void, el = window) => {
    const eventListenerRef = useRef<((event: Event) => void) | null>(null)

    useEffect(() => {
        eventListenerRef.current = (event: Event) => {
            handler?.(event)
        }
    }, [handler])

    useEffect(() => {
        const eventListener = (event: Event) => {
            eventListenerRef.current?.(event)
        }

        el.addEventListener('resize', eventListener)

        setTimeout(() => eventListener(new Event('resize')))

        return () => {
            el.removeEventListener('resize', eventListener)
        }
    }, [ el ])
}

export default useResize