import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError, tap, distinctUntilChanged, shareReplay } from 'rxjs/operators';

// Types
export interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentsState {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface IncidentsFilters {
  searchTerm: string;
  status: string;
  priority: string;
  department: string;
  currentPage: number;
}

// Initial State
const initialState: IncidentsState = {
  incidents: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const initialFilters: IncidentsFilters = {
  searchTerm: '',
  status: 'all',
  priority: 'all',
  department: 'all',
  currentPage: 1,
};

// Subjects
export const incidentsState$ = new BehaviorSubject<IncidentsState>(initialState);
export const incidentsFilters$ = new BehaviorSubject<IncidentsFilters>(initialFilters);
export const incidentsRefreshTrigger$ = new BehaviorSubject<number>(0);

// Actions
export const incidentsActions = {
  loadIncidents: () => {
    incidentsState$.next({ ...incidentsState$.value, loading: true, error: null });
    incidentsRefreshTrigger$.next(Date.now());
  },

  setFilters: (filters: Partial<IncidentsFilters>) => {
    const currentFilters = incidentsFilters$.value;
    incidentsFilters$.next({ ...currentFilters, ...filters });
  },

  resetFilters: () => {
    incidentsFilters$.next(initialFilters);
  },

  clearError: () => {
    incidentsState$.next({ ...incidentsState$.value, error: null });
  },

  refresh: () => {
    incidentsRefreshTrigger$.next(Date.now());
  },
};

// Computed Observables
export const incidents$ = incidentsState$.pipe(
  map(state => state.incidents),
  distinctUntilChanged(),
  shareReplay(1)
);

export const incidentsLoading$ = incidentsState$.pipe(
  map(state => state.loading),
  distinctUntilChanged(),
  shareReplay(1)
);

export const incidentsError$ = incidentsState$.pipe(
  map(state => state.error),
  distinctUntilChanged(),
  shareReplay(1)
);

// Filtered incidents
export const filteredIncidents$ = combineLatest([
  incidents$,
  incidentsFilters$
]).pipe(
  map(([incidents, filters]) => {
    return incidents.filter(incident => {
      const matchesSearch = incident.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           incident.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || incident.status === filters.status;
      const matchesPriority = filters.priority === 'all' || incident.priority === filters.priority;
      const matchesDepartment = filters.department === 'all' || incident.department === filters.department;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
    });
  }),
  shareReplay(1)
);

// Utility functions
export const getIncidentsValue = (): IncidentsState => incidentsState$.value;
export const getIncidentsFilters = (): IncidentsFilters => incidentsFilters$.value;

// Cleanup function
export const cleanupIncidents = () => {
  incidentsState$.complete();
  incidentsFilters$.complete();
  incidentsRefreshTrigger$.complete();
}; 