import { useEffect, useState } from "react"
import StorageService from "@/src/utilities/storage"

export const useStorageState = <T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    
    const storageKey = `state-${key}`
    const storageValue = StorageService.get(storageKey) as T | null
    const [value, setValue] = useState<T>(storageValue ?? defaultValue)

    useEffect(() => {
        StorageService.set(storageKey, value)
    }, [value, storageKey])

    return [value, setValue]
} 