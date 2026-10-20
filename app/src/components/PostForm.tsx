import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router'
import { ApiError } from '../api/client'
import { applyServerValidationErrors } from '../lib/formErrors'
import type { PostRequest } from '../types/api'
import { FormField } from './FormField'
import { TextAreaField } from './TextAreaField'
import styles from './PostForm.module.css'

// mêmes règles que PostRequest.java
const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  content: z
    .string()
    .trim()
    .min(1, 'Content is required')
    .max(20_000, 'Content must be at most 20,000 characters'),
})

type PostFormValues = z.infer<typeof postSchema>

interface PostFormProps {
  defaultValues?: PostRequest
  submitLabel: string
  cancelTo: string
  onSubmit: (values: PostRequest) => Promise<unknown>
}

export function PostForm({ defaultValues, submitLabel, cancelTo, onSubmit }: PostFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: defaultValues ?? { title: '', content: '' },
  })

  async function submit(values: PostFormValues) {
    try {
      await onSubmit(values)
    } catch (error) {
      if (applyServerValidationErrors(error, setError)) {
        return
      }
      setError('root', { message: errorMessage(error) })
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
      <FormField id="title" label="Title" error={errors.title?.message} {...register('title')} />
      <TextAreaField
        id="content"
        label="Content"
        error={errors.content?.message}
        {...register('content')}
      />

      {errors.root && <p role="alert">{errors.root.message}</p>}

      <div className={styles.actions}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        <Link to={cancelTo}>Cancel</Link>
      </div>
    </form>
  )
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'You are not allowed to modify this story'
    if (error.status === 404) return 'This story no longer exists'
  }
  return 'Could not save the story, please try again'
}
