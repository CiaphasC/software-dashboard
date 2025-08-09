// =============================================================================
// INCIDENTS STORE - Store centralizado para gestión de incidencias
// Arquitectura de Software Profesional - Gestión de Estado de Incidencias
// =============================================================================

import { create } from 'zustand';
import { FilterValues } from '@/shared/types/common.types';
import { dataService } from '@/shared/services/supabase';
import { usePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { incidentsRepository, type IncidentQuery } from '@/shared/repositories/IncidentsRepository';
import type { IncidentDomain, IncidentMetricsDomain } from '@/shared/domain/incident';

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

export const useIncidentsStore = create<IncidentsState & IncidentsActions>()((set, get) => ({
  // =============================================================================
  // INITIAL STATE - Estado inicial
  // =============================================================================
  
  incidents: [],
  loading: false,
  error: null,
  filters: {},
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 10,
  totalItems: 0,
  hasMore: true,
  loadedPages: 0,
  stats: {
    totalIncidents: 0,
    openIncidents: 0,
    inProgressIncidents: 0,
    resolvedIncidents: 0,
    closedIncidents: 0
  },

  // =============================================================================
  // CRUD ACTIONS - Acciones CRUD
  // =============================================================================

  loadIncidents: async (filters?: FilterValues) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = filters || get().filters;
      const searchQuery = get().searchQuery;
      const currentPage = get().currentPage;
      const itemsPerPage = get().itemsPerPage;

      const fetchPage = async (page: number, limit: number) => {
        const query: IncidentQuery = {
          page,
          limit,
          search: searchQuery,
          filters: {
            status: currentFilters.status as string | undefined,
            priority: currentFilters.priority as string | undefined,
            type: currentFilters.type as string | undefined,
            assignedTo: currentFilters.assignedTo as string | undefined,
            createdBy: currentFilters.createdBy as string | undefined,
            department: currentFilters.department as string | undefined,
            dateFrom: currentFilters.dateFrom as string | undefined,
            dateTo: currentFilters.dateTo as string | undefined,
          }
        }
        const result = await incidentsRepository.list(query)
        return result
      }

      const { loadPage } = usePaginatedQuery(fetchPage)
      const result = await loadPage(currentPage, itemsPerPage, get().incidents)

      const totalPages = Math.ceil(result.total / itemsPerPage);
      set({
        incidents: result.items,
        totalItems: result.total,
        totalPages,
        hasMore: result.hasMore,
        loadedPages: result.page,
        loading: false,
        error: null
      })
      get().updateStats();
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Error al cargar incidencias' })
    }
  },

  // Cargar siguiente página (scroll infinito)
  loadMoreIncidents: async () => {
    const { hasMore, currentPage } = get();
    if (!hasMore) return;
    set({ currentPage: currentPage + 1 });
    await get().loadIncidents();
  },

  createIncident: async (incidentData) => {
    set({ loading: true, error: null });
    
    try {
      const { edgeFunctionsService } = await import('@/shared/services/supabase');
      await edgeFunctionsService.createIncident(incidentData);
      set({ currentPage: 1 });
      await get().loadIncidents();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear incidencia'
      });
    }
  },

  updateIncident: async (id: string, updates: any) => {
    set({ loading: true, error: null });
    
    try {
      await dataService.updateIncident(id, updates);
      set({ currentPage: 1 });
      await get().loadIncidents();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar incidencia'
      });
    }
  },

  deleteIncident: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      await dataService.deleteIncident(id);
      set({ currentPage: 1 });
      await get().loadIncidents();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar incidencia'
      });
    }
  },

  // =============================================================================
  // FILTERS AND SEARCH ACTIONS - Acciones de filtros y búsqueda
  // =============================================================================

  setFilters: (filters: FilterValues) => {
    set({ filters, currentPage: 1, hasMore: true });
    get().loadIncidents(filters);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1, hasMore: true });
    get().loadIncidents();
  },

  clearFilters: () => {
    set({ 
      filters: {}, 
      searchQuery: '', 
      currentPage: 1,
      hasMore: true
    });
    get().loadIncidents();
  },

  // =============================================================================
  // PAGINATION ACTIONS - Acciones de paginación
  // =============================================================================

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().loadIncidents();
  },

  setItemsPerPage: (items: number) => {
    set({ itemsPerPage: items, currentPage: 1 });
    get().loadIncidents();
  },

  // =============================================================================
  // STATE MANAGEMENT ACTIONS - Acciones de gestión de estado
  // =============================================================================

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  // =============================================================================
  // STATISTICS ACTIONS - Acciones de estadísticas
  // =============================================================================

  updateStats: () => {
    import('@/shared/services/supabase').then(async ({ edgeFunctionsService }) => {
      try {
        const metrics = await edgeFunctionsService.getIncidentMetrics();
        set({ stats: metrics });
      } catch {
        const incidents = get().incidents;
        const stats: IncidentMetricsDomain = {
          totalIncidents: incidents.length,
          openIncidents: incidents.filter(i => i.status === 'open').length,
          inProgressIncidents: incidents.filter(i => i.status === 'in_progress').length,
          resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
          closedIncidents: incidents.filter(i => i.status === 'closed').length
        };
        set({ stats });
      }
    })
  }
})); 