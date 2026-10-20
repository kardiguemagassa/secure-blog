import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { AuthContext } from '../auth/AuthContext'
import type { AuthContextValue } from '../auth/AuthContext'
import { LoginPage } from './LoginPage'

function renderLoginPage(overrides: Partial<AuthContextValue> = {}) {
  const auth: AuthContextValue = {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    ...overrides,
  }

  render(
    <AuthContext value={auth}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<p>Home page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext>,
  )

  return auth
}

describe('LoginPage', () => {
  it('shows validation errors and does not call the API when the form is empty', async () => {
    const user = userEvent.setup()
    const auth = renderLoginPage()

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(auth.login).not.toHaveBeenCalled()
  })

  it('logs in with the typed credentials and redirects to the home page', async () => {
    const user = userEvent.setup()
    const auth = renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'alice@example.com')
    await user.type(screen.getByLabelText('Password'), 'S3curePassw0rd!')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(auth.login).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'S3curePassw0rd!',
    })
    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('shows a generic message when the credentials are rejected', async () => {
    const user = userEvent.setup()
    renderLoginPage({ login: vi.fn().mockRejectedValue(new ApiError(401)) })

    await user.type(screen.getByLabelText('Email'), 'alice@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
  })

  it('shows a retry message when the login fails for another reason', async () => {
    const user = userEvent.setup()
    renderLoginPage({ login: vi.fn().mockRejectedValue(new Error('Network down')) })

    await user.type(screen.getByLabelText('Email'), 'alice@example.com')
    await user.type(screen.getByLabelText('Password'), 'S3curePassw0rd!')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Login failed, please try again')).toBeInTheDocument()
  })

  it('redirects an already authenticated user', async () => {
    renderLoginPage({ isAuthenticated: true })

    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })
})
