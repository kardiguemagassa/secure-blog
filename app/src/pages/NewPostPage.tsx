import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { createPost, postKeys } from '../api/posts'
import { PostForm } from '../components/PostForm'

export function NewPostPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post) // la page de détail s'affiche sans nouvel appel
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() }) // la liste sera rechargée
      navigate(`/posts/${post.id}`)
    },
  })

  return (
    <section>
      <h1>New post</h1>
      <PostForm submitLabel="Publish" cancelTo="/" onSubmit={mutation.mutateAsync} />
    </section>
  )
}
