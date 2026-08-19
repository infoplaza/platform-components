import { useEffect, useLayoutEffect, useState } from 'react'

const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * True when the browser reports an Android or iOS phone/tablet (user agent),
 * including iPadOS Safari that identifies as desktop Mac + touch.
 * Desktop browsers (narrow window, responsive mode with desktop UA) are false.
 */
export function detectIosAndroidPhoneOrTablet(): boolean {
    if (typeof navigator === 'undefined') {
        return false
    }

    const ua = navigator.userAgent

    if (/Android/i.test(ua)) {
        return true
    }

    if (/iPhone|iPod|iPad/i.test(ua)) {
        return true
    }

    // iPadOS 13+ Safari: UA contains Macintosh; multi-touch indicates iPad
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
        return true
    }

    return false
}

/**
 * Client-only: initial state is `false` (matches SSR); then updates on mount before paint
 * when possible (`useLayoutEffect`) to limit flashing the desktop timebar on phones.
 */
export function useIsIosAndroidPhoneOrTablet(): boolean {
    const [isIosAndroid, setIsIosAndroid] = useState(false)

    useIsomorphicLayoutEffect(() => {
        setIsIosAndroid(detectIosAndroidPhoneOrTablet())
    }, [])

    return isIosAndroid
}
