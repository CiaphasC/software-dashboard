import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, UserRole, PendingUser, PendingUserStatus } from '@/shared/types/common.types';
import { usersService } from '@/shared/services/usersService';
import { authApi } from '@/shared/services';
import { useObservable } from '@/shared/reactive/hooks/useReactiveState';

interface UseUsersOptions {
  initialFilters?: {
    role?: UserRole;
    department?: string;
    search?: string;
  };
}

interface UseUsersReturn {
  users: User[];
  filteredUsers: User[];
  pendingUsers: PendingUser[];
  loading: boolean;
  loadingPending: boolean;
  error: string | null;
  filters: {
    role: string;
    department: string;
    search: string;
  };
  setFilters: (filters: Partial<UseUsersReturn['filters']>) => void;
  createUser: (userData: Partial<User> & { password?: string }) => Promise<void>;
  updateUser: (id: string, userData: Partial<User> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  loadPendingUsers: () => Promise<void>;
  approvePendingUser: (pendingUserId: string, approvedBy: string) => Promise<void>;
  rejectPendingUser: (pendingUserId: string, rejectedBy: string, reason: string) => Promise<void>;
}

/**
 * HOOK OPTIMIZADO PARA GESTIÓN DE USUARIOS
 * 
 * Este hook utiliza el servicio reactivo centralizado para proporcionar
 * una interfaz limpia y optimizada para la gestión de usuarios.
 * 
 * CARACTERÍSTICAS:
 * - Usa observables memoizados del servicio centralizado
 * - Evita bucles infinitos mediante optimizaciones
 * - Proporciona filtrado local para mejor performance
 * - Manejo de errores centralizado
 * - Gestión de usuarios pendientes
 */
export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  // Usar observables reactivos del servicio centralizado
  const users = useObservable(usersService.users$, []);
  const loading = useObservable(usersService.loading$, false);
  const error = useObservable(usersService.error$, null);

  // Estado local para filtros (no reactivo para evitar bucles)
  const [filters, setFiltersState] = useState({
    role: options.initialFilters?.role || '',
    department: options.initialFilters?.department || '',
    search: options.initialFilters?.search || '',
  });

  // Estado para usuarios pendientes
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    usersService.fetchUsers().subscribe();
  }, []);

  // Filtrado local optimizado con useMemo
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filtro por rol
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      // Filtro por departamento
      if (filters.department && user.department !== filters.department) {
        return false;
      }

      // Filtro de búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(searchLower);
        const matchesEmail = user.email.toLowerCase().includes(searchLower);
        const matchesDepartment = user.department.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesEmail && !matchesDepartment) {
          return false;
        }
      }

      return true;
    });
  }, [users, filters]);

  // Función para actualizar filtros
  const setFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Funciones CRUD optimizadas
  const createUser = useCallback(async (userData: Partial<User>) => {
    try {
      await usersService.createUser(userData).toPromise();
    } catch (err) {
      // El manejo de errores se hace en el servicio
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      await usersService.updateUser(id, userData).toPromise();
    } catch (err) {
      // El manejo de errores se hace en el servicio
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await usersService.deleteUser(id).toPromise();
    } catch (err) {
      // El manejo de errores se hace en el servicio
      throw err;
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      await usersService.refreshUsers().toPromise();
    } catch (err) {
      // El manejo de errores se hace en el servicio
      throw err;
    }
  }, []);

  // Funciones para usuarios pendientes
  const loadPendingUsers = useCallback(async () => {
    setLoadingPending(true);
    try {
      const pending = await authApi.getPendingUsers();
      setPendingUsers(pending);
    } catch (err) {
      console.error('Error loading pending users:', err);
      throw err;
    } finally {
      setLoadingPending(false);
    }
  }, []);

  const approvePendingUser = useCallback(async (pendingUserId: string, approvedBy: string) => {
    try {
      await authApi.approvePendingUser(pendingUserId, approvedBy);
      // Recargar usuarios pendientes y activos
      await loadPendingUsers();
      await refreshUsers();
    } catch (err) {
      console.error('Error approving pending user:', err);
      throw err;
    }
  }, [loadPendingUsers, refreshUsers]);

  const rejectPendingUser = useCallback(async (pendingUserId: string, rejectedBy: string, reason: string) => {
    try {
      await authApi.rejectPendingUser(pendingUserId, rejectedBy, reason);
      // Recargar usuarios pendientes
      await loadPendingUsers();
    } catch (err) {
      console.error('Error rejecting pending user:', err);
      throw err;
    }
  }, [loadPendingUsers]);

  return {
    users,
    filteredUsers,
    pendingUsers,
    loading,
    loadingPending,
    error,
    filters,
    setFilters,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
    loadPendingUsers,
    approvePendingUser,
    rejectPendingUser,
  };
}; 