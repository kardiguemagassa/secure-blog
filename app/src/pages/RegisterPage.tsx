import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useNavigate } from 'react-router'
import { register as registerRequest } from '../api/auth'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { FormField } from '../components/FormField'
import { applyServerValidationErrors } from '../lib/formErrors'
import styles from './AuthPage.module.css'

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be at most 50 characters')
      .regex(/^[a-zA-Z0-9._-]+$/, "Only letters, digits, '.', '_' and '-' are allowed"),
    email: z.email('Enter a valid email address').max(254, 'Email is too long'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  })

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(values: RegisterFormValues) {
    const { username, email, password } = values

    try {
      await registerRequest({ username, email, password })
    } catch (error) {
      if (applyServerValidationErrors(error, setError)) {
        return
      }

      if (error instanceof ApiError && error.status === 409) {
        const detail = error.problem?.detail ?? ''

        if (detail.startsWith('Email')) {
          setError('email', { message: 'This email is already registered' })
        } else if (detail.startsWith('Username')) {
          setError('username', { message: 'This username is already taken' })
        } else {
          setError('root', { message: 'An account with these details already exists' })
        }
        return
      }

      setError('root', { message: 'Registration failed, please try again' })
      return
    }

    try {
      await login({ email, password })
      navigate('/', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Join the community
          </p>
          <h1 className={styles.title}>
            Sign up<span className={styles.accent}>.</span>
          </h1>
          <p className={styles.description}>
            Every great story starts somewhere. Start yours today.
          </p>
        </header>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField
              id="username"
              label="Username"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />

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
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <FormField
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {errors.root && (
              <p className={styles.error} role="alert">
                {errors.root.message}
              </p>
            )}

            <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
              {!isSubmitting && <span aria-hidden="true">↗</span>}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
