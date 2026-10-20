import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) {
          return false // une erreur 4xx ne se corrige pas en réessayant
        }
        return failureCount < 2
      },
    },
  },
})
