import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { ApiError } from '../api/client'
import { deletePost, getPost, postKeys } from '../api/posts'
import { useAuth } from '../auth/useAuth'
import { formatDate } from '../lib/format'
import { canModifyPost } from '../lib/permissions'
import styles from './PostPage.module.css'

export function PostPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // déclarée avant useQuery, pour que la requête puisse lire son état
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: postKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      navigate('/', { replace: true })
    },
  })

  const {
    data: post,
    error,
    isPending,
  } = useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => getPost(id),
    // un post en cours de suppression, ou supprimé, ne doit plus être rechargé
    enabled: !deleteMutation.isPending && !deleteMutation.isSuccess,
  })

  function handleDelete() {
    if (window.confirm('Delete this post? This cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  if (isPending) {
    return <p>Loading…</p>
  }

  if (error) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400)
    return (
      <section>
        <h1>{notFound ? 'Post not found' : 'Something went wrong'}</h1>
        <Link to="/">Back to posts</Link>
      </section>
    )
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p className={styles.meta}>
        By {post.authorUsername} ·{' '}
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
      </p>

      {canModifyPost(user, post) && (
        <div className={styles.actions}>
          <Link to={`/posts/${post.id}/edit`}>Edit</Link>
          <button
            type="button"
            className={styles.danger}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}

      {deleteMutation.error && (
        <p role="alert">
          {deleteMutation.error instanceof ApiError && deleteMutation.error.status === 403
            ? 'You are not allowed to delete this post'
            : 'Could not delete the post, please try again'}
        </p>
      )}

      <div className={styles.content}>{post.content}</div>
      <p>
        <Link to="/">← Back to posts</Link>
      </p>
    </article>
  )
}
