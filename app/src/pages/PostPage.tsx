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
    enabled: !deleteMutation.isPending && !deleteMutation.isSuccess,
  })

  function handleDelete() {
    if (window.confirm('Delete this story? This cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  if (isPending) {
    return <p>Loading…</p>
  }

  if (error || !post) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400)

    return (
      <section>
        <h1>{notFound ? 'Story not found' : 'Something went wrong'}</h1>
        <Link to="/">Back to stories</Link>
      </section>
    )
  }

  return (
    <article className={styles.article}>
      <nav className={styles.navigation} aria-label="Article navigation">
        <Link to="/" className={styles.backLink}>
          <span aria-hidden="true">←</span> Back to stories
        </Link>
      </nav>

      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          THE COMMUNITY JOURNAL
        </p>

        <h1 className={styles.title}>{post.title}</h1>

        <div className={styles.meta}>
          <span className={styles.avatar} aria-hidden="true">
            {post.authorUsername.charAt(0).toUpperCase()}
          </span>

          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{post.authorUsername}</span>

            <time className={styles.date} dateTime={post.createdAt}>
              {formatDate(post.createdAt)}
            </time>
          </div>
        </div>
      </header>

      <div className={styles.content}>{post.content}</div>

      <footer className={styles.footer}>
        <Link to="/" className={styles.backLink}>
          <span aria-hidden="true">←</span> All stories
        </Link>

        {canModifyPost(user, post) && (
          <div className={styles.actions}>
            <Link to={`/posts/${post.id}/edit`} className={styles.editButton}>
              Edit story <span aria-hidden="true">→</span>
            </Link>

            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete story'}
            </button>
          </div>
        )}
      </footer>

      {deleteMutation.error && (
        <p role="alert">
          {deleteMutation.error instanceof ApiError && deleteMutation.error.status === 403
            ? 'You are not allowed to delete this story'
            : 'Could not delete the story, please try again'}
        </p>
      )}
    </article>
  )
}
