// =============================================================================
// REQUIREMENTS STORE - Store centralizado para gestión de requerimientos
// Arquitectura de Software Profesional - Gestión de Estado de Requerimientos
// =============================================================================

import { create } from 'zustand';
import { Requirement, FilterValues } from '@/shared/types/common.types';
import { dataService, type RequirementWithUsers, type RequirementFilters } from '@/shared/services/supabase';

// =============================================================================
// REQUIREMENTS STATE - Estado de requerimientos
// =============================================================================

export interface RequirementsState {
  // Lista de requerimientos
  requirements: RequirementWithUsers[];
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
  
  // Estadísticas
  stats: {
    totalRequirements: number;
    pendingRequirements: number;
    inProgressRequirements: number;
    completedRequirements: number;
    deliveredRequirements: number;
  };
}

// =============================================================================
// REQUIREMENTS ACTIONS - Acciones de requerimientos
// =============================================================================

export interface RequirementsActions {
  // CRUD de requerimientos
  loadRequirements: (filters?: FilterValues) => Promise<void>;
  createRequirement: (requirementData: Omit<Requirement, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRequirement: (id: string, updates: Partial<Requirement>) => Promise<void>;
  deleteRequirement: (id: string) => Promise<void>;
  
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

      // Convertir filtros al formato de Supabase
      const supabaseFilters: RequirementFilters = {};
      if (currentFilters.status) supabaseFilters.status = currentFilters.status;
      if (currentFilters.priority) supabaseFilters.priority = currentFilters.priority;
      if (currentFilters.type) supabaseFilters.type = currentFilters.type;
      if (currentFilters.assignedTo) supabaseFilters.assignedTo = currentFilters.assignedTo;
      if (currentFilters.createdBy) supabaseFilters.createdBy = currentFilters.createdBy;
      if (currentFilters.department) supabaseFilters.department = currentFilters.department;
      if (currentFilters.dateFrom) supabaseFilters.dateFrom = currentFilters.dateFrom;
      if (currentFilters.dateTo) supabaseFilters.dateTo = currentFilters.dateTo;

      const result = await dataService.getRequirements({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        filters: supabaseFilters
      });

      if (result.error) {
        throw new Error(result.error);
      }

      const totalPages = Math.ceil(result.total / itemsPerPage);

      set({
        requirements: result.data,
        totalItems: result.total,
        totalPages,
        loading: false,
        error: null
      });

      // Actualizar estadísticas
      get().updateStats();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar requerimientos'
      });
    }
  },

  createRequirement: async (requirementData) => {
    set({ loading: true, error: null });
    
    try {
      await dataService.createRequirement(requirementData);
      
      // Recargar requerimientos después de crear
      await get().loadRequirements();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear requerimiento'
      });
    }
  },

  updateRequirement: async (id: string, updates: Partial<Requirement>) => {
    set({ loading: true, error: null });
    
    try {
      await dataService.updateRequirement(id, updates);
      
      // Recargar requerimientos después de actualizar
      await get().loadRequirements();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar requerimiento'
      });
    }
  },

  deleteRequirement: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      await dataService.deleteRequirement(id);
      
      // Recargar requerimientos después de eliminar
      await get().loadRequirements();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar requerimiento'
      });
    }
  },

  // =============================================================================
  // FILTERS AND SEARCH ACTIONS - Acciones de filtros y búsqueda
  // =============================================================================

  setFilters: (filters: FilterValues) => {
    set({ filters, currentPage: 1 });
    get().loadRequirements(filters);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    get().loadRequirements();
  },

  clearFilters: () => {
    set({ 
      filters: {}, 
      searchQuery: '', 
      currentPage: 1 
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
    const requirements = get().requirements;
    
    const stats = {
      totalRequirements: requirements.length,
      pendingRequirements: requirements.filter(r => r.status === 'pending').length,
      inProgressRequirements: requirements.filter(r => r.status === 'in_progress').length,
      completedRequirements: requirements.filter(r => r.status === 'completed').length,
      deliveredRequirements: requirements.filter(r => r.status === 'delivered').length
    };

    set({ stats });
  }
})); 