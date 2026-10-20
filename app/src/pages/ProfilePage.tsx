
import { useAuth } from '../auth/useAuth'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
    const { user } = useAuth()

    if (!user) {
        return null
    }

    const roleLabel = user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Member'

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <p className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} aria-hidden="true" />
                    Your account
                </p>

                <h1 className={styles.title}>
                    My profile<span className={styles.titleDot}>.</span>
                </h1>

                <p className={styles.description}>
                    A little space for your account details.
                </p>
            </header>

            <section className={styles.card} aria-label="Account information">
                <div className={styles.identity}>
                    <div className={styles.avatar} aria-hidden="true">
                        {user.username.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h2 className={styles.username}>{user.username}</h2>
                        <p className={styles.memberType}>{roleLabel}</p>
                    </div>
                </div>

                <div className={styles.divider} />

                <dl className={styles.details}>
                    <div className={styles.detailRow}>
                        <dt>Username</dt>
                        <dd>{user.username}</dd>
                    </div>

                    <div className={styles.detailRow}>
                        <dt>Email address</dt>
                        <dd>{user.email}</dd>
                    </div>

                    <div className={styles.detailRow}>
                        <dt>Account role</dt>
                        <dd>
                            <span className={styles.roleBadge}>{roleLabel}</span>
                        </dd>
                    </div>
                </dl>
            </section>
        </main>
    )
}
