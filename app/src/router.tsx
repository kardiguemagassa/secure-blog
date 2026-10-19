import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import {RegisterPage} from "./pages/RegisterPage.tsx";

export const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'login', element: <LoginPage /> },
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
            {
                element: <ProtectedRoute />,
                children: [{ path: 'me', element: <ProfilePage /> }],
            },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
])