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
export const useFilteredUsers = () => {
  const users = useUsersStore((s) => s.users)
  const filters = useUsersStore((s) => s.filters)
  const searchQuery = useUsersStore((s) => s.searchQuery)
  const currentPage = useUsersStore((s) => s.currentPage)
  const itemsPerPage = useUsersStore((s) => s.itemsPerPage)

  return React.useMemo(() => {
    const filtered = users.filter((user) => {
      if (filters.role && user.role !== filters.role) return false
      if ((filters as any).department && user.department !== (filters as any).department) return false
      if (searchQuery) {
        const s = searchQuery.toLowerCase()
        const name = user.name.toLowerCase().includes(s)
        const email = user.email.toLowerCase().includes(s)
        const dept = user.department.toLowerCase().includes(s)
        if (!name && !email && !dept) return false
      }
      return true
    })
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage)
    return {
      users: paginated,
      totalUsers: filtered.length,
      currentPage,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    }
  }, [users, filters, searchQuery, currentPage, itemsPerPage])
}

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
export const useFilteredIncidents = () => {
  const incidents = useIncidentsStore((s) => s.incidents)
  const filters = useIncidentsStore((s) => s.filters)
  const searchQuery = useIncidentsStore((s) => s.searchQuery)
  const currentPage = useIncidentsStore((s) => s.currentPage)
  const itemsPerPage = useIncidentsStore((s) => s.itemsPerPage)

  return React.useMemo(() => {
    const filtered = incidents.filter((incident) => {
      if ((filters as any).status && incident.status !== (filters as any).status) return false
      if ((filters as any).priority && incident.priority !== (filters as any).priority) return false
      if ((filters as any).type && incident.type !== (filters as any).type) return false
      if ((filters as any).department && (incident as any).affectedArea !== (filters as any).department) return false
      if (searchQuery) {
        const s = searchQuery.toLowerCase()
        const t = incident.title.toLowerCase().includes(s)
        const d = incident.description.toLowerCase().includes(s)
        if (!t && !d) return false
      }
      return true
    })
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage)
    return {
      incidents: paginated,
      totalIncidents: filtered.length,
      currentPage,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    }
  }, [incidents, filters, searchQuery, currentPage, itemsPerPage])
}

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
export const useFilteredRequirements = () => {
  const requirements = useRequirementsStore((s) => s.requirements)
  const filters = useRequirementsStore((s) => s.filters)
  const searchQuery = useRequirementsStore((s) => s.searchQuery)
  const currentPage = useRequirementsStore((s) => s.currentPage)
  const itemsPerPage = useRequirementsStore((s) => s.itemsPerPage)

  return React.useMemo(() => {
    const filtered = requirements.filter((req) => {
      if ((filters as any).status && req.status !== (filters as any).status) return false
      if ((filters as any).priority && req.priority !== (filters as any).priority) return false
      if ((filters as any).type && req.type !== (filters as any).type) return false
      if ((filters as any).department && (req as any).requestingArea !== (filters as any).department) return false
      if (searchQuery) {
        const s = searchQuery.toLowerCase()
        const t = req.title.toLowerCase().includes(s)
        const d = req.description.toLowerCase().includes(s)
        if (!t && !d) return false
      }
      return true
    })
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage)
    return {
      requirements: paginated,
      totalRequirements: filtered.length,
      currentPage,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    }
  }, [requirements, filters, searchQuery, currentPage, itemsPerPage])
}

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