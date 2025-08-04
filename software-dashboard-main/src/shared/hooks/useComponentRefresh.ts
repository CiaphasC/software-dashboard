// =============================================================================
// USE COMPONENT REFRESH HOOK - Hook para refresh granular de componentes
// Arquitectura de Software Profesional - Gestión de Estado de Componentes
// =============================================================================

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/shared/store/StoreProvider';

// =============================================================================
// REFRESH TYPES - Tipos de refresh disponibles
// =============================================================================

export type RefreshType = 
  | 'users-list'           // Lista de usuarios
  | 'users-stats'          // Estadísticas de usuarios
  | 'incidents-list'       // Lista de incidencias
  | 'incidents-stats'      // Estadísticas de incidencias
  | 'requirements-list'    // Lista de requerimientos
  | 'requirements-stats'   // Estadísticas de requerimientos
  | 'pending-users-count'  // Contador de usuarios pendientes
  | 'dashboard-metrics'    // Métricas del dashboard
  | 'all'                  // Todo (fallback)

// =============================================================================
// REFRESH CONFIG - Configuración de refresh por componente
// =============================================================================

interface RefreshConfig {
  type: RefreshType;
  interval?: number;        // Intervalo personalizado (ms)
  enabled?: boolean;        // Si está habilitado
  dependencies?: string[];  // Dependencias adicionales
}

// =============================================================================
// USE COMPONENT REFRESH - Hook principal
// =============================================================================

export const useComponentRefresh = (config: RefreshConfig) => {
  const { auth, users, incidents, requirements, settings } = useStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<Date>(new Date());

  // =============================================================================
  // REFRESH FUNCTIONS - Funciones específicas de refresh
  // =============================================================================

  const refreshUsersList = useCallback(() => {
    if (auth.user?.role === 'admin') {
      users.loadUsers();
    }
  }, [auth.user?.role, users]);

  const refreshUsersStats = useCallback(() => {
    if (auth.user?.role === 'admin') {
      users.loadUsers(); // Recarga usuarios para actualizar estadísticas
    }
  }, [auth.user?.role, users]);

  const refreshIncidentsList = useCallback(() => {
    incidents.loadIncidents();
  }, [incidents]);

  const refreshIncidentsStats = useCallback(() => {
    incidents.loadIncidents(); // Recarga incidencias para actualizar estadísticas
  }, [incidents]);

  const refreshRequirementsList = useCallback(() => {
    requirements.loadRequirements();
  }, [requirements]);

  const refreshRequirementsStats = useCallback(() => {
    requirements.loadRequirements(); // Recarga requerimientos para actualizar estadísticas
  }, [requirements]);

  const refreshPendingUsersCount = useCallback(() => {
    if (auth.user?.role === 'admin') {
      auth.updatePendingUsersCount();
    }
  }, [auth.user?.role, auth]);

  const refreshDashboardMetrics = useCallback(() => {
    if (auth.user?.role === 'admin') {
      users.loadUsers();
      auth.updatePendingUsersCount();
    }
    incidents.loadIncidents();
    requirements.loadRequirements();
  }, [auth.user?.role, auth, users, incidents, requirements]);

  // =============================================================================
  // REFRESH SELECTOR - Selector de función de refresh
  // =============================================================================

  const getRefreshFunction = useCallback((type: RefreshType) => {
    switch (type) {
      case 'users-list':
        return refreshUsersList;
      case 'users-stats':
        return refreshUsersStats;
      case 'incidents-list':
        return refreshIncidentsList;
      case 'incidents-stats':
        return refreshIncidentsStats;
      case 'requirements-list':
        return refreshRequirementsList;
      case 'requirements-stats':
        return refreshRequirementsStats;
      case 'pending-users-count':
        return refreshPendingUsersCount;
      case 'dashboard-metrics':
        return refreshDashboardMetrics;
      case 'all':
        return refreshDashboardMetrics;
      default:
        return () => {};
    }
  }, [
    refreshUsersList,
    refreshUsersStats,
    refreshIncidentsList,
    refreshIncidentsStats,
    refreshRequirementsList,
    refreshRequirementsStats,
    refreshPendingUsersCount,
    refreshDashboardMetrics
  ]);

  // =============================================================================
  // REFRESH EXECUTOR - Ejecutor principal de refresh
  // =============================================================================

  const executeRefresh = useCallback(() => {
    // Verificar si hay formularios activos o modales abiertos
    const activeModals = document.querySelectorAll('[data-modal="open"]');
    const activeForms = document.querySelectorAll('form[data-loading="true"]');
    const userForms = document.querySelectorAll('[data-form="user-form"]');
    
    // Si hay modales, formularios activos o formularios de usuario abiertos, no hacer refresh
    if (activeModals.length > 0 || activeForms.length > 0 || userForms.length > 0) {
      return;
    }

    // Verificar si estamos en una página específica donde no queremos auto-refresh
    const currentPath = window.location.pathname;
    const isUsersPage = currentPath.includes('/users');
    
    // En la página de usuarios, solo hacer refresh si no hay formularios abiertos
    if (isUsersPage) {
      const hasOpenForms = document.querySelectorAll('[data-form="user-form"], [data-modal="user-form"]').length > 0;
      if (hasOpenForms) {
        return;
      }
    }

    // Ejecutar refresh específico
    const refreshFunction = getRefreshFunction(config.type);
    refreshFunction();
    
    // Actualizar timestamp del último refresh
    lastRefreshRef.current = new Date();
  }, [config.type, getRefreshFunction]);

  // =============================================================================
  // INTERVAL SETUP - Configuración del intervalo
  // =============================================================================

  useEffect(() => {
    // Verificar si el refresh está habilitado
    if (!config.enabled || !auth.isAuthenticated || !settings.config.dashboard.autoRefresh) {
      return;
    }

    // Usar intervalo personalizado o el global
    const interval = config.interval || settings.config.dashboard.refreshInterval;

    // Configurar intervalo
    intervalRef.current = setInterval(executeRefresh, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    config.enabled,
    config.interval,
    auth.isAuthenticated,
    settings.config.dashboard.autoRefresh,
    settings.config.dashboard.refreshInterval,
    executeRefresh,
    ...(config.dependencies || [])
  ]);

  // =============================================================================
  // MANUAL REFRESH - Función para refresh manual
  // =============================================================================

  const manualRefresh = useCallback(() => {
    executeRefresh();
  }, [executeRefresh]);

  // =============================================================================
  // RETURN VALUES - Valores retornados por el hook
  // =============================================================================

  return {
    manualRefresh,
    lastRefresh: lastRefreshRef.current,
    isEnabled: config.enabled && auth.isAuthenticated && settings.config.dashboard.autoRefresh,
    refreshType: config.type
  };
}; 