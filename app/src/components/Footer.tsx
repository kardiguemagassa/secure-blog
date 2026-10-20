import styles from './Footer.module.css'

const REPOSITORY_URL = 'https://github.com/kardiguemagassa/secure-blog'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.about}>
          <span className={styles.name}>Secure Blog</span> is a learning project by Kardigué
          Magassa, built with Spring Boot and React.
        </p>
        <nav aria-label="Footer" className={styles.links}>
          <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
            Source code on GitHub
          </a>
        </nav>
        <p className={styles.copyright}>© {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
