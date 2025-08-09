// =============================================================================
// REQUIREMENTS STORE - Store centralizado para gestión de requerimientos
// Arquitectura de Software Profesional - Gestión de Estado de Requerimientos
// =============================================================================

import { create } from 'zustand';
import { FilterValues } from '@/shared/types/common.types';
import { dataService } from '@/shared/services/supabase';
import { logger } from '@/shared/utils/logger'
import { requirementsRepository, type RequirementQuery } from '@/shared/repositories/RequirementsRepository';
import type { RequirementDomain, RequirementMetricsDomain } from '@/shared/domain/requirement';

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

export const useRequirementsStore = create<RequirementsState & RequirementsActions>()((set, get) => ({
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

  loadRequirements: async (filters?: FilterValues) => {
    set({ loading: true, error: null });
    
    try {
      const currentFilters = filters || get().filters;
      const searchQuery = get().searchQuery;
      const currentPage = get().currentPage;
      const itemsPerPage = get().itemsPerPage;

      const query: RequirementQuery = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        filters: {
          status: currentFilters.status,
          priority: currentFilters.priority,
          type: currentFilters.type,
          assignedTo: currentFilters.assignedTo,
          createdBy: currentFilters.createdBy,
          department: currentFilters.department,
          dateFrom: currentFilters.dateFrom,
          dateTo: currentFilters.dateTo,
        }
      }
      const result = await requirementsRepository.list(query);

      const totalPages = Math.ceil(result.total / itemsPerPage);

      set((state) => ({
        requirements: currentPage === 1 ? result.items : [...state.requirements, ...result.items],
        totalItems: result.total,
        totalPages,
        hasMore: result.hasMore,
        loadedPages: result.page,
        loading: false,
        error: null
      }));

      // Actualizar estadísticas
      get().updateStats();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar requerimientos'
      });
      logger.error('Error al cargar requerimientos', (error as Error).message)
    }
  },

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

  loadMoreRequirements: async () => {
    const { hasMore, currentPage } = get();
    if (!hasMore) return;
    set({ currentPage: currentPage + 1 });
    await get().loadRequirements();
  },

  // =============================================================================
  // FILTERS AND SEARCH ACTIONS - Acciones de filtros y búsqueda
  // =============================================================================

  setFilters: (filters: FilterValues) => {
    set({ filters, currentPage: 1, hasMore: true });
    get().loadRequirements(filters);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1, hasMore: true });
    get().loadRequirements();
  },

  clearFilters: () => {
    set({ 
      filters: {}, 
      searchQuery: '', 
      currentPage: 1,
      hasMore: true
    });
    get().loadRequirements();
  },

  // =============================================================================
  // PAGINATION ACTIONS - Acciones de paginación
  // =============================================================================

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().loadRequirements();
  },

  setItemsPerPage: (items: number) => {
    set({ itemsPerPage: items, currentPage: 1 });
    get().loadRequirements();
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
        const metrics = await edgeFunctionsService.getRequirementMetrics();
        set({ stats: metrics as any });
      } catch {
        const requirements = get().requirements;
        const stats: RequirementMetricsDomain = {
          totalRequirements: requirements.length,
          pendingRequirements: requirements.filter(r => r.status === 'pending').length,
          inProgressRequirements: requirements.filter(r => r.status === 'in_progress').length,
          completedRequirements: requirements.filter(r => r.status === 'completed').length,
          deliveredRequirements: requirements.filter(r => r.status === 'delivered').length
        };
        set({ stats });
      }
    })
  }
})); 