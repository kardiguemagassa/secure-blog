import { apiFetch } from './client'
import type { Page, Role, UserResponse } from '../types/api'

export const USERS_PAGE_SIZE = 20

export const adminKeys = {
  all: ['admin'] as const,
  users: (page: number) => [...adminKeys.all, 'users', { page }] as const,
}

export function getUsers(page: number, size = USERS_PAGE_SIZE): Promise<Page<UserResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  return apiFetch<Page<UserResponse>>(`/api/admin/users?${params}`)
}

export function changeUserRole(id: string, role: Role): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/admin/users/${encodeURIComponent(id)}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
