export const formalizeString = (string: string) => {
    return typeof string === 'string' && string.length > 0
        ? `${string.charAt(0).toUpperCase()}${string.slice(1)}`
        : string
}