import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getMyPosts, postKeys } from '../api/posts'
import { PostList } from '../components/PostList'
import { usePageParam } from '../hooks/usePageParam'

export function MyPostsPage() {
  const [page, setPage] = usePageParam()

  const query = useQuery({
    queryKey: postKeys.mine(page),
    queryFn: () => getMyPosts(page - 1),
    placeholderData: keepPreviousData,
  })

  return (
    <section>
      <h1>My posts</h1>
      <p>
        <Link to="/posts/new">Write a new post</Link>
      </p>
      <PostList
        query={query}
        page={page}
        onPageChange={setPage}
        emptyMessage="You have not written any posts yet."
      />
    </section>
  )
}
