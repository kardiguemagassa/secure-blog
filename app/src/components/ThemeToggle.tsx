import { useState } from 'react'
import styles from './ThemeToggle.module.css'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme')

  if (saved === 'light' || saved === 'dark') {
    return saved
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  function toggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light'

    document.documentElement.dataset.theme = nextTheme
    localStorage.setItem('theme', nextTheme)
    setTheme(nextTheme)
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
    </button>
  )
}
