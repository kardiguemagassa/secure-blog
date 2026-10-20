import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav aria-label="Pagination" className={styles.pagination}>
      <button
        type="button"
        className={styles.pageButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ← Previous
      </button>

      <span className={styles.status}>
        {page} / {totalPages}
      </span>

      <button
        type="button"
        className={styles.pageButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next →
      </button>
    </nav>
  )
}
