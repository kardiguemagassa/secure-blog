import type { PostResponse, UserResponse } from '../types/api'

// miroir de @PreAuthorize("hasRole('ADMIN') or @postSecurity.isOwner(#id, authentication)")
export function canModifyPost(user: UserResponse | null, post: PostResponse): boolean {
  if (!user) {
    return false
  }
  return user.id === post.authorId || user.role === 'ROLE_ADMIN'
}
