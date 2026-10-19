import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import type { Location } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { FormField } from '../components/FormField'

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').max(72, 'Password is too long'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 401
          ? 'Invalid email or password'
          : 'Login failed, please try again'
      setError('root', { message })
    }
  }

  return (
    <section>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {errors.root && <p role="alert">{errors.root.message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p>
        No account yet? <Link to="/register">Sign up</Link>
      </p>
    </section>
  )
}
