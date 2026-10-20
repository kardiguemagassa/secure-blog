import { describe, expect, it } from 'vitest'
import type { PostResponse, Role, UserResponse } from '../types/api'
import { canModifyPost } from './permissions'

const post: PostResponse = {
  id: 'post-1',
  title: 'Title',
  content: 'Content',
  authorId: 'alice',
  authorUsername: 'alice',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

function user(id: string, role: Role = 'ROLE_USER'): UserResponse {
  return { id, username: id, email: `${id}@example.com`, role }
}

describe('canModifyPost', () => {
  it('denies an anonymous visitor', () => {
    expect(canModifyPost(null, post)).toBe(false)
  })

  it('allows the author', () => {
    expect(canModifyPost(user('alice'), post)).toBe(true)
  })

  it('denies another user', () => {
    expect(canModifyPost(user('bob'), post)).toBe(false)
  })

  it('allows an admin on any post', () => {
    expect(canModifyPost(user('admin', 'ROLE_ADMIN'), post)).toBe(true)
  })
})
