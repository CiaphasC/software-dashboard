// =============================================================================
// USERS STORE - Store centralizado para gestión de usuarios
// Arquitectura de Software Profesional - Gestión de Estado de Usuarios
// =============================================================================

import { logger } from '@/shared/utils/logger';
import { authService } from '@/shared/services/supabase';
import type { CreateUserData, UpdateUserData } from '@/shared/services/supabase';
import { usersRepository } from '@/shared/repositories/UsersRepository';
import type { UserDomain, UserMetricsDomain } from '@/shared/domain/user';
import { createPaginatedEntityStore } from '@/shared/store/factories/createPaginatedEntityStore'

// =============================================================================
// USERS STATE - Estado de usuarios
// =============================================================================

export interface UsersState {
  // Lista de usuarios
  users: UserDomain[];
  
  // Estados de carga
  loading: boolean;
  error: string | null;
  
  // Filtros y búsqueda
  filters: Record<string, string>;
  searchQuery: string;
  
  // Paginación
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  usersPerPage: number;
  hasMore: boolean;
  
  // Estadísticas
  stats: UserMetricsDomain;
}

// =============================================================================
// USERS ACTIONS - Acciones de usuarios
// =============================================================================

export interface UsersActions {
  // Carga de datos
  loadUsers: () => Promise<void>;
  loadMoreUsers: () => Promise<void>;
  
  // CRUD de usuarios
  createUser: (userData: CreateUserData) => Promise<void>;
  updateUser: (userId: string, updates: UpdateUserData) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Gestión de solicitudes de registro
  loadPendingUsers: () => Promise<UserDomain[]>;
  approvePendingUser: (pendingUserId: string, approvedBy: string, roleName?: string) => Promise<void>;
  rejectPendingUser: (pendingUserId: string, rejectedBy: string, reason: string) => Promise<void>;
  
  // Filtros y búsqueda
  setFilters: (filters: Record<string, string>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Paginación
  setCurrentPage: (page: number) => void;
  setUsersPerPage: (perPage: number) => void;
  
  // Gestión de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utilidades
  updateStats: () => void;
}

// =============================================================================
// USERS STORE - Store completo de usuarios
// =============================================================================

export const useUsersStore = createPaginatedEntityStore<UserDomain, { page?: number; limit?: number; search?: string; role?: string }, UserMetricsDomain, Record<string, string>>({
  initialStats: { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, admins: 0, technicians: 0, requesters: 0 },
  initialFilters: {},
  buildQuery: (state) => ({ page: state.currentPage, limit: state.itemsPerPage, search: state.searchQuery, role: state.filters.role }),
  list: (q) => usersRepository.list(q),
  metrics: () => usersRepository.metrics(),
  computeMetricsFallback: (items) => {
    const totalUsers = items.length
    const activeUsers = items.filter(u => u.isActive).length
    const inactiveUsers = totalUsers - activeUsers
    const admins = items.filter(u => u.role === 'admin').length
    const technicians = items.filter(u => u.role === 'technician').length
    const requesters = items.filter(u => u.role === 'requester').length
    return { totalUsers, activeUsers, inactiveUsers, admins, technicians, requesters }
  },
}, (useBase) => ({
  // =============================================================================
  // INITIAL STATE - Estado inicial
  // =============================================================================
  
  users: [],
  loading: false,
  error: null,
  filters: {},
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  usersPerPage: 20,
  hasMore: true,
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    admins: 0,
    technicians: 0,
    requesters: 0,
  },

  // =============================================================================
  // UTILITY FUNCTIONS - Funciones de utilidad
  // =============================================================================

  /**
   * Calcular estadísticas basadas en los usuarios actuales
   */
  updateStats: () => {
    import('@/shared/services/supabase').then(async ({ edgeFunctionsService }) => {
      try {
        const metrics = await edgeFunctionsService.getUserMetrics();
        set({ stats: metrics });
      } catch {
        const users = get().users;
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.isActive).length;
        const inactiveUsers = totalUsers - activeUsers;
        const admins = users.filter(u => u.role === 'admin').length;
        const technicians = users.filter(u => u.role === 'technician').length;
        const requesters = users.filter(u => u.role === 'requester').length;
        set({ stats: { totalUsers, activeUsers, inactiveUsers, admins, technicians, requesters } });
      }
    })
  },

  // =============================================================================
  // DATA LOADING ACTIONS - Acciones de carga de datos
  // =============================================================================

  loadUsers: () => useBase.getState().load(),

  loadMoreUsers: () => useBase.getState().loadMore(),

  // =============================================================================
  // CRUD ACTIONS - Acciones CRUD
  // =============================================================================

  createUser: async (userData: CreateUserData) => {
    set({ loading: true, error: null });
    
    try {
      await authService.createUser(userData);
      await get().loadUsers(); // Recargar lista
      set({ loading: false, error: null });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear usuario'
      });
      throw error;
    }
  },

  updateUser: async (userId: string, updates: UpdateUserData) => {
    set({ loading: true, error: null });
    
    try {
      await authService.updateUser(userId, updates);
      await get().loadUsers(); // Recargar lista
      set({ loading: false, error: null });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar usuario'
      });
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      await authService.deleteUser(userId);
      await get().loadUsers(); // Recargar lista
      set({ loading: false, error: null });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar usuario'
      });
      throw error;
    }
  },

  // =============================================================================
  // REGISTRATION REQUESTS ACTIONS - Acciones de solicitudes de registro
  // =============================================================================

  loadPendingUsers: async () => {
    try {
      const pendingRequests = await authService.getPendingRegistrationRequests();
      // Mapear a tipos de la aplicación
      return pendingRequests.map(mapProfileToUser);
    } catch (error) {
      logger.error('Error loading pending users:', (error as Error).message);
      throw error;
    }
  },

  approvePendingUser: async (pendingUserId: string, approvedBy: string, roleName?: string) => {
    try {
      await authService.approveRegistrationRequest(pendingUserId, approvedBy, roleName);
      await get().loadUsers(); // Recargar lista
    } catch (error) {
      logger.error('Error approving pending user:', (error as Error).message);
      throw error;
    }
  },

  rejectPendingUser: async (pendingUserId: string, rejectedBy: string, reason: string) => {
    try {
      await authService.rejectRegistrationRequest(pendingUserId, reason);
    } catch (error) {
      logger.error('Error rejecting pending user:', (error as Error).message);
      throw error;
    }
  },

  // =============================================================================
  // FILTERS AND SEARCH ACTIONS - Acciones de filtros y búsqueda
  // =============================================================================

  setFilters: (filters: Record<string, string>) => useBase.getState().setFilters(filters),

  setSearchQuery: (query: string) => useBase.getState().setSearch(query),

  clearFilters: () => useBase.getState().clearFilters(),

  // =============================================================================
  // PAGINATION ACTIONS - Acciones de paginación
  // =============================================================================

  setCurrentPage: (page: number) => useBase.getState().setPage(page),

  setUsersPerPage: (perPage: number) => useBase.getState().setPageSize(perPage),

  // =============================================================================
  // STATE MANAGEMENT ACTIONS - Acciones de gestión de estado
  // =============================================================================

  setLoading: (loading: boolean) => useBase.getState().setLoading(loading),

  setError: (error: string | null) => useBase.getState().setError(error),

  clearError: () => useBase.getState().clearError(),
}));