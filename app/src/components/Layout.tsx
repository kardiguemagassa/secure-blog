import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { Footer } from './Footer'
import { ThemeToggle } from './ThemeToggle'
import styles from './Layout.module.css'

export function Layout() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    function closeMenu() {
        setMenuOpen(false)
    }

    function handleLogout() {
        logout()
        closeMenu()
        navigate('/')
    }

    return (
        <div className={styles.shell}>
            <a href="#main" className={styles.skipLink}>
                Skip to content
            </a>

            <header className={styles.header}>
                <div className={styles.inner}>
                    <Link
                        to="/"
                        className={styles.wordmark}
                        onClick={closeMenu}
                    >
                        Secure Blog
                    </Link>

                    <div className={styles.headerActions}>
                        <div className={styles.mobileTheme}>
                            <ThemeToggle />
                        </div>

                        <button
                            type="button"
                            className={styles.menuButton}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                            aria-controls="main-navigation"
                            onClick={() => setMenuOpen((open) => !open)}
                        >
              <span aria-hidden="true">
                {menuOpen ? '✕' : '☰'}
              </span>
                        </button>
                    </div>

                    <nav
                        id="main-navigation"
                        aria-label="Main"
                        className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
                    >
                        <NavLink to="/" end onClick={closeMenu}>
                            Posts
                        </NavLink>

                        {isAuthenticated ? (
                            <>
                                <NavLink to="/me/posts" onClick={closeMenu}>
                                    My posts
                                </NavLink>

                                {isAdmin && (
                                    <NavLink to="/admin/users" onClick={closeMenu}>
                                        Admin
                                    </NavLink>
                                )}

                                <NavLink to="/me" end onClick={closeMenu}>
                                    {user?.username}
                                </NavLink>

                                <Link
                                    to="/posts/new"
                                    className="button"
                                    onClick={closeMenu}
                                >
                                    New post
                                </Link>

                                <button
                                    type="button"
                                    className="button-secondary"
                                    onClick={handleLogout}
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" onClick={closeMenu}>
                                    Log in
                                </NavLink>

                                <Link
                                    to="/register"
                                    className="button"
                                    onClick={closeMenu}
                                >
                                    Sign up
                                </Link>
                            </>
                        )}

                        <div className={styles.desktopTheme}>
                            <ThemeToggle />
                        </div>
                    </nav>
                </div>
            </header>

            <main id="main" className={styles.main} tabIndex={-1}>
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}