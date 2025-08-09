import type { IncidentsState } from '@/shared/store/incidentsStore'
import type { RequirementsState } from '@/shared/store/requirementsStore'
import type { UsersState } from '@/shared/store/usersStore'

export const selectIncidents = (s: IncidentsState) => s.incidents
export const selectIncidentsLoading = (s: IncidentsState) => s.loading
export const selectIncidentsHasMore = (s: IncidentsState) => s.hasMore

export const selectRequirements = (s: RequirementsState) => s.requirements
export const selectRequirementsLoading = (s: RequirementsState) => s.loading
export const selectRequirementsHasMore = (s: RequirementsState) => s.hasMore

export const selectUsers = (s: UsersState) => s.users
export const selectUsersLoading = (s: UsersState) => s.loading
export const selectUsersHasMore = (s: UsersState) => s.hasMore

// =============================================================================
// STORE SELECTORS - Selectores optimizados para stores de Zustand
// Arquitectura de Software Profesional - Optimización de Performance
// =============================================================================

import React from 'react';
import { useAuthStore } from '@/shared/store/authStore';
import { useUsersStore } from '@/shared/store/usersStore';
import { useIncidentsStore } from '@/shared/store/incidentsStore';
import { useRequirementsStore } from '@/shared/store/requirementsStore';
import { useSettingsStore } from '@/shared/store/settingsStore';
import { User, UserRole, Incident, Requirement } from '@/shared/types/common.types';

// =============================================================================
// AUTH SELECTORS - Selectores de autenticación
// =============================================================================

/**
 * Selector para obtener solo el usuario autenticado
 */
export const useAuthUser = () => useAuthStore((state) => state.user);

/**
 * Selector para obtener solo el estado de autenticación
 */
export const useAuthStatus = () => useAuthStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  loading: state.loading,
  error: state.error
}));

/**
 * Selector para obtener solo los usuarios pendientes
 */
export const usePendingUsers = () => useAuthStore((state) => ({
  pendingUsers: state.pendingUsers,
  pendingUsersCount: state.pendingUsersCount
}));

/**
 * Selector para verificar si el usuario es administrador
 */
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'admin');

/**
 * Selector para verificar si el usuario es técnico
 */
export const useIsTechnician = () => useAuthStore((state) => state.user?.role === 'technician');

/**
 * Selector para verificar si el usuario es solicitante
 */
export const useIsRequester = () => useAuthStore((state) => state.user?.role === 'requester');

// =============================================================================
// USERS SELECTORS - Selectores de usuarios
// =============================================================================

/**
 * Selector para obtener usuarios filtrados y paginados
 */
export const useFilteredUsers = () => useUsersStore((state) => {
  const { users, filters, searchQuery, currentPage, itemsPerPage } = state;
  
  // Aplicar filtros
  let filtered = users.filter(user => {
    // Filtro por rol
    if (filters.role && user.role !== filters.role) {
      return false;
    }
    
    // Filtro por departamento
    if (filters.department && user.department !== filters.department) {
      return false;
    }
    
    // Filtro de búsqueda
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesName = user.name.toLowerCase().includes(searchLower);
      const matchesEmail = user.email.toLowerCase().includes(searchLower);
      const matchesDepartment = user.department.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesEmail && !matchesDepartment) {
        return false;
      }
    }
    
    return true;
  });
  
  // Aplicar paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filtered.slice(startIndex, startIndex + itemsPerPage);
  
  return {
    users: paginatedUsers,
    totalUsers: filtered.length,
    currentPage,
    totalPages: Math.ceil(filtered.length / itemsPerPage)
  };
});

/**
 * Selector para obtener estadísticas de usuarios
 */
export const useUsersStats = () => useUsersStore((state) => state.stats);

/**
 * Selector para obtener usuarios por rol
 */
export const useUsersByRole = (role: UserRole) => useUsersStore((state) => 
  state.users.filter(user => user.role === role)
);

/**
 * Selector para obtener usuarios activos
 */
export const useActiveUsers = () => useUsersStore((state) => 
  state.users.filter(user => user.isActive)
);

// =============================================================================
// INCIDENTS SELECTORS - Selectores de incidencias
// =============================================================================

/**
 * Selector para obtener incidencias filtradas y paginadas
 */
export const useFilteredIncidents = () => useIncidentsStore((state) => {
  const { incidents, filters, searchQuery, currentPage, itemsPerPage } = state;
  
  // Aplicar filtros
  let filtered = incidents.filter(incident => {
    // Filtro por estado
    if (filters.status && incident.status !== filters.status) {
      return false;
    }
    
    // Filtro por prioridad
    if (filters.priority && incident.priority !== filters.priority) {
      return false;
    }
    
    // Filtro por tipo
    if (filters.type && incident.type !== filters.type) {
      return false;
    }
    
    // Filtro por departamento
    if (filters.department && incident.affectedArea !== filters.department) {
      return false;
    }
    
    // Filtro de búsqueda
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesTitle = incident.title.toLowerCase().includes(searchLower);
      const matchesDescription = incident.description.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }
    
    return true;
  });
  
  // Aplicar paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIncidents = filtered.slice(startIndex, startIndex + itemsPerPage);
  
  return {
    incidents: paginatedIncidents,
    totalIncidents: filtered.length,
    currentPage,
    totalPages: Math.ceil(filtered.length / itemsPerPage)
  };
});

/**
 * Selector para obtener estadísticas de incidencias
 */
export const useIncidentsStats = () => useIncidentsStore((state) => state.stats);

/**
 * Selector para obtener incidencias por estado
 */
export const useIncidentsByStatus = (status: string) => useIncidentsStore((state) => 
  state.incidents.filter(incident => incident.status === status)
);

/**
 * Selector para obtener incidencias por prioridad
 */
export const useIncidentsByPriority = (priority: string) => useIncidentsStore((state) => 
  state.incidents.filter(incident => incident.priority === priority)
);

// =============================================================================
// REQUIREMENTS SELECTORS - Selectores de requerimientos
// =============================================================================

/**
 * Selector para obtener requerimientos filtrados y paginados
 */
export const useFilteredRequirements = () => useRequirementsStore((state) => {
  const { requirements, filters, searchQuery, currentPage, itemsPerPage } = state;
  
  // Aplicar filtros
  let filtered = requirements.filter(requirement => {
    // Filtro por estado
    if (filters.status && requirement.status !== filters.status) {
      return false;
    }
    
    // Filtro por prioridad
    if (filters.priority && requirement.priority !== filters.priority) {
      return false;
    }
    
    // Filtro por tipo
    if (filters.type && requirement.type !== filters.type) {
      return false;
    }
    
    // Filtro por departamento
    if (filters.department && requirement.requestingArea !== filters.department) {
      return false;
    }
    
    // Filtro de búsqueda
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesTitle = requirement.title.toLowerCase().includes(searchLower);
      const matchesDescription = requirement.description.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }
    
    return true;
  });
  
  // Aplicar paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequirements = filtered.slice(startIndex, startIndex + itemsPerPage);
  
  return {
    requirements: paginatedRequirements,
    totalRequirements: filtered.length,
    currentPage,
    totalPages: Math.ceil(filtered.length / itemsPerPage)
  };
});

/**
 * Selector para obtener estadísticas de requerimientos
 */
export const useRequirementsStats = () => useRequirementsStore((state) => state.stats);

/**
 * Selector para obtener requerimientos por estado
 */
export const useRequirementsByStatus = (status: string) => useRequirementsStore((state) => 
  state.requirements.filter(requirement => requirement.status === status)
);

// =============================================================================
// SETTINGS SELECTORS - Selectores de configuración
// =============================================================================

/**
 * Selector para obtener configuración de tema
 */
export const useThemeConfig = () => useSettingsStore((state) => ({
  theme: state.config.appearance.theme,
  colorScheme: state.config.appearance.colorScheme,
  fontSize: state.config.appearance.fontSize
}));

/**
 * Selector para obtener configuración de idioma
 */
export const useLanguageConfig = () => useSettingsStore((state) => ({
  language: state.config.general.language,
  timezone: state.config.general.timezone,
  dateFormat: state.config.general.dateFormat
}));

/**
 * Selector para obtener configuración de notificaciones
 */
export const useNotificationsConfig = () => useSettingsStore((state) => ({
  emailNotifications: state.config.notifications.emailNotifications,
  pushNotifications: state.config.notifications.pushNotifications,
  incidentAlerts: state.config.notifications.incidentAlerts,
  requirementUpdates: state.config.notifications.requirementUpdates
}));

/**
 * Selector para obtener configuración del dashboard
 */
export const useDashboardConfig = () => useSettingsStore((state) => ({
  autoRefresh: state.config.dashboard.autoRefresh,
  refreshInterval: state.config.dashboard.refreshInterval,
  showCharts: state.config.dashboard.showCharts,
  showMetrics: state.config.dashboard.showMetrics
}));

// =============================================================================
// COMPOSED SELECTORS - Selectores compuestos
// =============================================================================

/**
 * Selector para obtener datos del dashboard combinados
 */
export const useDashboardData = () => {
  const incidentsStats = useIncidentsStats();
  const requirementsStats = useRequirementsStats();
  const usersStats = useUsersStats();
  const dashboardConfig = useDashboardConfig();
  
  return {
    incidents: incidentsStats,
    requirements: requirementsStats,
    users: usersStats,
    config: dashboardConfig
  };
};

/**
 * Selector para obtener datos de filtros combinados
 */
export const useCombinedFilters = () => {
  const incidentsFilters = useIncidentsStore((state) => state.filters);
  const requirementsFilters = useRequirementsStore((state) => state.filters);
  const usersFilters = useUsersStore((state) => state.filters);
  
  return {
    incidents: incidentsFilters,
    requirements: requirementsFilters,
    users: usersFilters
  };
};

// =============================================================================
// MEMOIZED SELECTORS - Selectores con memoización
// =============================================================================

/**
 * Selector memoizado para usuarios con filtros complejos
 */
export const useMemoizedUsers = () => {
  const users = useUsersStore((state) => state.users);
  const filters = useUsersStore((state) => state.filters);
  const searchQuery = useUsersStore((state) => state.searchQuery);
  
  return React.useMemo(() => {
    return users.filter(user => {
      // Lógica de filtrado compleja
      if (filters.role && user.role !== filters.role) return false;
      if (filters.department && user.department !== filters.department) return false;
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return user.name.toLowerCase().includes(searchLower) ||
               user.email.toLowerCase().includes(searchLower) ||
               user.department.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [users, filters, searchQuery]);
};

// =============================================================================
// EXPORT DEFAULT - Exportación por defecto
// =============================================================================

export default {
  // Auth selectors
  useAuthUser,
  useAuthStatus,
  usePendingUsers,
  useIsAdmin,
  useIsTechnician,
  useIsRequester,
  
  // Users selectors
  useFilteredUsers,
  useUsersStats,
  useUsersByRole,
  useActiveUsers,
  
  // Incidents selectors
  useFilteredIncidents,
  useIncidentsStats,
  useIncidentsByStatus,
  useIncidentsByPriority,
  
  // Requirements selectors
  useFilteredRequirements,
  useRequirementsStats,
  useRequirementsByStatus,
  
  // Settings selectors
  useThemeConfig,
  useLanguageConfig,
  useNotificationsConfig,
  useDashboardConfig,
  
  // Composed selectors
  useDashboardData,
  useCombinedFilters,
  useMemoizedUsers
}; 