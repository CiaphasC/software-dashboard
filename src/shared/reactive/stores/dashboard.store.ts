import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError, tap, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { DashboardMetrics } from '@/shared/types/common.types';
import { dashboardApi } from '@/shared/services';

// Types
export interface DashboardState {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface DashboardFilters {
  dateRange: { start: Date; end: Date };
  department: string | null;
  status: string | null;
}

// Initial State
const initialState: DashboardState = {
  metrics: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const initialFilters: DashboardFilters = {
  dateRange: {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  },
  department: null,
  status: null,
};

// Subjects (State Management)
export const dashboardState$ = new BehaviorSubject<DashboardState>(initialState);
export const dashboardFilters$ = new BehaviorSubject<DashboardFilters>(initialFilters);
export const refreshTrigger$ = new BehaviorSubject<number>(0);

// Actions
export const dashboardActions = {
  // Load metrics
  loadMetrics: () => {
    dashboardState$.next({ ...dashboardState$.value, loading: true, error: null });
    refreshTrigger$.next(Date.now());
  },

  // Set filters
  setFilters: (filters: Partial<DashboardFilters>) => {
    const currentFilters = dashboardFilters$.value;
    dashboardFilters$.next({ ...currentFilters, ...filters });
  },

  // Reset filters
  resetFilters: () => {
    dashboardFilters$.next(initialFilters);
  },

  // Clear error
  clearError: () => {
    dashboardState$.next({ ...dashboardState$.value, error: null });
  },

  // Manual refresh
  refresh: () => {
    refreshTrigger$.next(Date.now());
  },
};

// Computed Observables
export const dashboardMetrics$ = dashboardState$.pipe(
  map(state => state.metrics),
  distinctUntilChanged(),
  shareReplay(1)
);

export const dashboardLoading$ = dashboardState$.pipe(
  map(state => state.loading),
  distinctUntilChanged(),
  shareReplay(1)
);

export const dashboardError$ = dashboardState$.pipe(
  map(state => state.error),
  distinctUntilChanged(),
  shareReplay(1)
);

export const dashboardLastUpdated$ = dashboardState$.pipe(
  map(state => state.lastUpdated),
  distinctUntilChanged(),
  shareReplay(1)
);

// Filtered metrics based on current filters
export const filteredMetrics$ = combineLatest([
  dashboardMetrics$,
  dashboardFilters$
]).pipe(
  map(([metrics, filters]) => {
    if (!metrics) return null;
    
    // Apply filters logic here
    return {
      ...metrics,
      // Filter incidents by date range
      incidents: metrics.incidents?.filter(incident => {
        const incidentDate = new Date(incident.createdAt);
        return incidentDate >= filters.dateRange.start && 
               incidentDate <= filters.dateRange.end;
      }),
      // Filter by department
      ...(filters.department && {
        incidents: metrics.incidents?.filter(incident => 
          incident.department === filters.department
        )
      }),
      // Filter by status
      ...(filters.status && {
        incidents: metrics.incidents?.filter(incident => 
          incident.status === filters.status
        )
      })
    };
  }),
  shareReplay(1)
);

// Real-time metrics updates
export const realTimeMetrics$ = refreshTrigger$.pipe(
  switchMap(() => 
    dashboardApi.getDashboardMetrics().pipe(
      tap(metrics => {
        dashboardState$.next({
          metrics,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      }),
      catchError(error => {
        dashboardState$.next({
          ...dashboardState$.value,
          loading: false,
          error: error.message || 'Error al cargar métricas'
        });
        return of(null);
      })
    )
  ),
  shareReplay(1)
);

// Auto-refresh every 30 seconds
export const autoRefresh$ = new Observable<number>(subscriber => {
  const interval = setInterval(() => {
    subscriber.next(Date.now());
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}).pipe(
  tap(() => dashboardActions.loadMetrics()),
  shareReplay(1)
);

// Combined dashboard stream
export const dashboard$ = combineLatest([
  dashboardState$,
  dashboardFilters$,
  realTimeMetrics$,
  autoRefresh$
]).pipe(
  map(([state, filters]) => ({
    ...state,
    filters,
    hasData: !!state.metrics,
    isStale: state.lastUpdated ? 
      (Date.now() - state.lastUpdated.getTime()) > 60000 : true // 1 minute
  })),
  shareReplay(1)
);

// Utility functions
export const getDashboardValue = (): DashboardState => dashboardState$.value;
export const getDashboardFilters = (): DashboardFilters => dashboardFilters$.value;

// Cleanup function
export const cleanupDashboard = () => {
  dashboardState$.complete();
  dashboardFilters$.complete();
  refreshTrigger$.complete();
}; 