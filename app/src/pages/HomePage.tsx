import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getPosts, postKeys } from '../api/posts'
import { useAuth } from '../auth/useAuth'
import { PostList } from '../components/PostList'
import { usePageParam } from '../hooks/usePageParam'
import styles from './HomePage.module.css'

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const [page, setPage] = usePageParam()

  const query = useQuery({
    queryKey: postKeys.list(page),
    queryFn: () => getPosts(page - 1),
    placeholderData: keepPreviousData,
  })

  return (
    <main className={styles.home}>
      {page === 1 && (
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />A place for ideas
            </p>

            <h1 className={styles.title}>
              Words worth
              <br />
              <span>sharing.</span>
            </h1>

            <p className={styles.lead}>
              Discover perspectives, personal stories and useful ideas from a community of writers.
            </p>

            <div className={styles.actions}>
              {isAuthenticated ? (
                <Link to="/posts/new" className={styles.primaryButton}>
                  Write a story <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <Link to="/register" className={styles.primaryButton}>
                  Start writing <span aria-hidden="true">→</span>
                </Link>
              )}

              <a href="#latest-posts" className={styles.secondaryLink}>
                Explore stories <span aria-hidden="true">↓</span>
              </a>
            </div>

            <p className={styles.note}>Read freely. Share thoughtfully.</p>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.visualCard}>
              <span className={styles.cardLabel}>THE ART OF WRITING</span>
              <span className={styles.cardLine} />
              <span className={styles.cardTitle}>
                Every idea
                <br />
                starts somewhere.
              </span>
              <span className={styles.cardFooter}>
                <span className={styles.avatar}>S</span>
                <span>Stories from people</span>
              </span>
            </div>
          </div>
        </section>
      )}

      <section id="latest-posts" className={styles.postsSection} aria-labelledby="posts-heading">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>THE COMMUNITY JOURNAL</p>
            <h2 id="posts-heading" className={styles.sectionTitle}>
              {page === 1 ? 'Latest stories' : 'More stories'}
            </h2>
          </div>

          <span className={styles.sectionCaption}>Ideas, experiences &amp; perspectives</span>
        </div>

        <PostList
          query={query}
          page={page}
          onPageChange={setPage}
          emptyMessage="No stories yet. Be the first to share an idea."
        />
      </section>
    </main>
  )
}
