import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { ApiError } from '../api/client'
import { getPost, postKeys } from '../api/posts'
import { formatDate } from '../lib/format'
import styles from './PostPage.module.css'

export function PostPage() {
  const { id = '' } = useParams()

  const {
    data: post,
    error,
    isPending,
  } = useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => getPost(id),
  })

  if (isPending) {
    return <p>Loading…</p>
  }

  if (error) {
    // 400 = UUID invalide dans l'URL : pour l'utilisateur, c'est aussi un post introuvable
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
      <div className={styles.content}>{post.content}</div>
      <p>
        <Link to="/">← Back to posts</Link>
      </p>
    </article>
  )
}
