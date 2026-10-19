import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PostPage } from './pages/PostPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { EditPostPage } from './pages/EditPostPage'
import { NewPostPage } from './pages/NewPostPage'
import { MyPostsPage } from './pages/MyPostsPage'
import { AdminUsersPage } from './pages/AdminUsersPage.tsx'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'posts/:id', element: <PostPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'me', element: <ProfilePage /> },
          { path: 'me/posts', element: <MyPostsPage /> },
          { path: 'posts/new', element: <NewPostPage /> },
          { path: 'posts/:id/edit', element: <EditPostPage /> },
        ],
      },
      {
        element: <ProtectedRoute role="ROLE_ADMIN" />,
        children: [{ path: 'admin/users', element: <AdminUsersPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
