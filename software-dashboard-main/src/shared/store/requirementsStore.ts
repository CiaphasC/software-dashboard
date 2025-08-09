// =============================================================================
// REQUIREMENTS STORE - Store centralizado para gestión de requerimientos
// Arquitectura de Software Profesional - Gestión de Estado de Requerimientos
// =============================================================================

import { FilterValues } from '@/shared/types/common.types'
import { dataService } from '@/shared/services/supabase'
import { requirementsRepository, type RequirementQuery } from '@/shared/repositories/RequirementsRepository'
import type { RequirementDomain, RequirementMetricsDomain } from '@/shared/domain/requirement'
import { createPaginatedEntityStore } from '@/shared/store/createPaginatedEntityStore'
import { logAndExtractError } from '@/shared/utils/errorUtils'
import { withOptimisticItems, updateItemById, removeItemById, prependPlaceholder } from '@/shared/store/optimistic'

// =============================================================================
// REQUIREMENTS STATE - Estado de requerimientos
// =============================================================================

export interface RequirementsState {
  // Lista de requerimientos
  requirements: RequirementDomain[];
  loading: boolean;
  error: string | null;
  
  // Filtros y búsqueda
  filters: FilterValues;
  searchQuery: string;
  
  // Paginación
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasMore: boolean;
  loadedPages: number;
  
  // Estadísticas
  stats: RequirementMetricsDomain;
}

// =============================================================================
// REQUIREMENTS ACTIONS - Acciones de requerimientos
// =============================================================================

export interface RequirementsActions {
  // CRUD de requerimientos
  loadRequirements: (filters?: FilterValues) => Promise<void>;
  createRequirement: (requirementData: any) => Promise<void>;
  updateRequirement: (id: string, updates: any) => Promise<void>;
  deleteRequirement: (id: string) => Promise<void>;
  loadMoreRequirements: () => Promise<void>;
  
  // Filtros y búsqueda
  setFilters: (filters: FilterValues) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Paginación
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  
  // Gestión de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Estadísticas
  updateStats: () => void;
}

// =============================================================================
// REQUIREMENTS STORE - Store completo de requerimientos
// =============================================================================

// Base store con factory genérica
const useRequirementsBase = createPaginatedEntityStore<
  RequirementDomain,
  RequirementQuery,
  RequirementMetricsDomain,
  RequirementDomain,
  FilterValues
>({
  initialStats: {
    totalRequirements: 0,
    pendingRequirements: 0,
    inProgressRequirements: 0,
    completedRequirements: 0,
    deliveredRequirements: 0,
  },
  defaultItemsPerPage: 10,
  list: (query) => requirementsRepository.list(query),
  metrics: () => requirementsRepository.metrics(),
  mapToDomain: (r) => r,
})

// Guardar referencias a acciones base que vamos a envolver para evitar recursión
const baseSetFilters = useRequirementsBase.getState().setFilters
const baseClearFilters = useRequirementsBase.getState().clearFilters

// Extensiones específicas y compatibilidad con API actual
useRequirementsBase.setState((state) => ({
  // Alias de datos para compatibilidad
  requirements: state.items as RequirementDomain[],

  // Carga principal con sincronización del alias
  loadRequirements: async (filters?: FilterValues) => {
    if (filters) {
      useRequirementsBase.getState().setFilters(filters)
    }
    await useRequirementsBase.getState().load()
    useRequirementsBase.setState((s) => ({ requirements: s.items as RequirementDomain[] }))
  },

  // Carga incremental
  loadMoreRequirements: async () => {
    await useRequirementsBase.getState().loadMore()
    useRequirementsBase.setState((s) => ({ requirements: s.items as RequirementDomain[] }))
  },

  // Búsqueda y paginación, manteniendo mirror
  setSearchQuery: (query: string) => {
    useRequirementsBase.getState().setSearch(query)
    // La ejecución de load ocurre dentro de setSearch; luego espejamos
    setTimeout(() => useRequirementsBase.setState((s) => ({ requirements: s.items as RequirementDomain[] })), 0)
  },
  setCurrentPage: (page: number) => {
    useRequirementsBase.getState().setPage(page)
    setTimeout(() => useRequirementsBase.setState((s) => ({ requirements: s.items as RequirementDomain[] })), 0)
  },
  setItemsPerPage: (items: number) => {
    useRequirementsBase.getState().setPageSize(items)
    setTimeout(() => useRequirementsBase.setState((s) => ({ requirements: s.items as RequirementDomain[] })), 0)
  },
  setFilters: (filters: FilterValues) => {
    // Usar referencia original para evitar que setFilters se invoque a sí mismo
    baseSetFilters(filters)
    setTimeout(() => useRequirementsBase.setState((s) => ({ requirements: s.items as RequirementDomain[] })), 0)
  },
  clearFilters: () => {
    baseClearFilters()
    setTimeout(() => useRequirementsBase.setState((s) => ({ requirements: s.items as RequirementDomain[] })), 0)
  },

  // Estado
  clearError: () => useRequirementsBase.setState({ error: null }),

  // CRUD con normalización de errores y recarga
  createRequirement: async (requirementData: Partial<RequirementDomain>) => {
    const adapter = { get: useRequirementsBase.getState, set: useRequirementsBase.setState }
    await withOptimisticItems<RequirementDomain, ReturnType<typeof useRequirementsBase.getState>>(adapter as any, (items) => {
      const tempId = `temp-${Date.now()}`
      const placeholder: RequirementDomain = {
        id: tempId,
        title: requirementData.title || 'Creando...',
        description: requirementData.description || '',
        status: (requirementData.status as any) || 'pending',
        priority: (requirementData.priority as any) || 'medium',
        type: (requirementData.type as any) || 'other',
        createdAt: new Date().toISOString(),
        creatorName: requirementData.creatorName ?? null,
        requestingAreaName: requirementData.requestingAreaName ?? null,
        estimatedDeliveryDate: requirementData.estimatedDeliveryDate ?? null,
      }
      return prependPlaceholder(items, placeholder)
    }, async () => {
      await dataService.createRequirement(requirementData)
      await useRequirementsBase.getState().load()
      useRequirementsBase.setState((s) => ({ requirements: s.items as RequirementDomain[] }))
    })
  },
  updateRequirement: async (id: string, updates: Partial<RequirementDomain>) => {
    const adapter = { get: useRequirementsBase.getState, set: useRequirementsBase.setState }
    await withOptimisticItems<RequirementDomain, ReturnType<typeof useRequirementsBase.getState>>(adapter as any, (items) => updateItemById(items, id, (curr) => ({ ...curr, ...updates })), async () => {
      await dataService.updateRequirement(id, updates)
      await useRequirementsBase.getState().load()
      useRequirementsBase.setState((s) => ({ requirements: s.items as RequirementDomain[] }))
    })
  },
  deleteRequirement: async (id: string) => {
    const adapter = { get: useRequirementsBase.getState, set: useRequirementsBase.setState }
    await withOptimisticItems<RequirementDomain, ReturnType<typeof useRequirementsBase.getState>>(adapter as any, (items) => removeItemById(items, id), async () => {
      await dataService.deleteRequirement(id)
      await useRequirementsBase.getState().load()
      useRequirementsBase.setState((s) => ({ requirements: s.items as RequirementDomain[] }))
    })
  },
}))

export const useRequirementsStore = useRequirementsBase as unknown as (typeof useRequirementsBase & {
  getState: () => ReturnType<typeof useRequirementsBase.getState> & {
    requirements: RequirementDomain[]
    loadRequirements: (filters?: FilterValues) => Promise<void>
    loadMoreRequirements: () => Promise<void>
    setSearchQuery: (query: string) => void
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void
    clearError: () => void
    createRequirement: (data: unknown) => Promise<void>
    updateRequirement: (id: string, updates: unknown) => Promise<void>
    deleteRequirement: (id: string) => Promise<void>
  }
})