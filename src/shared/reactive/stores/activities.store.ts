import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError, tap, distinctUntilChanged, shareReplay } from 'rxjs/operators';

// Types
export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'incident' | 'requirement';
  action: 'created' | 'updated' | 'resolved' | 'closed';
  user: string;
  timestamp: Date;
}

export interface ActivitiesState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface ActivitiesFilters {
  searchTerm: string;
  filterType: string;
  filterAction: string;
  currentPage: number;
}

// Initial State
const initialState: ActivitiesState = {
  activities: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const initialFilters: ActivitiesFilters = {
  searchTerm: '',
  filterType: 'all',
  filterAction: 'all',
  currentPage: 1,
};

// Subjects
export const activitiesState$ = new BehaviorSubject<ActivitiesState>(initialState);
export const activitiesFilters$ = new BehaviorSubject<ActivitiesFilters>(initialFilters);
export const activitiesRefreshTrigger$ = new BehaviorSubject<number>(0);

// Actions
export const activitiesActions = {
  loadActivities: () => {
    activitiesState$.next({ ...activitiesState$.value, loading: true, error: null });
    activitiesRefreshTrigger$.next(Date.now());
  },

  setFilters: (filters: Partial<ActivitiesFilters>) => {
    const currentFilters = activitiesFilters$.value;
    activitiesFilters$.next({ ...currentFilters, ...filters });
  },

  resetFilters: () => {
    activitiesFilters$.next(initialFilters);
  },

  clearError: () => {
    activitiesState$.next({ ...activitiesState$.value, error: null });
  },

  refresh: () => {
    activitiesRefreshTrigger$.next(Date.now());
  },
};

// Computed Observables
export const activities$ = activitiesState$.pipe(
  map(state => state.activities),
  distinctUntilChanged(),
  shareReplay(1)
);

export const activitiesLoading$ = activitiesState$.pipe(
  map(state => state.loading),
  distinctUntilChanged(),
  shareReplay(1)
);

export const activitiesError$ = activitiesState$.pipe(
  map(state => state.error),
  distinctUntilChanged(),
  shareReplay(1)
);

// Filtered activities
export const filteredActivities$ = combineLatest([
  activities$,
  activitiesFilters$
]).pipe(
  map(([activities, filters]) => {
    return activities.filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           activity.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           activity.user.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesType = filters.filterType === 'all' || activity.type === filters.filterType;
      const matchesAction = filters.filterAction === 'all' || activity.action === filters.filterAction;
      
      return matchesSearch && matchesType && matchesAction;
    });
  }),
  shareReplay(1)
);

// Utility functions
export const getActivitiesValue = (): ActivitiesState => activitiesState$.value;
export const getActivitiesFilters = (): ActivitiesFilters => activitiesFilters$.value;

// Cleanup function
export const cleanupActivities = () => {
  activitiesState$.complete();
  activitiesFilters$.complete();
  activitiesRefreshTrigger$.complete();
}; 