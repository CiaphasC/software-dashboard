// =============================================================================
// USERS STORE - Store centralizado para gestión de usuarios
// Arquitectura de Software Profesional - Gestión de Estado de Usuarios
// =============================================================================

import { create } from 'zustand';
import { authService, dataService } from '@/shared/services/supabase';
import { User, mapProfileToUser } from '@/shared/types/common.types';
import type { CreateUserData, UpdateUserData } from '@/shared/services/supabase';

// =============================================================================
// USERS STATE - Estado de usuarios
// =============================================================================

export interface UsersState {
  // Lista de usuarios
  users: User[];
  
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
  
  // Estadísticas
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    admins: number;
    technicians: number;
    requesters: number;
  };
}

// =============================================================================
// USERS ACTIONS - Acciones de usuarios
// =============================================================================

export interface UsersActions {
  // Carga de datos
  loadUsers: () => Promise<void>;
  
  // CRUD de usuarios
  createUser: (userData: CreateUserData) => Promise<void>;
  updateUser: (userId: string, updates: UpdateUserData) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Gestión de solicitudes de registro
  loadPendingUsers: () => Promise<User[]>;
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
  calculateStats: (users: User[]) => {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    admins: number;
    technicians: number;
    requesters: number;
  };
}

// =============================================================================
// USERS STORE - Store completo de usuarios
// =============================================================================

export const useUsersStore = create<UsersState & UsersActions>()((set, get) => ({
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
  calculateStats: (users: User[]) => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;
    const admins = users.filter(user => user.role === 'admin').length;
    const technicians = users.filter(user => user.role === 'technician').length;
    const requesters = users.filter(user => user.role === 'requester').length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      admins,
      technicians,
      requesters,
    };
  },

  // =============================================================================
  // DATA LOADING ACTIONS - Acciones de carga de datos
  // =============================================================================

  loadUsers: async () => {
    set({ loading: true, error: null });
    
    try {
      const supabaseUsers = await authService.getUsers();
      const { currentPage, usersPerPage, filters, searchQuery } = get();
      
      // Mapear usuarios de Supabase a tipos de la aplicación
      const users = supabaseUsers.map(mapProfileToUser);
      
      // Calcular estadísticas basadas en todos los usuarios (sin filtros)
      const stats = get().calculateStats(users);
      
      // Aplicar filtros
      let filteredUsers = users;
      
      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }
      
      if (filters.department) {
        filteredUsers = filteredUsers.filter(user => user.department === filters.department);
      }
      
      if (filters.status) {
        const isActive = filters.status === 'active';
        filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
      }
      
      // Aplicar búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.department.toLowerCase().includes(query)
        );
      }
      
      // Calcular paginación
      const totalUsers = filteredUsers.length;
      const totalPages = Math.ceil(totalUsers / usersPerPage);
      const startIndex = (currentPage - 1) * usersPerPage;
      const endIndex = startIndex + usersPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      set({
        users: paginatedUsers,
        totalUsers,
        totalPages,
        stats,
        loading: false,
        error: null
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar usuarios'
      });
    }
  },

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
      console.error('Error loading pending users:', error);
      throw error;
    }
  },

  approvePendingUser: async (pendingUserId: string, approvedBy: string, roleName?: string) => {
    try {
      await authService.approveRegistrationRequest(pendingUserId, approvedBy, roleName);
      await get().loadUsers(); // Recargar lista
    } catch (error) {
      console.error('Error approving pending user:', error);
      throw error;
    }
  },

  rejectPendingUser: async (pendingUserId: string, rejectedBy: string, reason: string) => {
    try {
      await authService.rejectRegistrationRequest(pendingUserId, reason);
    } catch (error) {
      console.error('Error rejecting pending user:', error);
      throw error;
    }
  },

  // =============================================================================
  // FILTERS AND SEARCH ACTIONS - Acciones de filtros y búsqueda
  // =============================================================================

  setFilters: (filters: Record<string, string>) => {
    set({ filters, currentPage: 1 }); // Reset a primera página
    get().loadUsers(); // Recargar con nuevos filtros
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 }); // Reset a primera página
    get().loadUsers(); // Recargar con nueva búsqueda
  },

  clearFilters: () => {
    set({ 
      filters: {}, 
      searchQuery: '', 
      currentPage: 1 
    });
    get().loadUsers(); // Recargar sin filtros
  },

  // =============================================================================
  // PAGINATION ACTIONS - Acciones de paginación
  // =============================================================================

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().loadUsers(); // Recargar con nueva página
  },

  setUsersPerPage: (perPage: number) => {
    set({ usersPerPage: perPage, currentPage: 1 }); // Reset a primera página
    get().loadUsers(); // Recargar con nuevo tamaño de página
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
  }
})); 