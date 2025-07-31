// =============================================================================
// USE API SERVICE HOOK - Hook personalizado para el servicio API
// Arquitectura de Software Profesional - React Hooks Optimizado
// =============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { apiService, ApiResponse, ApiError, RequestOptions } from '../services/api/ApiService';

// =============================================================================
// TYPES - Tipos para el hook
// =============================================================================

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}

export interface UseApiOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  onConnectionChange?: (status: 'connected' | 'disconnected' | 'error') => void;
}

// =============================================================================
// USE API SERVICE HOOK - Hook principal
// =============================================================================

/**
 * Hook personalizado para utilizar el servicio API con reactividad
 * @param options - Opciones de configuración
 * @returns Estado y métodos del API
 */
export function useApiService(options: UseApiOptions = {}) {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    onSuccess,
    onError,
    onConnectionChange
  } = options;

  // =============================================================================
  // STATE MANAGEMENT - Gestión de estado local
  // =============================================================================

  const [state, setState] = useState<UseApiState<any>>({
    data: null,
    loading: false,
    error: null,
    connectionStatus: 'disconnected'
  });

  // =============================================================================
  // REFS - Referencias para cleanup
  // =============================================================================

  const subscriptionsRef = useRef<Subscription[]>([]);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // =============================================================================
  // SUBSCRIPTION MANAGEMENT - Gestión de suscripciones
  // =============================================================================

  /**
   * Agrega una suscripción a la lista para cleanup
   * @param subscription - Suscripción a agregar
   */
  const addSubscription = useCallback((subscription: Subscription) => {
    subscriptionsRef.current.push(subscription);
  }, []);

  /**
   * Limpia todas las suscripciones activas
   */
  const clearSubscriptions = useCallback(() => {
    subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    subscriptionsRef.current = [];
  }, []);

  // =============================================================================
  // API METHODS - Métodos para interactuar con la API
  // =============================================================================

  /**
   * Realiza una petición GET con reactividad
   * @param endpoint - Endpoint de la API
   * @param requestOptions - Opciones de la petición
   * @returns Promise con la respuesta
   */
  const get = useCallback(<T>(endpoint: string, requestOptions: RequestOptions = {}): Promise<ApiResponse<T>> => {
    return new Promise((resolve, reject) => {
      const subscription = apiService.get<T>(endpoint, requestOptions).subscribe({
        next: (response) => {
          setState(prev => ({
            ...prev,
            data: response.data,
            loading: false,
            error: null
          }));
          
          if (onSuccess) {
            onSuccess(response.data);
          }
          
          resolve(response);
        },
        error: (error: ApiError) => {
          setState(prev => ({
            ...prev,
            loading: false,
            error
          }));
          
          if (onError) {
            onError(error);
          }
          
          reject(error);
        }
      });

      addSubscription(subscription);
    });
  }, [onSuccess, onError, addSubscription]);

  /**
   * Realiza una petición POST con reactividad
   * @param endpoint - Endpoint de la API
   * @param data - Datos a enviar
   * @param requestOptions - Opciones de la petición
   * @returns Promise con la respuesta
   */
  const post = useCallback(<T>(endpoint: string, data: any, requestOptions: RequestOptions = {}): Promise<ApiResponse<T>> => {
    return new Promise((resolve, reject) => {
      const subscription = apiService.post<T>(endpoint, data, requestOptions).subscribe({
        next: (response) => {
          setState(prev => ({
            ...prev,
            data: response.data,
            loading: false,
            error: null
          }));
          
          if (onSuccess) {
            onSuccess(response.data);
          }
          
          resolve(response);
        },
        error: (error: ApiError) => {
          setState(prev => ({
            ...prev,
            loading: false,
            error
          }));
          
          if (onError) {
            onError(error);
          }
          
          reject(error);
        }
      });

      addSubscription(subscription);
    });
  }, [onSuccess, onError, addSubscription]);

  /**
   * Realiza una petición PUT con reactividad
   * @param endpoint - Endpoint de la API
   * @param data - Datos a actualizar
   * @param requestOptions - Opciones de la petición
   * @returns Promise con la respuesta
   */
  const put = useCallback(<T>(endpoint: string, data: any, requestOptions: RequestOptions = {}): Promise<ApiResponse<T>> => {
    return new Promise((resolve, reject) => {
      const subscription = apiService.put<T>(endpoint, data, requestOptions).subscribe({
        next: (response) => {
          setState(prev => ({
            ...prev,
            data: response.data,
            loading: false,
            error: null
          }));
          
          if (onSuccess) {
            onSuccess(response.data);
          }
          
          resolve(response);
        },
        error: (error: ApiError) => {
          setState(prev => ({
            ...prev,
            loading: false,
            error
          }));
          
          if (onError) {
            onError(error);
          }
          
          reject(error);
        }
      });

      addSubscription(subscription);
    });
  }, [onSuccess, onError, addSubscription]);

  /**
   * Realiza una petición DELETE con reactividad
   * @param endpoint - Endpoint de la API
   * @param requestOptions - Opciones de la petición
   * @returns Promise con la respuesta
   */
  const del = useCallback(<T>(endpoint: string, requestOptions: RequestOptions = {}): Promise<ApiResponse<T>> => {
    return new Promise((resolve, reject) => {
      const subscription = apiService.delete<T>(endpoint, requestOptions).subscribe({
        next: (response) => {
          setState(prev => ({
            ...prev,
            data: response.data,
            loading: false,
            error: null
          }));
          
          if (onSuccess) {
            onSuccess(response.data);
          }
          
          resolve(response);
        },
        error: (error: ApiError) => {
          setState(prev => ({
            ...prev,
            loading: false,
            error
          }));
          
          if (onError) {
            onError(error);
          }
          
          reject(error);
        }
      });

      addSubscription(subscription);
    });
  }, [onSuccess, onError, addSubscription]);

  // =============================================================================
  // CACHE MANAGEMENT - Gestión de caché
  // =============================================================================

  /**
   * Invalida todo el caché
   */
  const invalidateCache = useCallback(() => {
    apiService.invalidateCache();
  }, []);

  /**
   * Invalida un endpoint específico del caché
   * @param endpoint - Endpoint a invalidar
   */
  const invalidateEndpoint = useCallback((endpoint: string) => {
    apiService.invalidateEndpoint(endpoint);
  }, []);

  // =============================================================================
  // AUTO REFRESH - Actualización automática
  // =============================================================================

  /**
   * Configura la actualización automática
   * @param endpoint - Endpoint a actualizar
   * @param requestOptions - Opciones de la petición
   */
  const setupAutoRefresh = useCallback((endpoint: string, requestOptions: RequestOptions = {}) => {
    if (!autoRefresh) return;

    const refresh = () => {
      get(endpoint, requestOptions).catch(() => {
        // Silenciar errores en auto-refresh
      });
    };

    // Configurar timer de actualización
    refreshTimerRef.current = setInterval(refresh, refreshInterval);

    // Realizar primera carga
    refresh();
  }, [autoRefresh, refreshInterval, get]);

  // =============================================================================
  // EFFECTS - Efectos de React
  // =============================================================================

  useEffect(() => {
    // Suscribirse al estado de conexión
    const connectionSubscription = apiService.getConnectionStatus$().subscribe({
      next: (status) => {
        setState(prev => ({
          ...prev,
          connectionStatus: status
        }));
        
        if (onConnectionChange) {
          onConnectionChange(status);
        }
      }
    });

    // Suscribirse al estado de carga
    const loadingSubscription = apiService.getLoadingStream$().subscribe({
      next: (loading) => {
        setState(prev => ({
          ...prev,
          loading
        }));
      }
    });

    // Suscribirse a errores
    const errorSubscription = apiService.getErrorStream$().subscribe({
      next: (error) => {
        setState(prev => ({
          ...prev,
          error
        }));
        
        if (onError) {
          onError(error);
        }
      }
    });

    addSubscription(connectionSubscription);
    addSubscription(loadingSubscription);
    addSubscription(errorSubscription);

    // Cleanup al desmontar
    return () => {
      clearSubscriptions();
      
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [addSubscription, clearSubscriptions, onConnectionChange, onError]);

  // =============================================================================
  // RETURN - Retorno del hook
  // =============================================================================

  return {
    // Estado
    ...state,
    
    // Métodos HTTP
    get,
    post,
    put,
    delete: del,
    
    // Gestión de caché
    invalidateCache,
    invalidateEndpoint,
    
    // Auto-refresh
    setupAutoRefresh,
    
    // Utilidades
    clearSubscriptions
  };
}

// =============================================================================
// SPECIALIZED HOOKS - Hooks especializados para casos de uso comunes
// =============================================================================

/**
 * Hook especializado para datos que se actualizan automáticamente
 * @param endpoint - Endpoint de la API
 * @param options - Opciones de configuración
 * @returns Estado y métodos del API
 */
export function useAutoRefreshApi<T>(
  endpoint: string,
  options: UseApiOptions & { refreshInterval?: number } = {}
) {
  const api = useApiService({
    ...options,
    autoRefresh: true,
    refreshInterval: options.refreshInterval || 30000
  });

  useEffect(() => {
    api.setupAutoRefresh(endpoint);
  }, [endpoint, api]);

  return api;
}

/**
 * Hook especializado para formularios
 * @param options - Opciones de configuración
 * @returns Estado y métodos del API optimizados para formularios
 */
export function useFormApi(options: UseApiOptions = {}) {
  const [formState, setFormState] = useState({
    isSubmitting: false,
    submitError: null as ApiError | null,
    submitSuccess: false
  });

  const api = useApiService({
    ...options,
    onSuccess: (data) => {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitSuccess: true,
        submitError: null
      }));
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitSuccess: false,
        submitError: error
      }));
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });

  const submitForm = useCallback(async (endpoint: string, data: any) => {
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      submitSuccess: false,
      submitError: null
    }));

    try {
      await api.post(endpoint, data);
    } catch (error) {
      // Error manejado por onError
    }
  }, [api]);

  return {
    ...api,
    ...formState,
    submitForm
  };
} 