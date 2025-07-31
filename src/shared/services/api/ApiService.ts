// =============================================================================
// API SERVICE - Servicio de conexión con la API
// Arquitectura de Software Profesional - Reactividad y Asincronismo Optimizado
// =============================================================================

import { Subject, Observable, BehaviorSubject, combineLatest, timer, of } from 'rxjs';
import { 
  map, 
  switchMap, 
  catchError, 
  retry, 
  debounceTime, 
  distinctUntilChanged,
  takeUntil,
  shareReplay,
  filter,
  tap
} from 'rxjs/operators';

// =============================================================================
// TYPES - Tipos de datos para la API
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCache: boolean;
  cacheTimeout: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
}

// =============================================================================
// CACHE SERVICE - Gestión de caché optimizada
// =============================================================================

class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

// =============================================================================
// API SERVICE - Servicio principal de conexión
// =============================================================================

export class ApiService {
  private static instance: ApiService;
  private config: ApiConfig;
  private cache: ApiCache;
  private destroy$ = new Subject<void>();

  // =============================================================================
  // REACTIVE STREAMS - Flujos reactivos para actualización automática
  // =============================================================================

  // Stream principal de datos
  private dataStream$ = new BehaviorSubject<any>({});
  
  // Stream de estado de conexión
  private connectionStatus$ = new BehaviorSubject<'connected' | 'disconnected' | 'error'>('disconnected');
  
  // Stream de errores
  private errorStream$ = new Subject<ApiError>();
  
  // Stream de carga
  private loadingStream$ = new BehaviorSubject<boolean>(false);

  // =============================================================================
  // CONSTRUCTOR - Inicialización del servicio
  // =============================================================================

  private constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:3000/api',
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      enableCache: config.enableCache !== false,
      cacheTimeout: config.cacheTimeout || 300000
    };

    this.cache = new ApiCache();
    this.initializeReactiveStreams();
  }

  // =============================================================================
  // SINGLETON PATTERN - Patrón singleton para evitar múltiples instancias
  // =============================================================================

  static getInstance(config?: Partial<ApiConfig>): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(config);
    }
    return ApiService.instance;
  }

  // =============================================================================
  // INITIALIZATION - Inicialización de streams reactivos
  // =============================================================================

  private initializeReactiveStreams(): void {
    // Configurar limpieza automática de caché
    timer(0, this.config.cacheTimeout)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Limpiar caché expirado automáticamente
        this.cleanupExpiredCache();
      });

    // Configurar heartbeat de conexión
    timer(0, 30000) // Cada 30 segundos
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.checkConnection())
      )
      .subscribe(
        () => this.connectionStatus$.next('connected'),
        () => this.connectionStatus$.next('error')
      );
  }

  // =============================================================================
  // PUBLIC METHODS - Métodos públicos para interacción con la API
  // =============================================================================

  /**
   * Realiza una petición GET optimizada con reactividad
   * @param endpoint - Endpoint de la API
   * @param options - Opciones de la petición
   * @returns Observable con los datos
   */
  get<T>(endpoint: string, options: RequestOptions = {}): Observable<ApiResponse<T>> {
    const cacheKey = `GET:${endpoint}:${JSON.stringify(options.params || {})}`;
    
    // Verificar caché si está habilitado
    if (this.config.enableCache) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return of(cachedData as ApiResponse<T>);
      }
    }

    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' }).pipe(
      tap(response => {
        if (this.config.enableCache && response.success) {
          this.cache.set(cacheKey, response, this.config.cacheTimeout);
        }
      }),
      shareReplay(1) // Compartir la respuesta con múltiples suscriptores
    );
  }

  /**
   * Realiza una petición POST con reactividad
   * @param endpoint - Endpoint de la API
   * @param data - Datos a enviar
   * @param options - Opciones de la petición
   * @returns Observable con la respuesta
   */
  post<T>(endpoint: string, data: any, options: RequestOptions = {}): Observable<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data
    }).pipe(
      tap(() => this.invalidateCache()), // Invalidar caché después de POST
      shareReplay(1)
    );
  }

  /**
   * Realiza una petición PUT con reactividad
   * @param endpoint - Endpoint de la API
   * @param data - Datos a actualizar
   * @param options - Opciones de la petición
   * @returns Observable con la respuesta
   */
  put<T>(endpoint: string, data: any, options: RequestOptions = {}): Observable<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data
    }).pipe(
      tap(() => this.invalidateCache()),
      shareReplay(1)
    );
  }

  /**
   * Realiza una petición DELETE con reactividad
   * @param endpoint - Endpoint de la API
   * @param options - Opciones de la petición
   * @returns Observable con la respuesta
   */
  delete<T>(endpoint: string, options: RequestOptions = {}): Observable<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'DELETE'
    }).pipe(
      tap(() => this.invalidateCache()),
      shareReplay(1)
    );
  }

  // =============================================================================
  // REACTIVE DATA METHODS - Métodos para gestión reactiva de datos
  // =============================================================================

  /**
   * Obtiene el stream de datos reactivo
   * @returns Observable con los datos actuales
   */
  getDataStream$(): Observable<any> {
    return this.dataStream$.asObservable();
  }

  /**
   * Actualiza el stream de datos y notifica a todos los suscriptores
   * @param data - Nuevos datos
   */
  updateData(data: any): void {
    this.dataStream$.next(data);
  }

  /**
   * Obtiene el stream de estado de conexión
   * @returns Observable con el estado de conexión
   */
  getConnectionStatus$(): Observable<'connected' | 'disconnected' | 'error'> {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Obtiene el stream de errores
   * @returns Observable con los errores
   */
  getErrorStream$(): Observable<ApiError> {
    return this.errorStream$.asObservable();
  }

  /**
   * Obtiene el stream de estado de carga
   * @returns Observable con el estado de carga
   */
  getLoadingStream$(): Observable<boolean> {
    return this.loadingStream$.asObservable();
  }

  // =============================================================================
  // CACHE MANAGEMENT - Gestión optimizada de caché
  // =============================================================================

  /**
   * Invalida todo el caché
   */
  invalidateCache(): void {
    this.cache.clear();
  }

  /**
   * Invalida un endpoint específico del caché
   * @param endpoint - Endpoint a invalidar
   */
  invalidateEndpoint(endpoint: string): void {
    const keysToDelete: string[] = [];
    // Implementar lógica para encontrar y eliminar claves relacionadas
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // =============================================================================
  // PRIVATE METHODS - Métodos privados para lógica interna
  // =============================================================================

  /**
   * Realiza la petición HTTP con optimizaciones
   * @param endpoint - Endpoint de la API
   * @param options - Opciones de la petición
   * @returns Observable con la respuesta
   */
  private makeRequest<T>(endpoint: string, options: RequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options.params);
    const requestOptions = this.buildRequestOptions(options);

    this.loadingStream$.next(true);

    return new Observable<ApiResponse<T>>(observer => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);

      fetch(url, {
        ...requestOptions,
        signal: controller.signal
      })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        const apiResponse: ApiResponse<T> = {
          data,
          success: true,
          timestamp: Date.now()
        };
        
        this.loadingStream$.next(false);
        observer.next(apiResponse);
        observer.complete();
      })
      .catch(error => {
        clearTimeout(timeoutId);
        this.loadingStream$.next(false);
        
        const apiError: ApiError = {
          code: 'REQUEST_ERROR',
          message: error.message,
          timestamp: Date.now()
        };
        
        this.errorStream$.next(apiError);
        observer.error(apiError);
      });
    }).pipe(
      retry(options.retry !== false ? this.config.retryAttempts : 0),
      catchError(error => {
        this.connectionStatus$.next('error');
        throw error;
      })
    );
  }

  /**
   * Construye la URL completa con parámetros
   * @param endpoint - Endpoint base
   * @param params - Parámetros de query
   * @returns URL completa
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.config.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  /**
   * Construye las opciones de la petición
   * @param options - Opciones personalizadas
   * @returns Opciones completas de la petición
   */
  private buildRequestOptions(options: RequestOptions): RequestInit {
    return {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    };
  }

  /**
   * Verifica el estado de la conexión
   * @returns Observable con el resultado de la verificación
   */
  private checkConnection(): Observable<boolean> {
    return this.get<{ status: string }>('/health').pipe(
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  /**
   * Limpia el caché expirado
   */
  private cleanupExpiredCache(): void {
    // La limpieza se maneja automáticamente en el método get del caché
  }

  // =============================================================================
  // CLEANUP - Limpieza de recursos para evitar memory leaks
  // =============================================================================

  /**
   * Destruye el servicio y limpia todos los recursos
   * IMPORTANTE: Llamar este método cuando se desmonte el componente
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cache.clear();
    this.dataStream$.complete();
    this.connectionStatus$.complete();
    this.errorStream$.complete();
    this.loadingStream$.complete();
  }
}

// =============================================================================
// EXPORT - Exportación del servicio singleton
// =============================================================================

export const apiService = ApiService.getInstance(); 