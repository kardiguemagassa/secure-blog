import { useAuth } from '../auth/useAuth'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <section>
      <h1>My profile</h1>
      <dl>
        <dt>Username</dt>
        <dd>{user?.username}</dd>
        <dt>Email</dt>
        <dd>{user?.email}</dd>
        <dt>Role</dt>
        <dd>{user?.role}</dd>
      </dl>
    </section>
  )
}
