import { useSearchParams } from 'react-router'

export function usePageParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))

  function setPage(next: number) {
    setSearchParams(next === 1 ? {} : { page: String(next) })
    window.scrollTo({ top: 0 })
  }

  return [page, setPage] as const
}

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : 1
}
