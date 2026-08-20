import { useEffect, useRef, RefObject } from 'react'

type KeyPressHandler = (event: KeyboardEvent) => void
type Keys = string | string[]

const useKeyPress = (
    keys: Keys, 
    handler: KeyPressHandler, 
    ref: RefObject<HTMLElement> | null = null, 
    focusElement: RefObject<HTMLElement> | null = null
): void => {
    const eventListenerRef = useRef<KeyPressHandler>(handler)
    const eventListenerActive = useRef<boolean>(false)
    const isFocused = useRef<boolean>(false)

    const eventListener = (event: KeyboardEvent): void => {
        if (eventListenerRef.current) {
            eventListenerRef.current(event)
        }
    }

    const eventClickOutside = (event: MouseEvent): void => {
        if (ref && ref.current && !ref.current.contains(event.target as Node)) {
            eventListenerActive.current = false
        } else {
            eventListenerActive.current = true
        }
    }

    const handleFocus = (): void => {
        isFocused.current = true
    }

    const handleBlur = (): void => {
        isFocused.current = false
    }

    useEffect(() => {
        eventListenerRef.current = (event: KeyboardEvent) => {
            // Only execute if the element is focused and the event listener is active
            if (eventListenerActive.current && isFocused.current) {
                if (Array.isArray(keys) ? keys.includes(event.key) : keys === event.key) {
                    event.preventDefault()
                    event.stopPropagation()
                    handler?.(event)
                }
            }
        }
    }, [keys, handler])

    useEffect(() => {
        window.addEventListener('keydown', eventListener)
        window.addEventListener('mousedown', eventClickOutside)

        // Add focus/blur event listeners to the focus element if provided
        if (focusElement && focusElement.current) {
            focusElement.current.addEventListener('focus', handleFocus)
            focusElement.current.addEventListener('blur', handleBlur)
        }

        return () => {
            window.removeEventListener('keydown', eventListener)
            window.removeEventListener('mousedown', eventClickOutside)
            
            // Remove focus/blur event listeners
            if (focusElement && focusElement.current) {
                focusElement.current.removeEventListener('focus', handleFocus)
                focusElement.current.removeEventListener('blur', handleBlur)
            }
        }
    }, [focusElement])
}

export default useKeyPress
