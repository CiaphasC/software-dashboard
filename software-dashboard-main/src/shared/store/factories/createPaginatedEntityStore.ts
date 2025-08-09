import { create } from 'zustand'

export interface PaginatedState<TItem, TMetrics = unknown, TFilters = Record<string, unknown>> {
  items: TItem[]
  loading: boolean
  error: string | null

  // filtros y búsqueda
  filters: TFilters
  searchQuery: string

  // paginación
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  hasMore: boolean
  loadedPages: number

  // métricas
  stats: TMetrics
}

export interface PaginatedActions<TItem, TQuery, TMetrics, TFilters> {
  load: (filters?: TFilters) => Promise<void>
  loadMore: () => Promise<void>

  setFilters: (filters: TFilters) => void
  setSearch: (query: string) => void
  clearFilters: () => void

  setPage: (page: number) => void
  setPageSize: (size: number) => void

  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  updateStats: () => Promise<void>
}

export type PaginatedStore<TItem, TQuery, TMetrics, TFilters> =
  PaginatedState<TItem, TMetrics, TFilters> &
  PaginatedActions<TItem, TQuery, TMetrics, TFilters>

export interface CreatePaginatedEntityStoreOptions<TItem, TQuery, TMetrics, TFilters> {
  initialStats: TMetrics
  initialFilters: TFilters

  buildQuery: (state: PaginatedState<TItem, TMetrics, TFilters>) => TQuery

  list: (query: TQuery) => Promise<{ items: TItem[]; total: number; page: number; limit: number; hasMore: boolean }>
  metrics?: () => Promise<TMetrics>
  computeMetricsFallback?: (items: TItem[]) => TMetrics
}

export function createPaginatedEntityStore<TItem, TQuery, TMetrics, TFilters>(
  opts: CreatePaginatedEntityStoreOptions<TItem, TQuery, TMetrics, TFilters>,
  extend?: (base: () => PaginatedStore<TItem, TQuery, TMetrics, TFilters>) => Partial<PaginatedStore<TItem, TQuery, TMetrics, TFilters>>
) {
  const useStore = create<PaginatedStore<TItem, TQuery, TMetrics, TFilters>>((set, get) => ({
    // estado inicial
    items: [],
    loading: false,
    error: null,
    filters: opts.initialFilters,
    searchQuery: '',
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
    hasMore: true,
    loadedPages: 0,
    stats: opts.initialStats,

    // acciones
    async load(filters?: TFilters) {
      set({ loading: true, error: null })
      try {
        if (filters) set({ filters })
        const state = get()
        const query = opts.buildQuery(state)
        const result = await opts.list(query)
        const totalPages = Math.ceil(result.total / state.itemsPerPage)

        set((s) => ({
          items: state.currentPage === 1 ? result.items : [...s.items, ...result.items],
          totalItems: result.total,
          totalPages,
          hasMore: result.hasMore,
          loadedPages: result.page,
          loading: false,
          error: null,
        }))
        await get().updateStats()
      } catch (e) {
        set({ loading: false, error: e instanceof Error ? e.message : 'Error al cargar datos' })
      }
    },

    async loadMore() {
      const { hasMore, currentPage } = get()
      if (!hasMore) return
      set({ currentPage: currentPage + 1 })
      await get().load()
    },

    setFilters(next) {
      set({ filters: next, currentPage: 1, hasMore: true })
      void get().load(next)
    },

    setSearch(query) {
      set({ searchQuery: query, currentPage: 1, hasMore: true })
      void get().load()
    },

    clearFilters() {
      set({ filters: opts.initialFilters, searchQuery: '', currentPage: 1, hasMore: true })
      void get().load()
    },

    setPage(page) {
      set({ currentPage: page })
      void get().load()
    },

    setPageSize(size) {
      set({ itemsPerPage: size, currentPage: 1 })
      void get().load()
    },

    setLoading(loading) { set({ loading }) },
    setError(error) { set({ error }) },
    clearError() { set({ error: null }) },

    async updateStats() {
      try {
        if (opts.metrics) {
          const stats = await opts.metrics()
          set({ stats })
        } else if (opts.computeMetricsFallback) {
          const stats = opts.computeMetricsFallback(get().items)
          set({ stats })
        }
      } catch {
        if (opts.computeMetricsFallback) {
          const stats = opts.computeMetricsFallback(get().items)
          set({ stats })
        }
      }
    },
  }))

  if (extend) {
    const extra = extend(useStore)
    // @ts-expect-error intentional merge of partial actions
    useStore.setState({ ...useStore.getState(), ...extra })
  }

  return useStore
}

