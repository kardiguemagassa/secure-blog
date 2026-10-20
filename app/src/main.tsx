import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './auth/AuthProvider'
import { queryClient } from './lib/queryClient'
import { router } from './router'
import './index.css'
import '@fontsource-variable/literata'
import '@fontsource-variable/instrument-sans'

const savedTheme = localStorage.getItem('theme')

if (savedTheme === 'light' || savedTheme === 'dark') {
  document.documentElement.dataset.theme = savedTheme
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
