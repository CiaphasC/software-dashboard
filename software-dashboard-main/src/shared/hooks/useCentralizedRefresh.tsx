// =============================================================================
// CENTRALIZED REFRESH HOOK - Hook para centralizar el sistema de refresh
// Arquitectura de Software Profesional - Optimización de Rendimiento
// =============================================================================

import { useRef, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { logger } from '@/shared/utils/logger'

// =============================================================================
// REFRESH CONTEXT - Contexto para compartir el sistema de refresh
// =============================================================================

interface RefreshContextType {
  registerRefresh: (id: string, config: RefreshConfig, callback?: () => void) => void;
  unregisterRefresh: (id: string) => void;
  manualRefresh: (id?: string) => void;
  getRefreshStatus: () => any;
  isEnabled: boolean;
}

const RefreshContext = createContext<RefreshContextType | null>(null);

export const useRefreshContext = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefreshContext debe ser usado dentro de RefreshProvider');
  }
  return context;
};

// =============================================================================
// TYPES - Tipos para el sistema de refresh centralizado
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
  | 'custom';              // Personalizado

export interface RefreshConfig {
  type: RefreshType;
  interval?: number;        // Intervalo personalizado (ms)
  enabled?: boolean;        // Si está habilitado
  dependencies?: string[];  // Dependencias adicionales
  priority?: 'high' | 'medium' | 'low'; // Prioridad del refresh
}

export interface RefreshCallback {
  id: string;
  callback: () => void;
  config: RefreshConfig;
  lastExecuted: number;
  nextExecution: number;
}

// =============================================================================
// FORM STATE CACHE - Cache para estado de formularios
// =============================================================================

interface FormStateCache {
  hasActiveModals: boolean;
  hasActiveForms: boolean;
  hasUserForms: boolean;
  lastCheck: number;
  cacheDuration: number;
}

const useFormStateCache = () => {
  const formStateRef = useRef<FormStateCache>({
    hasActiveModals: false,
    hasActiveForms: false,
    hasUserForms: false,
    lastCheck: 0,
    cacheDuration: 5000 // 5 segundos de cache
  });

  const checkFormState = useCallback(() => {
    const now = Date.now();
    const cache = formStateRef.current;

    // Usar cache si no ha expirado
    if (now - cache.lastCheck < cache.cacheDuration) {
      return {
        hasActiveModals: cache.hasActiveModals,
        hasActiveForms: cache.hasActiveForms,
        hasUserForms: cache.hasUserForms
      };
    }

    // Actualizar cache con nuevos valores
    const newState = {
      hasActiveModals: document.querySelectorAll('[data-modal="open"]').length > 0,
      hasActiveForms: document.querySelectorAll('form[data-loading="true"]').length > 0,
      hasUserForms: document.querySelectorAll('[data-form="user-form"]').length > 0
    };

    formStateRef.current = {
      ...newState,
      lastCheck: now,
      cacheDuration: cache.cacheDuration
    };

    return newState;
  }, []);

  return checkFormState;
};

// =============================================================================
// CENTRALIZED REFRESH SYSTEM - Sistema centralizado de refresh
// =============================================================================

export const useCentralizedRefresh = (stores: {
  auth: any;
  users: any;
  incidents: any;
  requirements: any;
  settings: any;
}) => {
  const { auth, users, incidents, requirements, settings } = stores;
  
  const refreshCallbacksRef = useRef<Map<string, RefreshCallback>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkFormState = useFormStateCache();

  // =============================================================================
  // REFRESH FUNCTIONS - Funciones de refresh específicas
  // =============================================================================

  const getRefreshFunction = useCallback((type: RefreshType) => {
    switch (type) {
      case 'users-list':
        return () => {
          if (auth.user?.role === 'admin') {
            users.loadUsers();
          }
        };
      case 'users-stats':
        return () => {
          if (auth.user?.role === 'admin') {
            users.loadUsers();
            auth.updatePendingUsersCount();
          }
        };
      case 'incidents-list':
        return () => incidents.loadIncidents();
      case 'incidents-stats':
        return () => incidents.loadIncidents();
      case 'requirements-list':
        return () => requirements.loadRequirements();
      case 'requirements-stats':
        return () => requirements.loadRequirements();
      case 'pending-users-count':
        return () => {
          if (auth.user?.role === 'admin') {
            auth.updatePendingUsersCount();
          }
        };
      case 'dashboard-metrics':
        return () => {
          if (auth.user?.role === 'admin') {
            auth.updatePendingUsersCount();
          }
          incidents.loadIncidents();
          requirements.loadRequirements();
        };
      case 'all':
        return () => {
          if (auth.user?.role === 'admin') {
            users.loadUsers();
            auth.updatePendingUsersCount();
          }
          incidents.loadIncidents();
          requirements.loadRequirements();
        };
      default:
        return () => {};
    }
  }, [auth.user?.role, users, incidents, requirements, auth]);

  // =============================================================================
  // REFRESH EXECUTOR - Ejecutor principal de refresh
  // =============================================================================

  const isInflightRef = useRef(false);
  const executeRefresh = useCallback(() => {
    if (isInflightRef.current) return;
    isInflightRef.current = true;
    // Verificar estado de formularios con cache
    const formState = checkFormState();
    
    // Si hay formularios activos, no hacer refresh
    if (formState.hasActiveModals || formState.hasActiveForms || formState.hasUserForms) {
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

    const now = Date.now();

    // Ejecutar callbacks que estén listos
    const toRun: Array<{ id: string; cb: () => void; interval: number }> = [];
    refreshCallbacksRef.current.forEach((refreshCallback, id) => {
      if (now >= refreshCallback.nextExecution) {
        toRun.push({ id, cb: refreshCallback.callback, interval: refreshCallback.config.interval || settings.config.dashboard.refreshInterval });
      }
    });

    // Ejecutar en lote con try/catch por callback
    for (const item of toRun) {
      try {
        item.cb();
        const cb = refreshCallbacksRef.current.get(item.id);
        if (cb) {
          cb.lastExecuted = now;
          cb.nextExecution = now + item.interval;
        }
      } catch (error) {
        logger.error(`Error ejecutando refresh ${item.id}: ${(error as Error)?.message}`)
      }
    }
    isInflightRef.current = false;
  }, [checkFormState, settings.config.dashboard.refreshInterval]);

  // =============================================================================
  // INTERVAL SETUP - Configuración del intervalo centralizado
  // =============================================================================

  useEffect(() => {
    // Verificar si el refresh está habilitado
    if (!auth.isAuthenticated || !settings.config.dashboard.autoRefresh) {
      return;
    }

    // Configurar intervalo centralizado
    intervalRef.current = setInterval(executeRefresh, 1000); // Verificar cada segundo

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    auth.isAuthenticated,
    settings.config.dashboard.autoRefresh,
    executeRefresh
  ]);

  // =============================================================================
  // PUBLIC API - API pública del hook
  // =============================================================================

  const registerRefresh = useCallback((id: string, config: RefreshConfig, callback?: () => void) => {
    const refreshFunction = callback || getRefreshFunction(config.type);
    const now = Date.now();
    
    refreshCallbacksRef.current.set(id, {
      id,
      callback: refreshFunction,
      config,
      lastExecuted: 0,
      nextExecution: now + (config.interval || settings.config.dashboard.refreshInterval)
    });
  }, [getRefreshFunction, settings.config.dashboard.refreshInterval]);

  const unregisterRefresh = useCallback((id: string) => {
    refreshCallbacksRef.current.delete(id);
  }, []);

  const manualRefresh = useCallback((id?: string) => {
    if (id) {
      const callback = refreshCallbacksRef.current.get(id);
      if (callback) {
        callback.callback();
      }
    } else {
      // Ejecutar todos los callbacks
      refreshCallbacksRef.current.forEach((refreshCallback) => {
        refreshCallback.callback();
      });
    }
  }, []);

  const getRefreshStatus = useCallback(() => {
    const now = Date.now();
    const status = Array.from(refreshCallbacksRef.current.values()).map(callback => ({
      id: callback.id,
      type: callback.config.type,
      lastExecuted: callback.lastExecuted,
      nextExecution: callback.nextExecution,
      isReady: now >= callback.nextExecution,
      timeUntilNext: Math.max(0, callback.nextExecution - now)
    }));

    return {
      totalCallbacks: refreshCallbacksRef.current.size,
      activeCallbacks: status.filter(s => s.isReady).length,
      callbacks: status
    };
  }, []);

  // =============================================================================
  // RETURN VALUES - Valores retornados por el hook
  // =============================================================================

  return {
    registerRefresh,
    unregisterRefresh,
    manualRefresh,
    getRefreshStatus,
    isEnabled: auth.isAuthenticated && settings.config.dashboard.autoRefresh
  };
};

// =============================================================================
// COMPONENT REFRESH HOOK - Hook simplificado para componentes
// =============================================================================

export const useComponentRefresh = (config: RefreshConfig) => {
  const { registerRefresh, unregisterRefresh, manualRefresh, isEnabled } = useRefreshContext();
  const id = useRef(`component-${config.type}-${Date.now()}`).current;

  useEffect(() => {
    if (config.enabled && isEnabled) {
      registerRefresh(id, config);
    }

    return () => {
      unregisterRefresh(id);
    };
  }, [
    id,
    config.enabled,
    config.type,
    config.interval,
    isEnabled,
    registerRefresh,
    unregisterRefresh,
    ...(config.dependencies || [])
  ]);

  return {
    manualRefresh: () => manualRefresh(id),
    isEnabled: config.enabled && isEnabled,
    refreshType: config.type
  };
}; 

// =============================================================================
// REFRESH PROVIDER - Provider para el sistema de refresh
// =============================================================================

interface RefreshProviderProps {
  children: ReactNode;
  stores: {
    auth: any;
    users: any;
    incidents: any;
    requirements: any;
    settings: any;
  };
}

export const RefreshProvider: React.FC<RefreshProviderProps> = ({ children, stores }) => {
  const refreshSystem = useCentralizedRefresh(stores);
  
  return (
    <RefreshContext.Provider value={refreshSystem}>
      {children}
    </RefreshContext.Provider>
  );
}; 