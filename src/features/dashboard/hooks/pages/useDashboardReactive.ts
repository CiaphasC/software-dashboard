import { useState, useEffect, useRef } from 'react';
import { log } from '@/shared/utils/logger';
import { Subscription } from 'rxjs';
import { dashboardReactiveService, DashboardState, DashboardConfig } from '@/features/dashboard/services/dashboardReactiveService';

/**
 * HOOK REACTIVO DEL DASHBOARD - CONEXIÓN REACT-RXJS
 * 
 * Este hook conecta React con el sistema reactivo RxJS del dashboard,
 * proporcionando una interfaz simple para componentes React mientras
 * aprovecha toda la potencia de la programación reactiva.
 * 
 * Características:
 * - Suscripción automática a streams RxJS
 * - Cleanup automático de suscripciones
 * - Estado sincronizado con el servicio reactivo
 * - Métodos para interactuar con el sistema
 * - Prevención de memory leaks
 * 
 * Uso: Este hook debe ser usado en componentes que necesiten
 * datos reactivos del dashboard.
 */

export interface UseDashboardReactiveReturn {
  // Estados del dashboard
  state: DashboardState;
  metrics: DashboardState['metrics'];
  loading: DashboardState['loading'];
  error: DashboardState['error'];
  isStale: DashboardState['isStale'];
  lastUpdated: DashboardState['lastUpdated'];
  refreshCount: DashboardState['refreshCount'];
  
  // Datos procesados
  metricCards: any[];
  chartCards: any[];
  chartData: any;
  
  // Métodos de control
  refresh: () => void;
  forceRefresh: () => void;
  clearError: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  updateConfig: (config: Partial<DashboardConfig>) => void;
  
  // Utilidades
  hasData: boolean;
  canRefresh: boolean;
}

/**
 * Hook principal para el dashboard reactivo
 * 
 * @param config - Configuración opcional del servicio
 * @returns {UseDashboardReactiveReturn} Estado y métodos del dashboard
 * 
 * @example
 * ```tsx
 * const {
 *   state,
 *   metrics,
 *   loading,
 *   error,
 *   metricCards,
 *   chartCards,
 *   refresh,
 *   forceRefresh
 * } = useDashboardReactive();
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * 
 * return (
 *   <div>
 *     <button onClick={refresh}>Refrescar</button>
 *     <button onClick={forceRefresh}>Forzar Refresco</button>
 *     <MetricCards data={metricCards} />
 *     <ChartCards data={chartCards} />
 *   </div>
 * );
 * ```
 */
export const useDashboardReactive = (config?: Partial<DashboardConfig>): UseDashboardReactiveReturn => {
  // Estados locales
  const [state, setState] = useState<DashboardState>(dashboardReactiveService.getCurrentState());
  const [metricCards, setMetricCards] = useState<any[]>([]);
  const [chartCards, setChartCards] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  
  // Ref para manejar suscripciones
  const subscriptionsRef = useRef<Subscription[]>([]);
  
  // Actualizar configuración si se proporciona
  useEffect(() => {
    if (config) {
      dashboardReactiveService.updateConfig(config);
    }
  }, [config]);
  
  // Suscripciones a streams reactivos
  useEffect(() => {
    log('useDashboardReactive: Configurando suscripciones...');
    
    const subscriptions: Subscription[] = [];
    
    // Suscripción al estado principal
    const stateSubscription = dashboardReactiveService.state$.subscribe({
      next: (newState) => {
        log('useDashboardReactive: Estado actualizado:', newState);
        setState(newState);
      },
      error: (error) => {
        console.error('useDashboardReactive: Error en estado:', error);
      }
    });
    subscriptions.push(stateSubscription);
    
    // Suscripción a métricas procesadas
    const metricCardsSubscription = dashboardReactiveService.metricCards$.subscribe({
      next: (cards) => {
        log('useDashboardReactive: Métricas actualizadas:', cards.length);
        setMetricCards(cards);
      },
      error: (error) => {
        console.error('useDashboardReactive: Error en métricas:', error);
      }
    });
    subscriptions.push(metricCardsSubscription);
    
    // Suscripción a gráficos procesados
    const chartCardsSubscription = dashboardReactiveService.chartCards$.subscribe({
      next: (cards) => {
        log('useDashboardReactive: Gráficos actualizados:', cards.length);
        setChartCards(cards);
      },
      error: (error) => {
        console.error('useDashboardReactive: Error en gráficos:', error);
      }
    });
    subscriptions.push(chartCardsSubscription);
    
    // Suscripción a datos de gráficos
    const chartDataSubscription = dashboardReactiveService.chartData$.subscribe({
      next: (data) => {
        log('useDashboardReactive: Datos de gráficos actualizados');
        setChartData(data);
      },
      error: (error) => {
        console.error('useDashboardReactive: Error en datos de gráficos:', error);
      }
    });
    subscriptions.push(chartDataSubscription);
    
    // Guardar referencias para cleanup
    subscriptionsRef.current = subscriptions;
    
    // Cleanup al desmontar
    return () => {
      log('useDashboardReactive: Limpiando suscripciones...');
      subscriptions.forEach(sub => {
        if (!sub.closed) {
          sub.unsubscribe();
        }
      });
      subscriptionsRef.current = [];
    };
  }, []);
  
  // Métodos de control
  const refresh = () => {
    log('useDashboardReactive: Refrescando...');
    dashboardReactiveService.refresh();
  };
  
  const forceRefresh = () => {
    log('useDashboardReactive: Forzando refresco...');
    dashboardReactiveService.forceRefresh();
  };
  
  const clearError = () => {
    log('useDashboardReactive: Limpiando error...');
    dashboardReactiveService.clearError();
  };
  
  const startPolling = () => {
    log('useDashboardReactive: Iniciando polling...');
    dashboardReactiveService.startPolling();
  };
  
  const stopPolling = () => {
    log('useDashboardReactive: Deteniendo polling...');
    dashboardReactiveService.stopPolling();
  };
  
  const updateConfig = (newConfig: Partial<DashboardConfig>) => {
    log('useDashboardReactive: Actualizando configuración...', newConfig);
    dashboardReactiveService.updateConfig(newConfig);
  };
  
  // Computed values
  const hasData = Boolean(state.metrics);
  const canRefresh = !state.loading;
  
  // Destructuring del estado para facilitar el uso
  const { metrics, loading, error, isStale, lastUpdated, refreshCount } = state;
  
  return {
    // Estados
    state,
    metrics,
    loading,
    error,
    isStale,
    lastUpdated,
    refreshCount,
    
    // Datos procesados
    metricCards,
    chartCards,
    chartData,
    
    // Métodos de control
    refresh,
    forceRefresh,
    clearError,
    startPolling,
    stopPolling,
    updateConfig,
    
    // Utilidades
    hasData,
    canRefresh
  };
};

export default useDashboardReactive; 