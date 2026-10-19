import { Link } from 'react-router'
import { excerpt, formatDate } from '../lib/format'
import type { PostResponse } from '../types/api'
import styles from './PostCard.module.css'

export function PostCard({ post }: { post: PostResponse }) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h2>
      <p className={styles.meta}>
        By {post.authorUsername} ·{' '}
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
      </p>
      <p className={styles.excerpt}>{excerpt(post.content)}</p>
    </article>
  )
}
