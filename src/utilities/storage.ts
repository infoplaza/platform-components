
class StorageService {
    static prefix = 'imw-'

    static get(key: string): unknown {
        try {
            const value = localStorage.getItem(`${this.prefix}${key}`)
        
            return value ? JSON.parse(value) : null        
        } catch (e) {
            return null
        }
    }

    static set(key: string, value: any): void {        
        const json = JSON.stringify(value)

        try {
            localStorage.setItem(`${this.prefix}${key}`, json)
        } catch (e) { }
    }
}

export default StorageService