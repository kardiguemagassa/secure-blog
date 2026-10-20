import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getMyPosts, postKeys } from '../api/posts'
import { PostList } from '../components/PostList'
import { usePageParam } from '../hooks/usePageParam'
import styles from './MyPostsPage.module.css'

export function MyPostsPage() {
  const [page, setPage] = usePageParam()

  const query = useQuery({
    queryKey: postKeys.mine(page),
    queryFn: () => getMyPosts(page - 1),
    placeholderData: keepPreviousData,
  })

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Your writing space
          </p>

          <h1 className={styles.title}>My stories</h1>

          <p className={styles.description}>A home for everything you've written and shared.</p>
        </div>

        <Link to="/posts/new" className={styles.createButton}>
          Write a story
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      <section className={styles.postsSection} aria-label="Your published stories">
        <PostList
          query={query}
          page={page}
          onPageChange={setPage}
          emptyMessage="You have not written any stories yet."
        />
      </section>
    </main>
  )
}
