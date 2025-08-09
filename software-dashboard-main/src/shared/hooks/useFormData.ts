import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/shared/utils/logger'
import { dataService, edgeFunctionsService } from '@/shared/services/supabase';
import type { Department } from '@/shared/services/supabase/types';

// =============================================================================
// USE FORM DATA HOOK - Hook reutilizable para carga de datos de formularios
// Arquitectura de Software Profesional - Gestión de Datos
// =============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  role_name: string;
  department_id?: number;
}

interface Area extends Department {}

interface FormDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

// =============================================================================
// HOOK BASE PARA CARGA DE DATOS
// =============================================================================

interface UseFormDataProps<T> {
  loadFunction: () => Promise<T[]>;
  dependencies?: any[];
}

export const useFormData = <T>({ 
  loadFunction, 
  dependencies = [] 
}: UseFormDataProps<T>) => {
  const [state, setState] = useState<FormDataState<T>>({
    data: [],
    loading: false,
    error: null
  });

  const loadData = useCallback(async () => {
    let isMounted = true;
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await loadFunction();
      if (isMounted) {
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (isMounted) {
        logger.error('Error cargando datos:', (error as Error).message);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Error desconocido' 
        }));
      }
    }
  }, [loadFunction]);

  useEffect(() => {
    loadData();
    
    // Cleanup function para evitar memory leaks
    return () => {
      // No necesitamos hacer nada aquí, pero es buena práctica
    };
  }, dependencies);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    refresh
  };
};

// =============================================================================
// HOOKS ESPECÍFICOS PARA DIFERENTES TIPOS DE DATOS
// =============================================================================

// Hook para cargar áreas/departamentos
export const useAreasData = () => {
  return useFormData<Area>({
    loadFunction: async () => {
      const departments = await dataService.getDepartments();
      return departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description
      }));
    }
  });
};

// Hook para cargar usuarios
export const useUsersData = () => {
  return useFormData<User>({
    loadFunction: async () => {
      return await edgeFunctionsService.getUsers();
    }
  });
};

// Hook para cargar usuarios filtrados por rol
export const useFilteredUsersData = (userRole?: string) => {
  return useFormData<User>({
    loadFunction: async () => {
      // El edge function ya maneja el filtrado según el rol
      // No necesitamos filtrar en el frontend
      return await edgeFunctionsService.getUsers();
    },
    dependencies: [userRole]
  });
};

// Hook para cargar datos de incidencias
export const useIncidentsData = (filters?: any) => {
  return useFormData<any>({
    loadFunction: async () => {
      return await dataService.getIncidents(filters);
    },
    dependencies: [filters]
  });
};

// Hook para cargar datos de requerimientos
export const useRequirementsData = (filters?: any) => {
  return useFormData<any>({
    loadFunction: async () => {
      return await dataService.getRequirements(filters);
    },
    dependencies: [filters]
  });
};

// =============================================================================
// HOOKS COMBINADOS PARA FORMULARIOS
// =============================================================================

// Hook combinado para formulario de incidencias
export const useIncidentFormData = (userRole?: string) => {
  const areas = useAreasData();
  const users = useFilteredUsersData(userRole);

  return {
    areas: areas.data,
    users: users.data,
    loading: areas.loading || users.loading,
    error: areas.error || users.error,
    refresh: () => {
      areas.refresh();
      users.refresh();
    }
  };
};

// Hook combinado para formulario de requerimientos
export const useRequirementFormData = (userRole?: string) => {
  const areas = useAreasData();
  const users = useFilteredUsersData(userRole);

  return {
    areas: areas.data,
    users: users.data,
    loading: areas.loading || users.loading,
    error: areas.error || users.error,
    refresh: () => {
      areas.refresh();
      users.refresh();
    }
  };
};

// Hook combinado para formulario de usuarios
export const useUserFormData = () => {
  const areas = useAreasData();

  return {
    areas: areas.data,
    loading: areas.loading,
    error: areas.error,
    refresh: areas.refresh
  };
};

// =============================================================================
// HOOKS PARA CACHE Y OPTIMIZACIÓN
// =============================================================================

// Hook para cachear datos con TTL
export const useCachedFormData = <T>(
  key: string,
  loadFunction: () => Promise<T[]>,
  ttl: number = 5 * 60 * 1000 // 5 minutos por defecto
) => {
  const [state, setState] = useState<FormDataState<T>>({
    data: [],
    loading: false,
    error: null
  });

  const loadData = useCallback(async () => {
    let isMounted = true;
    
    // Verificar cache
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) {
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
        return;
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await loadFunction();
      
      if (isMounted) {
        // Guardar en cache
        localStorage.setItem(key, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (isMounted) {
        logger.error('Error cargando datos:', (error as Error).message);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Error desconocido' 
        }));
      }
    }
  }, [loadFunction, key, ttl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    localStorage.removeItem(key); // Limpiar cache
    loadData();
  }, [loadData, key]);

  return {
    ...state,
    refresh
  };
}; 