import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import { getPosts, postKeys } from '../api/posts'
import { Pagination } from '../components/Pagination'
import { PostCard } from '../components/PostCard'

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page')) // page 1 dans l'URL = page 0 côté API

  const { data, error, isPending, isPlaceholderData } = useQuery({
    queryKey: postKeys.list(page),
    queryFn: () => getPosts(page - 1),
    placeholderData: keepPreviousData, // garde la page affichée pendant le chargement de la suivante
  })

  function goToPage(next: number) {
    setSearchParams(next === 1 ? {} : { page: String(next) })
    window.scrollTo({ top: 0 })
  }

  return (
    <section>
      <h1>Latest posts</h1>

      {isPending && <p>Loading posts…</p>}

      {error && <p role="alert">Could not load posts. Please try again later.</p>}

      {data && data.content.length === 0 && (
        <p>
          {page === 1 ? (
            'No posts yet.'
          ) : (
            <>
              This page is empty. <Link to="/">Back to the first page</Link>
            </>
          )}
        </p>
      )}

      {data && data.content.length > 0 && (
        <div aria-busy={isPlaceholderData}>
          {data.content.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {data && <Pagination page={page} totalPages={data.page.totalPages} onPageChange={goToPage} />}
    </section>
  )
}

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : 1
}
