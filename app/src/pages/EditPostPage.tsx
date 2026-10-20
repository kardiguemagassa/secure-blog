import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { getPost, postKeys, updatePost } from '../api/posts'
import { useAuth } from '../auth/useAuth'
import { PostForm } from '../components/PostForm'
import { canModifyPost } from '../lib/permissions'
import type { PostRequest } from '../types/api'
import styles from './EditPostPage.module.css'

export function EditPostPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: post,
    error,
    isPending,
  } = useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => getPost(id),
  })

  const mutation = useMutation({
    mutationFn: (values: PostRequest) => updatePost(id, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(postKeys.detail(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      navigate(`/posts/${updated.id}`)
    },
  })

  if (isPending) {
    return <p>Loading…</p>
  }

  if (error) {
    return (
        <section>
          <h1>Post not found</h1>
          <Link to="/">Back to posts</Link>
        </section>
    )
  }

  if (!canModifyPost(user, post)) {
    return (
        <section>
          <h1>Not allowed</h1>
          <p>You can only edit your own posts.</p>
          <Link to={`/posts/${post.id}`}>Back to the post</Link>
        </section>
    )
  }

  return (
      <section className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.dot} aria-hidden="true" />
            YOUR WRITING SPACE
          </p>

          <h1 className={styles.title}>
            Edit your story<span className={styles.accent}>.</span>
          </h1>

          <p className={styles.subtitle}>
            Every story can evolve. Make yours even better.
          </p>
        </header>

        <div className={styles.card}>
          <PostForm
              defaultValues={{ title: post.title, content: post.content }}
              submitLabel="Save changes"
              cancelTo={`/posts/${post.id}`}
              onSubmit={mutation.mutateAsync}
          />
        </div>
      </section>
  )
}
