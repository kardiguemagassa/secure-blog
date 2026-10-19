import { createContext } from 'react'
import type { LoginRequest, UserResponse } from '../types/api'

export interface AuthContextValue {
    user: UserResponse | null
    isAuthenticated: boolean
    isAdmin: boolean
    isLoading: boolean
    login: (credentials: LoginRequest) => Promise<void>
    logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const currentUserKey = ['auth', 'me'] as const