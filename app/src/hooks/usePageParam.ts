import { useSearchParams } from 'react-router'
import { parsePage } from '../lib/pagination'

export function usePageParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))

  function setPage(next: number) {
    setSearchParams(next === 1 ? {} : { page: String(next) })
    window.scrollTo({ top: 0 })
  }

  return [page, setPage] as const
}
