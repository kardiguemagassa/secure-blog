import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, login as loginRequest } from '../api/auth'
import { UNAUTHORIZED_EVENT } from '../api/client'
import { AuthContext, currentUserKey } from './AuthContext'
import type { AuthContextValue } from './AuthContext'
import { tokenStorage } from './tokenStorage'
import type { LoginRequest } from '../types/api'

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const [hasToken, setHasToken] = useState(() => tokenStorage.get() !== null)

    const { data: user, isPending } = useQuery({
        queryKey: currentUserKey,
        queryFn: getCurrentUser,
        enabled: hasToken,   // on n'appelle /me que si un token existe
        staleTime: Infinity, // le profil ne change pas pendant la session
    })

    const logout = useCallback(() => {
        tokenStorage.clear()
        setHasToken(false)
        queryClient.clear() // aucune donnée de l'utilisateur précédent ne reste en cache
    }, [queryClient])

    const login = useCallback(async (credentials: LoginRequest) => {
        await loginRequest(credentials)
        setHasToken(true) // déclenche le chargement de /me
    }, [])

    // déconnexion automatique quand le client HTTP reçoit un 401 avec un token
    useEffect(() => {
        window.addEventListener(UNAUTHORIZED_EVENT, logout)
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
    }, [logout])

    const value = useMemo<AuthContextValue>(
        () => ({
            user: hasToken ? (user ?? null) : null,
            isAuthenticated: hasToken && user !== undefined,
            isAdmin: hasToken && user?.role === 'ROLE_ADMIN',
            isLoading: hasToken && isPending,
            login,
            logout,
        }),
        [hasToken, user, isPending, login, logout],
    )

    return <AuthContext value={value}>{children}</AuthContext>
}