import { Link } from 'react-router'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          404 — Page not found
        </p>

        <div className={styles.errorCode} aria-hidden="true">
          404<span>.</span>
        </div>

        <h1 className={styles.title}>
          Lost in the <span className={styles.accent}>words.</span>
        </h1>

        <p className={styles.description}>
          The page you're looking for doesn't exist or has been moved. Let's get you back to the
          stories.
        </p>

        <Link to="/" className={styles.homeButton}>
          Back to home
          <span aria-hidden="true">↗</span>
        </Link>

        <p className={styles.footer}>Every great story starts somewhere.</p>
      </div>
    </section>
  )
}
