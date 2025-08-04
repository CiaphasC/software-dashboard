// =============================================================================
// INCIDENTS STORE - Store centralizado para gestión de incidencias
// Arquitectura de Software Profesional - Gestión de Estado de Incidencias
// =============================================================================

import { create } from 'zustand';
import { FilterValues } from '@/shared/types/common.types';
import { dataService, type IncidentWithUsers, type IncidentFilters } from '@/shared/services/supabase';

// =============================================================================
// INCIDENTS STATE - Estado de incidencias
// =============================================================================

export interface IncidentsState {
  // Lista de incidencias
  incidents: IncidentWithUsers[];
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
    totalIncidents: number;
    openIncidents: number;
    inProgressIncidents: number;
    resolvedIncidents: number;
    closedIncidents: number;
  };
}

// =============================================================================
// INCIDENTS ACTIONS - Acciones de incidencias
// =============================================================================

export interface IncidentsActions {
  // CRUD de incidencias
  loadIncidents: (filters?: FilterValues) => Promise<void>;
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

      // Convertir filtros al formato de Supabase
      const supabaseFilters: IncidentFilters = {};
      if (currentFilters.status) supabaseFilters.status = currentFilters.status as string;
      if (currentFilters.priority) supabaseFilters.priority = currentFilters.priority as string;
      if (currentFilters.type) supabaseFilters.type = currentFilters.type as string;
      if (currentFilters.assignedTo) supabaseFilters.assignedTo = currentFilters.assignedTo as string;
      if (currentFilters.createdBy) supabaseFilters.createdBy = currentFilters.createdBy as string;
      if (currentFilters.department) supabaseFilters.department = currentFilters.department as string;
      if (currentFilters.dateFrom) supabaseFilters.dateFrom = currentFilters.dateFrom as string;
      if (currentFilters.dateTo) supabaseFilters.dateTo = currentFilters.dateTo as string;

      const result = await dataService.getIncidents({
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
        incidents: result.data,
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
        error: error instanceof Error ? error.message : 'Error al cargar incidencias'
      });
    }
  },

  createIncident: async (incidentData) => {
    set({ loading: true, error: null });
    
    try {
      await dataService.createIncident(incidentData);
      
      // Recargar incidencias después de crear
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
      
      // Recargar incidencias después de actualizar
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
      
      // Recargar incidencias después de eliminar
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
    set({ filters, currentPage: 1 });
    get().loadIncidents(filters);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    get().loadIncidents();
  },

  clearFilters: () => {
    set({ 
      filters: {}, 
      searchQuery: '', 
      currentPage: 1 
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
    const incidents = get().incidents;
    
    const stats = {
      totalIncidents: incidents.length,
      openIncidents: incidents.filter(i => i.status === 'open').length,
      inProgressIncidents: incidents.filter(i => i.status === 'in_progress').length,
      resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
      closedIncidents: incidents.filter(i => i.status === 'closed').length
    };

    set({ stats });
  }
})); 