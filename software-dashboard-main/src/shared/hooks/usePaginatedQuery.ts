import { useCallback, useRef } from 'react'

export interface PaginatedState<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export function usePaginatedQuery<T>(fetchPage: (page: number, limit: number) => Promise<PaginatedState<T>>) {
  const isLoadingRef = useRef(false)

  const loadPage = useCallback(async (page: number, limit: number, prev: T[] = []) => {
    if (isLoadingRef.current) return { items: prev, total: 0, page, limit, hasMore: false }
    isLoadingRef.current = true
    try {
      const result = await fetchPage(page, limit)
      return {
        items: page === 1 ? result.items : [...prev, ...result.items],
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
      }
    } finally {
      isLoadingRef.current = false
    }
  }, [fetchPage])

  return { loadPage }
}

