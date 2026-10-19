import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'

export function Layout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <>
      <header>
        <nav>
          <Link to="/">Secure Blog</Link>
          {isAdmin && <NavLink to="/admin/users">Admin</NavLink>}
          {isAuthenticated ? (
            <>
              <NavLink to="/posts/new">New post</NavLink>
              <NavLink to="/me/posts">My posts</NavLink>
              {isAdmin && <NavLink to="/admin/users">Admin</NavLink>}
              <NavLink to="/me" end>
                {user?.username}
              </NavLink>
              <button type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Sign up</NavLink>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
