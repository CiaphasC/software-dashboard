import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, UserRole } from '@/shared/types/common.types';
import { usersService } from '@/shared/services/usersService';
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
  loading: boolean;
  error: string | null;
  filters: {
    role: string;
    department: string;
    search: string;
  };
  setFilters: (filters: Partial<UseUsersReturn['filters']>) => void;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
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

  return {
    users,
    filteredUsers,
    loading,
    error,
    filters,
    setFilters,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
  };
}; 