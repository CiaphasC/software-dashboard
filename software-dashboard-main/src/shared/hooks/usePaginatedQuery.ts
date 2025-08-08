import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface PaginatedParams {
  page?: number
  limit?: number
  [key: string]: any
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface UsePaginatedQueryOptions<T> {
  fetchPage: (params: PaginatedParams, signal: AbortSignal) => Promise<PaginatedResult<T>>
  initialParams?: PaginatedParams
  deps?: any[]
  merge?: boolean
}

export function usePaginatedQuery<T>(options: UsePaginatedQueryOptions<T>) {
  const { fetchPage, initialParams = { page: 1, limit: 20 }, deps = [], merge = true } = options
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(initialParams.page ?? 1)
  const [limit, setLimit] = useState(initialParams.limit ?? 20)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async (nextPage: number, reset: boolean) => {
    if (loading) return
    setLoading(true)
    setError(null)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const result = await fetchPage({ ...initialParams, page: nextPage, limit }, controller.signal)
      setItems((prev) => (reset || !merge ? result.items : [...prev, ...result.items]))
      setTotal(result.total)
      setHasMore(result.hasMore)
      setPage(result.page)
    } catch (e: any) {
      if (e?.message !== 'Request aborted') setError(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }, [fetchPage, initialParams, limit, merge, loading])

  const reload = useCallback(() => {
    load(1, true)
  }, [load])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    load(page + 1, false)
  }, [hasMore, loading, page, load])

  useEffect(() => {
    reload()
    return () => abortRef.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return useMemo(() => ({ items, total, page, limit, hasMore, loading, error, reload, loadMore, setLimit }), [items, total, page, limit, hasMore, loading, error, reload, loadMore])
}

