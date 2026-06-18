const libraries = new Map<string, unknown>()

export function setLibrary(name: string, library: unknown): void {
    libraries.set(name, library)
}

export function createErrorWithCause(message: string, cause: unknown): Error {
    const error = new Error(message)
    ;(error as Error & { cause?: unknown }).cause = cause
    return error
}

export async function getLibrary(name: 'geotiff'): Promise<typeof import('geotiff')>;
export async function getLibrary(name: string): Promise<unknown> {
    if (libraries.has(name)) {
        return libraries.get(name)
    }
 
    try {
        switch (name) {
            case 'geotiff': return await import('geotiff')
        }
    } catch (e) {
        throw createErrorWithCause(
            `Optional dependency '${name}' is missing, install it with a package manager or provide with \`setLibrary('${name}', library)\``,
            e,
        )
    }
}