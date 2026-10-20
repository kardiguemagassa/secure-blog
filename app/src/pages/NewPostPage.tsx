import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { createPost, postKeys } from '../api/posts'
import { PostForm } from '../components/PostForm'
import styles from './NewPostPage.module.css'

export function NewPostPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post)
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      navigate(`/posts/${post.id}`)
    },
  })

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden="true" />
          YOUR WRITING SPACE
        </p>

        <h1 className={styles.title}>
          Create a story<span>.</span>
        </h1>

        <p className={styles.description}>
          Every great story begins with a thought. Share yours with the world.
        </p>
      </div>

      <div className={styles.card}>
        <PostForm
          submitLabel="Publish story"
          cancelTo="/me/posts"
          onSubmit={mutation.mutateAsync}
        />
      </div>
    </section>
  )
}
