import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './api/client'
import type { Page, PostResponse } from './types/api'

export default function App() {
  const { data, error, isPending } = useQuery({
    queryKey: ['posts', 'smoke-test'],
    queryFn: () => apiFetch<Page<PostResponse>>('/api/posts'),
  })

  return (
      <main>
        <h1>Secure Blog</h1>
        {isPending && <p>Checking API…</p>}
        {error && <p>API error: {error.message}</p>}
        {data && <p>API OK: {data.page.totalElements} post(s)</p>}
      </main>
  )
}