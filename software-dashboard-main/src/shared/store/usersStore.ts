// =============================================================================
// USERS STORE - Store centralizado para gestión de usuarios
// Arquitectura de Software Profesional - Gestión de Estado de Usuarios
// =============================================================================

import { authService } from '@/shared/services/supabase'
import type { CreateUserData, UpdateUserData } from '@/shared/services/supabase'
import { usersRepository } from '@/shared/repositories/UsersRepository'
import type { UserDomain, UserMetricsDomain } from '@/shared/domain/user'
import { createPaginatedEntityStore } from '@/shared/store/createPaginatedEntityStore'
import { logAndExtractError } from '@/shared/utils/errorUtils'
import { withOptimisticItems, updateItemById, removeItemById, prependPlaceholder } from '@/shared/store/optimistic'

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

// Base store con factory genérica
type UsersQuery = { page?: number; limit?: number; search?: string; filters?: { role?: string } }

const useUsersBase = createPaginatedEntityStore<
  UserDomain,
  UsersQuery,
  UserMetricsDomain,
  UserDomain,
  { role?: string }
>({
  initialStats: {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    admins: 0,
    technicians: 0,
    requesters: 0,
  },
  defaultItemsPerPage: 20,
  list: async (q) => {
    const res = await usersRepository.list({
      page: q.page,
      limit: q.limit,
      search: q.search,
      role: q.filters?.role,
    })
    return { items: res.items as UserDomain[], total: res.total, page: res.page, limit: res.limit, hasMore: res.hasMore }
  },
  metrics: () => usersRepository.metrics(),
  mapToDomain: (u) => u,
})

// Guardar referencias base para evitar recursiones al envolver acciones
const baseUsersSetFilters = useUsersBase.getState().setFilters
const baseUsersClearFilters = useUsersBase.getState().clearFilters

// Extensiones específicas y compatibilidad con API actual
useUsersBase.setState((state) => ({
  // Alias de datos
  users: state.items as UserDomain[],

  // Stats: mantener backend, con fallback local si falla
  updateStats: async () => {
    try {
      const metrics = await usersRepository.metrics()
      useUsersBase.setState({ stats: metrics })
    } catch {
      const users = useUsersBase.getState().items as UserDomain[]
      const totalUsers = users.length
      const activeUsers = users.filter(u => u.isActive).length
      const inactiveUsers = totalUsers - activeUsers
      const admins = users.filter(u => u.role === 'admin').length
      const technicians = users.filter(u => u.role === 'technician').length
      const requesters = users.filter(u => u.role === 'requester').length
      useUsersBase.setState({ stats: { totalUsers, activeUsers, inactiveUsers, admins, technicians, requesters } })
    }
  },

  // Carga con compat alias
  loadUsers: async () => {
    await useUsersBase.getState().load()
    useUsersBase.setState((s) => ({ users: s.items as UserDomain[] }))
  },
  loadMoreUsers: async () => {
    await useUsersBase.getState().loadMore()
    useUsersBase.setState((s) => ({ users: s.items as UserDomain[] }))
  },

  // Filtros y paginación
  setFilters: (filters: Record<string, string>) => {
    baseUsersSetFilters({ role: filters.role })
    setTimeout(() => useUsersBase.setState((s) => ({ users: s.items as UserDomain[] })), 0)
  },
  setSearchQuery: (query: string) => {
    useUsersBase.getState().setSearch(query)
    setTimeout(() => useUsersBase.setState((s) => ({ users: s.items as UserDomain[] })), 0)
  },
  clearFilters: () => {
    baseUsersClearFilters()
    setTimeout(() => useUsersBase.setState((s) => ({ users: s.items as UserDomain[] })), 0)
  },
  setCurrentPage: (page: number) => {
    useUsersBase.getState().setPage(page)
    setTimeout(() => useUsersBase.setState((s) => ({ users: s.items as UserDomain[] })), 0)
  },
  setUsersPerPage: (perPage: number) => {
    useUsersBase.getState().setPageSize(perPage)
    setTimeout(() => useUsersBase.setState((s) => ({ users: s.items as UserDomain[] })), 0)
  },

  // Estado
  clearError: () => useUsersBase.setState({ error: null }),

  // CRUD con normalización de errores
  createUser: async (userData: CreateUserData) => {
    const adapter = { get: useUsersBase.getState, set: useUsersBase.setState }
    await withOptimisticItems<UserDomain, ReturnType<typeof useUsersBase.getState>>(adapter as any, (items) => {
      const tempId = `temp-${Date.now()}`
      const placeholder: UserDomain = { id: tempId, name: userData.name, email: userData.email, role: userData.role_name || 'user', departmentId: null, isActive: true }
      return prependPlaceholder(items, placeholder)
    }, async () => {
      await authService.createUser(userData)
      await useUsersBase.getState().load()
      useUsersBase.setState((s) => ({ users: s.items as UserDomain[] }))
    })
  },
  updateUser: async (userId: string, updates: UpdateUserData) => {
    const adapter = { get: useUsersBase.getState, set: useUsersBase.setState }
    await withOptimisticItems<UserDomain, ReturnType<typeof useUsersBase.getState>>(adapter as any, (items) => updateItemById(items, userId, (curr) => ({ ...curr, ...updates } as any)), async () => {
      await authService.updateUser(userId, updates)
      await useUsersBase.getState().load()
      useUsersBase.setState((s) => ({ users: s.items as UserDomain[] }))
    })
  },
  deleteUser: async (userId: string) => {
    const adapter = { get: useUsersBase.getState, set: useUsersBase.setState }
    await withOptimisticItems<UserDomain, ReturnType<typeof useUsersBase.getState>>(adapter as any, (items) => removeItemById(items, userId), async () => {
      await authService.deleteUser(userId)
      await useUsersBase.getState().load()
      useUsersBase.setState((s) => ({ users: s.items as UserDomain[] }))
    })
  },

  // Registro pendiente (se mantiene, sólo normalizamos errores en llamadas locales)
  loadPendingUsers: async () => {
    try {
      const pendingRequests = await authService.getPendingRegistrationRequests()
      return pendingRequests.map(mapProfileToUser)
    } catch (error) {
      throw error
    }
  },
  approvePendingUser: async (pendingUserId: string, approvedBy: string, roleName?: string) => {
    try {
      await authService.approveRegistrationRequest(pendingUserId, approvedBy, roleName)
      await useUsersBase.getState().load()
      useUsersBase.setState((s) => ({ users: s.items as UserDomain[] }))
    } catch (error) {
      throw error
    }
  },
  rejectPendingUser: async (pendingUserId: string, _rejectedBy: string, reason: string) => {
    try {
      await authService.rejectRegistrationRequest(pendingUserId, reason)
    } catch (error) {
      throw error
    }
  },
}))

export const useUsersStore = useUsersBase as unknown as (typeof useUsersBase & {
  getState: () => ReturnType<typeof useUsersBase.getState> & {
    users: UserDomain[]
    loadUsers: () => Promise<void>
    loadMoreUsers: () => Promise<void>
    setFilters: (filters: Record<string, string>) => void
    setSearchQuery: (query: string) => void
    clearFilters: () => void
    setCurrentPage: (page: number) => void
    setUsersPerPage: (perPage: number) => void
    clearError: () => void
    updateStats: () => Promise<void>
    createUser: (userData: CreateUserData) => Promise<void>
    updateUser: (userId: string, updates: UpdateUserData) => Promise<void>
    deleteUser: (userId: string) => Promise<void>
    loadPendingUsers: () => Promise<UserDomain[]>
    approvePendingUser: (pendingUserId: string, approvedBy: string, roleName?: string) => Promise<void>
    rejectPendingUser: (pendingUserId: string, rejectedBy: string, reason: string) => Promise<void>
  }
})