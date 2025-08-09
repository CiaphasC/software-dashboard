import { create } from 'zustand'

export interface PaginatedState<TItem, TMetrics, TFilters = Record<string, unknown>> {
  items: TItem[]
  loading: boolean
  error: string | null
  currentPage: number
  itemsPerPage: number
  total: number
  hasMore: boolean
  loadedPages: number
  searchQuery: string
  filters: TFilters
  stats: TMetrics
}

export interface PaginatedActions<TItem, TQuery, TMetrics, TFilters> {
  load: (query?: Partial<TQuery>) => Promise<void>
  loadMore: () => Promise<void>
  setFilters: (filters: TFilters) => void
  setSearch: (query: string) => void
  clearFilters: () => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateStats: () => Promise<void>
  // Compat helpers para stores existentes
  loadIncidents?: (filters?: TFilters) => Promise<void>
  loadMoreIncidents?: () => Promise<void>
}

export type PaginatedStore<TItem, TQuery, TMetrics, TFilters> = PaginatedState<TItem, TMetrics, TFilters> & PaginatedActions<TItem, TQuery, TMetrics, TFilters>

interface CreateStoreParams<TItem, TQuery, TMetrics, TRawItem = unknown, TFilters = Record<string, unknown>> {
  initialStats: TMetrics
  defaultItemsPerPage?: number
  list: (query: TQuery) => Promise<{ items: TRawItem[]; total: number; page: number; limit: number; hasMore: boolean }>
  metrics: () => Promise<TMetrics>
  mapToDomain?: (raw: TRawItem) => TItem
}

export function createPaginatedEntityStore<TItem, TQuery extends { page?: number; limit?: number; search?: string; filters?: TFilters }, TMetrics, TRawItem = TItem, TFilters = Record<string, unknown>>(
  params: CreateStoreParams<TItem, TQuery, TMetrics, TRawItem, TFilters>
) {
  const {
    initialStats,
    defaultItemsPerPage = 10,
    list,
    metrics,
    mapToDomain,
  } = params

  return create<PaginatedStore<TItem, TQuery, TMetrics, TFilters>>((set, get) => ({
    items: [],
    loading: false,
    error: null,
    currentPage: 1,
    itemsPerPage: defaultItemsPerPage,
    total: 0,
    hasMore: true,
    loadedPages: 0,
    searchQuery: '',
    filters: {} as TFilters,
    stats: initialStats,

    async load(partial?: Partial<TQuery>) {
      set({ loading: true, error: null })
      try {
        const { currentPage, itemsPerPage, searchQuery, filters } = get()
        const query = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          filters: filters as unknown as TQuery['filters'],
          ...(partial as TQuery)
        } as TQuery

        const res = await list(query)
        const items = mapToDomain ? res.items.map(mapToDomain) : (res.items as unknown as TItem[])
        set((state) => ({
          items: query.page === 1 ? items : [...state.items, ...items],
          total: res.total,
          hasMore: res.hasMore,
          loadedPages: res.page,
          loading: false,
          error: null,
        }))
        // actualizar métricas al vuelo
        get().updateStats()
      } catch (err) {
        set({ loading: false, error: err instanceof Error ? err.message : 'Error al cargar' })
      }
    },

    async loadMore() {
      const { hasMore, currentPage } = get()
      if (!hasMore) return
      set({ currentPage: currentPage + 1 })
      await get().load()
    },

    setFilters(newFilters: TFilters) {
      set({ filters: newFilters, currentPage: 1, hasMore: true })
      get().load({ filters: newFilters as unknown as TQuery['filters'] })
    },

    setSearch(query: string) {
      set({ searchQuery: query, currentPage: 1, hasMore: true })
      get().load()
    },

    clearFilters() {
      set({ filters: {} as TFilters, searchQuery: '', currentPage: 1, hasMore: true })
      get().load()
    },

    setPage(page: number) {
      set({ currentPage: page })
      get().load()
    },

    setPageSize(size: number) {
      set({ itemsPerPage: size, currentPage: 1 })
      get().load()
    },

    setLoading(loading: boolean) { set({ loading }) },
    setError(error: string | null) { set({ error }) },

    async updateStats() {
      try {
        const s = await metrics()
        set({ stats: s })
      } catch {
        // fallback: si falla, no alterar stats
      }
    },
  }))
}

