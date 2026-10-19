import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { getPost, postKeys, updatePost } from '../api/posts'
import { useAuth } from '../auth/useAuth'
import { PostForm } from '../components/PostForm'
import { canModifyPost } from '../lib/permissions'
import type { PostRequest } from '../types/api'

export function EditPostPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: post,
    error,
    isPending,
  } = useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => getPost(id),
  })

  const mutation = useMutation({
    mutationFn: (values: PostRequest) => updatePost(id, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(postKeys.detail(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      navigate(`/posts/${updated.id}`)
    },
  })

  if (isPending) {
    return <p>Loading…</p>
  }

  if (error) {
    return (
      <section>
        <h1>Post not found</h1>
        <Link to="/">Back to posts</Link>
      </section>
    )
  }

  if (!canModifyPost(user, post)) {
    return (
      <section>
        <h1>Not allowed</h1>
        <p>You can only edit your own posts.</p>
        <Link to={`/posts/${post.id}`}>Back to the post</Link>
      </section>
    )
  }

  return (
    <section>
      <h1>Edit post</h1>
      <PostForm
        defaultValues={{ title: post.title, content: post.content }}
        submitLabel="Save changes"
        cancelTo={`/posts/${post.id}`}
        onSubmit={mutation.mutateAsync}
      />
    </section>
  )
}
