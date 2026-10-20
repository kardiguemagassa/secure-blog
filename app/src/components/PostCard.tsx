
import { Link } from 'react-router'
import { excerpt, formatDate } from '../lib/format'
import type { PostResponse } from '../types/api'
import styles from './PostCard.module.css'

interface PostCardProps {
    post: PostResponse
}

export function PostCard({ post }: PostCardProps) {
    return (
        <article className={styles.card}>
            <h2 className={styles.title}>
                <Link to={`/posts/${post.id}`}>
                    {post.title}
                </Link>
            </h2>

            <time
                className={styles.date}
                dateTime={post.createdAt}
            >
                {formatDate(post.createdAt)}
            </time>

            <p className={styles.excerpt}>
                {excerpt(post.content, 160)}
            </p>

            <div className={styles.footer}>
        <span className={styles.author}>
          <span className={styles.avatar} aria-hidden="true">
            {post.authorUsername.charAt(0).toUpperCase()}
          </span>
            {post.authorUsername}
        </span>

                <Link
                    to={`/posts/${post.id}`}
                    className={styles.readLink}
                    aria-label={`Read ${post.title}`}
                >
                    Read story <span aria-hidden="true">↗</span>
                </Link>
            </div>
        </article>
    )
}
