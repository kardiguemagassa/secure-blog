import { apiFetch } from './client'
import type { Page, PostRequest, PostResponse } from '../types/api'

export const POSTS_PAGE_SIZE = 10

// clés de cache centralisées, pour invalider précisément après une création ou une modification
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (page: number) => [...postKeys.lists(), { page }] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
}

export function getPosts(page: number, size = POSTS_PAGE_SIZE): Promise<Page<PostResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  return apiFetch<Page<PostResponse>>(`/api/posts?${params}`)
}

export function getPost(id: string): Promise<PostResponse> {
  return apiFetch<PostResponse>(`/api/posts/${encodeURIComponent(id)}`)
}

export function createPost(data: PostRequest): Promise<PostResponse> {
  return apiFetch<PostResponse>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updatePost(id: string, data: PostRequest): Promise<PostResponse> {
  return apiFetch<PostResponse>(`/api/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deletePost(id: string): Promise<void> {
  return apiFetch<void>(`/api/posts/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
