import { apiFetch } from './client'
import { tokenStorage } from '../auth/tokenStorage'
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types/api'

export async function login(credentials: LoginRequest): Promise<void> {
  const response = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  tokenStorage.set(response.accessToken) // la liaison avec le token émis par le back
}

export function register(data: RegisterRequest): Promise<UserResponse> {
  return apiFetch<UserResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getCurrentUser(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/api/users/me')
}
