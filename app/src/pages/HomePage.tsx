import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getPosts, postKeys } from '../api/posts'
import { PostList } from '../components/PostList'
import { usePageParam } from '../hooks/usePageParam'

export function HomePage() {
  const [page, setPage] = usePageParam()

  const query = useQuery({
    queryKey: postKeys.list(page),
    queryFn: () => getPosts(page - 1),
    placeholderData: keepPreviousData,
  })

  return (
    <section>
      <h1>Latest posts</h1>
      <PostList query={query} page={page} onPageChange={setPage} emptyMessage="No posts yet." />
    </section>
  )
}
