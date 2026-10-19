const TOKEN_KEY = 'secure-blog.token'

export const tokenStorage = {
    get(): string | null {
        try {
            return sessionStorage.getItem(TOKEN_KEY)
        } catch {
            return null // stockage indisponible (navigation privée stricte, etc.)
        }
    },
    set(token: string): void {
        try {
            sessionStorage.setItem(TOKEN_KEY, token)
        } catch {
            // stockage indisponible : la session ne survivra pas au rechargement
        }
    },
    clear(): void {
        try {
            sessionStorage.removeItem(TOKEN_KEY)
        } catch {
            // rien à nettoyer
        }
    },
}