// =============================================================================
// REQUIREMENTS STORE - Store centralizado para gestión de requerimientos
// Arquitectura de Software Profesional - Gestión de Estado de Requerimientos
// =============================================================================

import { FilterValues } from '@/shared/types/common.types';
import { dataService } from '@/shared/services/supabase';
import { logger } from '@/shared/utils/logger'
import { requirementsRepository, type RequirementQuery } from '@/shared/repositories/RequirementsRepository';
import type { RequirementDomain, RequirementMetricsDomain } from '@/shared/domain/requirement';
import { createPaginatedEntityStore } from '@/shared/store/factories/createPaginatedEntityStore'

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

export const useRequirementsStore = createPaginatedEntityStore<RequirementDomain, RequirementQuery, RequirementMetricsDomain, FilterValues>({
  initialStats: { totalRequirements: 0, pendingRequirements: 0, inProgressRequirements: 0, completedRequirements: 0, deliveredRequirements: 0 },
  initialFilters: {},
  buildQuery: (state) => ({
    page: state.currentPage,
    limit: state.itemsPerPage,
    search: state.searchQuery,
    filters: {
      status: state.filters.status,
      priority: state.filters.priority,
      type: state.filters.type,
      assignedTo: state.filters.assignedTo,
      createdBy: state.filters.createdBy,
      department: state.filters.department,
      dateFrom: state.filters.dateFrom,
      dateTo: state.filters.dateTo,
    }
  }),
  list: (q) => requirementsRepository.list(q),
  metrics: () => requirementsRepository.metrics(),
  computeMetricsFallback: (items) => ({
    totalRequirements: items.length,
    pendingRequirements: items.filter(r => r.status === 'pending').length,
    inProgressRequirements: items.filter(r => r.status === 'in_progress').length,
    completedRequirements: items.filter(r => r.status === 'completed').length,
    deliveredRequirements: items.filter(r => r.status === 'delivered').length,
  }),
}, (useBase) => ({
  // =============================================================================
  // INITIAL STATE - Estado inicial
  // =============================================================================
  
  requirements: [],
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
    totalRequirements: 0,
    pendingRequirements: 0,
    inProgressRequirements: 0,
    completedRequirements: 0,
    deliveredRequirements: 0
  },

  // =============================================================================
  // CRUD ACTIONS - Acciones CRUD
  // =============================================================================

  loadRequirements: (filters?: FilterValues) => useBase.getState().load(filters as any),

  createRequirement: async (requirementData) => {
    set({ loading: true, error: null });
    
    try {
      await dataService.createRequirement(requirementData);
      set({ currentPage: 1 });
      await get().loadRequirements();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear requerimiento'
      });
      logger.error('Error al crear requerimiento', (error as Error).message)
    }
  },

  updateRequirement: async (id: string, updates: any) => {
    set({ loading: true, error: null });
    
    try {
      await dataService.updateRequirement(id, updates);
      set({ currentPage: 1 });
      await get().loadRequirements();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar requerimiento'
      });
      logger.error('Error al actualizar requerimiento', (error as Error).message)
    }
  },

  deleteRequirement: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      await dataService.deleteRequirement(id);
      set({ currentPage: 1 });
      await get().loadRequirements();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar requerimiento'
      });
      logger.error('Error al eliminar requerimiento', (error as Error).message)
    }
  },

  loadMoreRequirements: () => useBase.getState().loadMore(),

  // =============================================================================
  // FILTERS AND SEARCH ACTIONS - Acciones de filtros y búsqueda
  // =============================================================================

  setFilters: (filters: FilterValues) => useBase.getState().setFilters(filters as any),

  setSearchQuery: (query: string) => useBase.getState().setSearch(query),

  clearFilters: () => useBase.getState().clearFilters(),

  // =============================================================================
  // PAGINATION ACTIONS - Acciones de paginación
  // =============================================================================

  setCurrentPage: (page: number) => useBase.getState().setPage(page),

  setItemsPerPage: (items: number) => useBase.getState().setPageSize(items),

  // =============================================================================
  // STATE MANAGEMENT ACTIONS - Acciones de gestión de estado
  // =============================================================================

  setLoading: (loading: boolean) => useBase.getState().setLoading(loading),

  setError: (error: string | null) => useBase.getState().setError(error),

  clearError: () => useBase.getState().clearError(),

  // =============================================================================
  // STATISTICS ACTIONS - Acciones de estadísticas
  // =============================================================================

  updateStats: () => useBase.getState().updateStats(),
}));