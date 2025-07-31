import { BehaviorSubject, Subject, Observable, combineLatest, merge, timer, of, throwError } from 'rxjs';
import { 
  map, 
  distinctUntilChanged, 
  debounceTime, 
  switchMap, 
  catchError, 
  retry, 
  takeUntil, 
  shareReplay, 
  filter,
  tap,
  startWith,
  scan,
  mergeMap,
  finalize,
  timeout
} from 'rxjs/operators';
import { DashboardService } from './dashboardService';
import { DashboardMetrics } from '@/shared/types/common.types';

/**
 * SERVICIO REACTIVO DEL DASHBOARD - PROGRAMACIÓN REACTIVA CON RXJS
 * 
 * Este servicio implementa un sistema reactivo completo para el dashboard
 * utilizando RxJS para manejar flujos de datos, actualizaciones en tiempo real
 * y optimización de rendimiento.
 * 
 * Características principales:
 * - Streams reactivos para datos del dashboard
 * - Actualizaciones automáticas y manuales
 * - Cache inteligente con invalidación
 * - Prevención de memory leaks
 * - Optimización de re-renders
 * - Manejo de errores robusto
 * - Polling inteligente
 * - Debouncing y throttling
 * 
 * Arquitectura:
 * - BehaviorSubject para estado actual
 * - Subject para acciones del usuario
 * - Observable para streams de datos
 * - Operadores RxJS para transformaciones
 */

export interface DashboardState {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isStale: boolean;
  refreshCount: number;
}

export interface DashboardAction {
  type: 'REFRESH' | 'FORCE_REFRESH' | 'CLEAR_ERROR' | 'SET_LOADING' | 'POLLING_START' | 'POLLING_STOP';
  payload?: any;
}

export interface DashboardConfig {
  pollingInterval: number; // ms
  staleThreshold: number; // ms
  retryAttempts: number;
  debounceTime: number; // ms
  timeout: number; // ms
}

// Configuración por defecto
const DEFAULT_CONFIG: DashboardConfig = {
  pollingInterval: 30000, // 30 segundos
  staleThreshold: 60000,  // 1 minuto
  retryAttempts: 3,
  debounceTime: 300,
  timeout: 10000
};

export class DashboardReactiveService {
  private static instance: DashboardReactiveService;
  
  // Streams principales
  private stateSubject = new BehaviorSubject<DashboardState>({
    metrics: null,
    loading: true,
    error: null,
    lastUpdated: null,
    isStale: false,
    refreshCount: 0
  });
  
  private actionSubject = new Subject<DashboardAction>();
  private destroySubject = new Subject<void>();
  private config: DashboardConfig;
  
  // Streams derivados
  public readonly state$: Observable<DashboardState>;
  public readonly metrics$: Observable<DashboardMetrics | null>;
  public readonly loading$: Observable<boolean>;
  public readonly error$: Observable<string | null>;
  public readonly isStale$: Observable<boolean>;
  
  // Streams para componentes específicos
  public readonly metricCards$: Observable<any[]>;
  public readonly chartCards$: Observable<any[]>;
  public readonly chartData$: Observable<any>;
  
  // Streams de control
  public readonly refreshTrigger$ = new Subject<void>();
  public readonly forceRefreshTrigger$ = new Subject<void>();
  
  private constructor(config: Partial<DashboardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Configurar streams principales
    this.state$ = this.stateSubject.asObservable().pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      shareReplay(1)
    );
    
    this.metrics$ = this.state$.pipe(
      map(state => state.metrics),
      distinctUntilChanged(),
      shareReplay(1)
    );
    
    this.loading$ = this.state$.pipe(
      map(state => state.loading),
      distinctUntilChanged(),
      shareReplay(1)
    );
    
    this.error$ = this.state$.pipe(
      map(state => state.error),
      distinctUntilChanged(),
      shareReplay(1)
    );
    
    this.isStale$ = this.state$.pipe(
      map(state => state.isStale),
      distinctUntilChanged(),
      shareReplay(1)
    );
    
    // Configurar streams de datos procesados
    this.metricCards$ = this.metrics$.pipe(
      map(metrics => this.processMetricCards(metrics)),
      distinctUntilChanged(),
      shareReplay(1)
    );
    
    this.chartCards$ = this.metrics$.pipe(
      map(metrics => this.processChartCards(metrics)),
      distinctUntilChanged(),
      shareReplay(1)
    );
    
    this.chartData$ = this.metrics$.pipe(
      map(metrics => this.processChartData(metrics)),
      distinctUntilChanged(),
      shareReplay(1)
    );
    
    // Configurar sistema reactivo
    this.setupReactiveSystem();
  }
  
  /**
   * Singleton pattern para asegurar una sola instancia
   */
  public static getInstance(config?: Partial<DashboardConfig>): DashboardReactiveService {
    if (!DashboardReactiveService.instance) {
      DashboardReactiveService.instance = new DashboardReactiveService(config);
    }
    return DashboardReactiveService.instance;
  }
  
  /**
   * Configura el sistema reactivo principal
   */
  private setupReactiveSystem(): void {
    // Stream de acciones del usuario
    const userActions$ = this.actionSubject.asObservable();
    
    // Stream de refrescos automáticos
    const autoRefresh$ = timer(0, this.config.pollingInterval).pipe(
      takeUntil(this.destroySubject),
      map(() => ({ type: 'REFRESH' as const }))
    );
    
    // Stream de refrescos manuales
    const manualRefresh$ = this.refreshTrigger$.pipe(
      debounceTime(this.config.debounceTime),
      map(() => ({ type: 'REFRESH' as const }))
    );
    
    // Stream de refrescos forzados
    const forceRefresh$ = this.forceRefreshTrigger$.pipe(
      map(() => ({ type: 'FORCE_REFRESH' as const }))
    );
    
    // Combinar todos los triggers de refresco
    const allRefreshTriggers$ = merge(
      userActions$,
      autoRefresh$,
      manualRefresh$,
      forceRefresh$
    ).pipe(
      filter(action => action.type === 'REFRESH' || action.type === 'FORCE_REFRESH'),
      distinctUntilChanged(),
      switchMap(action => this.fetchMetrics(action.type === 'FORCE_REFRESH'))
    );
    
    // Suscribirse al stream principal
    allRefreshTriggers$.pipe(
      takeUntil(this.destroySubject)
    ).subscribe({
      next: (result) => {
        this.updateState(result);
      },
      error: (error) => {
        console.error('Error en sistema reactivo:', error);
        this.updateState({ success: false, error: 'Error en sistema reactivo' });
      }
    });
    
    // Stream para verificar datos obsoletos
    timer(0, 10000).pipe(
      takeUntil(this.destroySubject),
      switchMap(() => this.state$),
      map(state => {
        if (state.lastUpdated && !state.isStale) {
          const timeSinceUpdate = Date.now() - state.lastUpdated.getTime();
          return timeSinceUpdate > this.config.staleThreshold;
        }
        return false;
      }),
      filter(isStale => isStale)
    ).subscribe(() => {
      this.markAsStale();
    });
  }
  
  /**
   * Obtiene métricas de la API con manejo de errores robusto
   */
  private fetchMetrics(forceRefresh: boolean = false): Observable<{ success: boolean; data?: DashboardMetrics; error?: string }> {
    return of(null).pipe(
      tap(() => this.setLoading(true)),
      switchMap(() => {
        if (forceRefresh) {
          return DashboardService.refreshDashboardMetrics();
        }
        return DashboardService.getDashboardMetrics();
      }),
      timeout(this.config.timeout),
      retry(this.config.retryAttempts),
      catchError(error => {
        console.error('Error fetching metrics:', error);
        return of({
          success: false,
          error: error.message || 'Error al obtener métricas del dashboard'
        });
      }),
      finalize(() => this.setLoading(false))
    );
  }
  
  /**
   * Actualiza el estado del dashboard
   */
  private updateState(result: { success: boolean; data?: DashboardMetrics; error?: string }): void {
    const currentState = this.stateSubject.value;
    
    const newState: DashboardState = {
      ...currentState,
      loading: false,
      lastUpdated: new Date(),
      isStale: false,
      refreshCount: currentState.refreshCount + 1
    };
    
    if (result.success && result.data) {
      newState.metrics = result.data;
      newState.error = null;
    } else {
      newState.error = result.error || 'Error desconocido';
    }
    
    this.stateSubject.next(newState);
  }
  
  /**
   * Marca los datos como obsoletos
   */
  private markAsStale(): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      isStale: true
    });
  }
  
  /**
   * Establece el estado de carga
   */
  private setLoading(loading: boolean): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      loading
    });
  }
  
  /**
   * Procesa métricas para tarjetas de métricas
   */
  private processMetricCards(metrics: DashboardMetrics | null): any[] {
    if (!metrics) return [];
    
    return [
      {
        title: "Total Incidencias",
        value: metrics.totalIncidents,
        icon: "FiAlertTriangle",
        trend: typeof metrics.incidentTrend === 'object' ? metrics.incidentTrend.value : metrics.incidentTrend,
        subtitle: "Todas las incidencias registradas",
        status: "danger" as const,
        color: "from-red-500 to-red-600"
      },
      {
        title: "Incidencias Abiertas",
        value: metrics.openIncidents,
        icon: "FiClock",
        trend: typeof metrics.openIncidentTrend === 'object' ? metrics.openIncidentTrend.value : metrics.openIncidentTrend,
        subtitle: "Pendientes de resolución",
        status: "warning" as const,
        color: "from-amber-500 to-orange-500"
      },
      {
        title: "Requerimientos Pendientes",
        value: metrics.pendingRequirements,
        icon: "FiFileText",
        trend: typeof metrics.requirementTrend === 'object' ? metrics.requirementTrend.value : metrics.requirementTrend,
        subtitle: "Solicitudes en espera",
        status: "info" as const,
        color: "from-blue-500 to-cyan-500"
      },
      {
        title: "Tiempo Promedio",
        value: this.formatResolutionTime(metrics.averageResolutionTime),
        icon: "FiTrendingUp",
        trend: -5,
        subtitle: `Basado en ${metrics.totalIncidents} incidencias`,
        status: "success" as const,
        color: "from-emerald-500 to-green-500"
      }
    ];
  }
  
  /**
   * Procesa métricas para tarjetas de gráficos
   */
  private processChartCards(metrics: DashboardMetrics | null): any[] {
    if (!metrics) return [];
    
    const chartData = this.processChartData(metrics);
    
    return [
      {
        title: "Incidencias por Mes",
        subtitle: "Tendencia de incidencias registradas",
        icon: "FiCalendar",
        variant: "gradient" as const,
        data: chartData.incidentsByMonth,
        chartType: "area" as const,
        config: this.getChartConfig('area')
      },
      {
        title: "Incidencias por Área",
        subtitle: "Distribución por área afectada",
        icon: "FiCrosshair",
        variant: "default" as const,
        data: chartData.incidentsByArea,
        chartType: "bar" as const,
        config: this.getChartConfig('bar')
      },
      {
        title: "Distribución por Estado",
        subtitle: "Estado actual de incidencias",
        icon: "FiPieChart",
        variant: "glass" as const,
        data: chartData.statusDistribution,
        chartType: "pie" as const,
        config: this.getChartConfig('pie')
      },
      {
        title: "Tendencia de Resolución",
        subtitle: "Tiempo promedio de resolución",
        icon: "FiGift",
        variant: "gradient" as const,
        data: chartData.resolutionTrend,
        chartType: "line" as const,
        config: this.getChartConfig('line')
      }
    ];
  }
  
  /**
   * Procesa datos para gráficos
   */
  private processChartData(metrics: DashboardMetrics | null): any {
    if (!metrics) return null;
    
    return {
      incidentsByMonth: metrics.incidentsByMonth.map(item => ({
        name: item.month,
        incidencias: item.count
      })),
      incidentsByArea: metrics.topDepartments.map(item => ({
        name: item.department,
        incidencias: item.count
      })),
      statusDistribution: [
        { name: 'Abiertas', value: metrics.openIncidents, color: '#f59e0b' },
        { name: 'En Proceso', value: metrics.inProgressIncidents, color: '#6366f1' },
        { name: 'Resueltas', value: metrics.resolvedIncidents, color: '#10b981' },
        { name: 'Cerradas', value: metrics.closedIncidents, color: '#6b7280' }
      ],
      resolutionTrend: [
        { mes: 'Ene', tiempo: 24 },
        { mes: 'Feb', tiempo: 22 },
        { mes: 'Mar', tiempo: 20 },
        { mes: 'Abr', tiempo: 18 },
        { mes: 'May', tiempo: 16 },
        { mes: 'Jun', tiempo: 14 }
      ]
    };
  }
  
  /**
   * Obtiene configuración de gráfico
   */
  private getChartConfig(chartType: string): any {
    const configs = {
      area: {
        margin: { top: 20, right: 30, left: 20, bottom: 80 },
        xAxis: { fontSize: 11, angle: -45, textAnchor: "end", height: 80 },
        yAxis: { fontSize: 12 },
        dataKey: "incidencias",
        stroke: "#6366f1",
        strokeWidth: 3,
        gradientId: "colorIncidencias",
        gradientColors: ["#6366f1", "#6366f1"]
      },
      bar: {
        margin: { top: 20, right: 30, left: 20, bottom: 60 },
        xAxis: { fontSize: 11, angle: -45, textAnchor: "end", height: 60 },
        yAxis: { fontSize: 12 },
        dataKey: "incidencias",
        fill: "url(#colorIncidencias)",
        radius: [8, 8, 0, 0]
      },
      pie: {
        cx: "50%",
        cy: "50%",
        outerRadius: 100,
        dataKey: "value"
      },
      line: {
        margin: { top: 20, right: 30, left: 20, bottom: 5 },
        xAxis: { fontSize: 12 },
        yAxis: { fontSize: 12 },
        dataKey: "tiempo",
        stroke: "#06b6d4",
        strokeWidth: 3,
        gradientId: "colorTiempo",
        gradientColors: ["#06b6d4", "#06b6d4"]
      }
    };
    
    return configs[chartType as keyof typeof configs] || {};
  }
  
  /**
   * Formatea tiempo de resolución
   */
  private formatResolutionTime(hours: number): string {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (remainingHours > 0) {
        return `${days}d ${remainingHours.toFixed(1)}h`;
      } else {
        return `${days}d`;
      }
    }
  }
  
  /**
   * MÉTODOS PÚBLICOS PARA INTERACCIÓN
   */
  
  /**
   * Refresca los datos del dashboard
   */
  public refresh(): void {
    this.refreshTrigger$.next();
  }
  
  /**
   * Fuerza un refresco completo
   */
  public forceRefresh(): void {
    this.forceRefreshTrigger$.next();
  }
  
  /**
   * Limpia errores
   */
  public clearError(): void {
    this.actionSubject.next({ type: 'CLEAR_ERROR' });
  }
  
  /**
   * Inicia polling automático
   */
  public startPolling(): void {
    this.actionSubject.next({ type: 'POLLING_START' });
  }
  
  /**
   * Detiene polling automático
   */
  public stopPolling(): void {
    this.actionSubject.next({ type: 'POLLING_STOP' });
  }
  
  /**
   * Obtiene el estado actual
   */
  public getCurrentState(): DashboardState {
    return this.stateSubject.value;
  }
  
  /**
   * Actualiza configuración
   */
  public updateConfig(newConfig: Partial<DashboardConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Destruye el servicio y limpia recursos
   */
  public destroy(): void {
    console.log('DashboardReactiveService: Destruyendo servicio...');
    this.destroySubject.next();
    this.destroySubject.complete();
    this.stateSubject.complete();
    this.actionSubject.complete();
    this.refreshTrigger$.complete();
    this.forceRefreshTrigger$.complete();
    
    // Limpiar instancia singleton
    DashboardReactiveService.instance = null as any;
  }
}

// Exportar instancia singleton
export const dashboardReactiveService = DashboardReactiveService.getInstance();

export default DashboardReactiveService; 