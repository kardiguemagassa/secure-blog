import type { UseQueryResult } from '@tanstack/react-query'
import type { Page, PostResponse } from '../types/api'
import { Pagination } from './Pagination'
import { PostCard } from './PostCard'

interface PostListProps {
  query: UseQueryResult<Page<PostResponse>>
  page: number
  onPageChange: (page: number) => void
  emptyMessage: string
}

export function PostList({ query, page, onPageChange, emptyMessage }: PostListProps) {
  const { data, error, isPending, isPlaceholderData } = query

  if (isPending) {
    return <p>Loading posts…</p>
  }

  if (error) {
    return <p role="alert">Could not load posts. Please try again later.</p>
  }

  if (data.content.length === 0) {
    return page === 1 ? (
      <p>{emptyMessage}</p>
    ) : (
      <p>
        This page is empty.{' '}
        <button type="button" onClick={() => onPageChange(1)}>
          Back to the first page
        </button>
      </p>
    )
  }

  return (
    <>
      <div aria-busy={isPlaceholderData}>
        {data.content.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <Pagination page={page} totalPages={data.page.totalPages} onPageChange={onPageChange} />
    </>
  )
}
