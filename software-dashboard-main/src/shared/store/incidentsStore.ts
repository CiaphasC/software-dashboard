// =============================================================================
// INCIDENTS STORE - Store centralizado para gestión de incidencias
// Arquitectura de Software Profesional - Gestión de Estado de Incidencias
// =============================================================================

import type { FilterValues } from '@/shared/types/common.types'
import { dataService } from '@/shared/services/supabase'
import { incidentsRepository, type IncidentQuery } from '@/shared/repositories/IncidentsRepository'
import type { IncidentDomain, IncidentMetricsDomain } from '@/shared/domain/incident'
import { createPaginatedEntityStore } from '@/shared/store/createPaginatedEntityStore'
// import { logAndExtractError } from '@/shared/utils/errorUtils'
import { withOptimisticItems, updateItemById, removeItemById, prependPlaceholder } from '@/shared/store/optimistic'

// =============================================================================
// INCIDENTS STATE - Estado de incidencias
// =============================================================================

export interface IncidentsState {
  // Lista de incidencias
  incidents: IncidentDomain[];
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
  stats: IncidentMetricsDomain;
}

// =============================================================================
// INCIDENTS ACTIONS - Acciones de incidencias
// =============================================================================

export interface IncidentsActions {
  // CRUD de incidencias
  loadIncidents: (filters?: FilterValues) => Promise<void>;
  loadMoreIncidents: () => Promise<void>;
  createIncident: (incidentData: any) => Promise<void>;
  updateIncident: (id: string, updates: any) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  
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
// INCIDENTS STORE - Store completo de incidencias
// =============================================================================

// Base store con factory genérica (paginación/filtrado/metrics)
type IncidentQueryCompat = {
  page?: number
  limit?: number
  search?: string
  filters?: FilterValues
}

const useIncidentsBase = createPaginatedEntityStore<
  IncidentDomain,
  IncidentQueryCompat,
  {
    totalIncidents: number
    openIncidents: number
    inProgressIncidents: number
    resolvedIncidents: number
    closedIncidents: number
  },
  IncidentDomain,
  FilterValues
>({
  initialStats: {
    totalIncidents: 0,
    openIncidents: 0,
    inProgressIncidents: 0,
    resolvedIncidents: 0,
    closedIncidents: 0,
  },
  defaultItemsPerPage: 10,
  list: (query) => incidentsRepository.list({
    page: query.page,
    limit: query.limit,
    search: query.search,
    filters: query.filters,
  } as IncidentQuery),
  metrics: () => incidentsRepository.metrics(),
  mapToDomain: (i) => i,
})


// Extensiones específicas del dominio para mantener API previa sin romper componentes
useIncidentsBase.setState(() => ({
  // Carga con compatibilidad
  // loadIncidents(filters?): aplica filtros (si llegan) y dispara load()
  // loadMoreIncidents(): hace delegación a loadMore()
  // setSearchQuery(): delega a setSearch()
  // setCurrentPage / setItemsPerPage: delega a setPage / setPageSize
  // clearError(): utilidad pequeña
  // CRUD: create/update/delete vía servicios existentes y recarga
  // Nota: estas claves nuevos conviven con el estado del factory
  loadIncidents: async (filters?: FilterValues) => {
    if (filters) {
      useIncidentsBase.getState().setFilters(filters)
    }
    await useIncidentsBase.getState().load()
  },
  loadMoreIncidents: async () => {
    await useIncidentsBase.getState().loadMore()
  },
  setSearchQuery: (query: string) => {
    useIncidentsBase.getState().setSearch(query)
    // sincronización posterior en próxima carga
  },
  setCurrentPage: (page: number) => {
    useIncidentsBase.getState().setPage(page)
    // sincronización posterior en próxima carga
  },
  setItemsPerPage: (items: number) => {
    useIncidentsBase.getState().setPageSize(items)
    // sincronización posterior en próxima carga
  },
  clearError: () => useIncidentsBase.setState({ error: null }),
  createIncident: async (incidentData: Partial<IncidentDomain>) => {
    const adapter = { get: useIncidentsBase.getState, set: useIncidentsBase.setState }
    await withOptimisticItems<IncidentDomain, ReturnType<typeof useIncidentsBase.getState>>(adapter as any, (items) => {
      const tempId = `temp-${Date.now()}`
      const placeholder: IncidentDomain = {
        id: tempId,
        title: incidentData.title || 'Creando...',
        description: incidentData.description || '',
        status: (incidentData.status as any) || 'open',
        priority: (incidentData.priority as any) || 'medium',
        type: (incidentData.type as any) || 'other',
        createdAt: new Date().toISOString(),
        affectedAreaName: incidentData.affectedAreaName ?? null,
        assigneeName: incidentData.assigneeName ?? null,
        creatorName: incidentData.creatorName ?? null,
        estimatedResolutionDate: incidentData.estimatedResolutionDate ?? null,
        timeRemaining: null,
      }
      return prependPlaceholder(items, placeholder)
    }, async () => {
      const { edgeFunctionsService } = await import('@/shared/services/supabase')
      await edgeFunctionsService.createIncident({
        title: incidentData.title || '',
        description: incidentData.description || '',
        type: (incidentData.type as string) || 'other',
        priority: (incidentData.priority as string) || 'medium',
        affected_area_id: ''
      })
      useIncidentsBase.setState({ currentPage: 1 })
      await useIncidentsBase.getState().load()
    })
  },
  updateIncident: async (id: string, updates: Partial<IncidentDomain>) => {
    const adapter = { get: useIncidentsBase.getState, set: useIncidentsBase.setState }
    await withOptimisticItems<IncidentDomain, ReturnType<typeof useIncidentsBase.getState>>(adapter as any, (items) => updateItemById(items, id, (curr) => ({ ...curr, ...updates })), async () => {
      await dataService.updateIncident(id, updates)
      await useIncidentsBase.getState().load()
    })
  },
  deleteIncident: async (id: string) => {
    const adapter = { get: useIncidentsBase.getState, set: useIncidentsBase.setState }
    await withOptimisticItems<IncidentDomain, ReturnType<typeof useIncidentsBase.getState>>(adapter as any, (items) => removeItemById(items, id), async () => {
      await dataService.deleteIncident(id)
      await useIncidentsBase.getState().load()
    })
  },
}))

export const useIncidentsStore = useIncidentsBase as unknown as (typeof useIncidentsBase & {
  getState: () => ReturnType<typeof useIncidentsBase.getState> & {
    loadIncidents: (filters?: FilterValues) => Promise<void>
    loadMoreIncidents: () => Promise<void>
    setSearchQuery: (query: string) => void
    setCurrentPage: (page: number) => void
    setItemsPerPage: (items: number) => void
    createIncident: (incidentData: unknown) => Promise<void>
    updateIncident: (id: string, updates: unknown) => Promise<void>
    deleteIncident: (id: string) => Promise<void>
    clearError: () => void
  }
})