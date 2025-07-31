import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError, tap, distinctUntilChanged, shareReplay } from 'rxjs/operators';

// Types
export interface Requirement {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  requestedBy: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequirementsState {
  requirements: Requirement[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface RequirementsFilters {
  searchTerm: string;
  status: string;
  priority: string;
  department: string;
  currentPage: number;
}

// Initial State
const initialState: RequirementsState = {
  requirements: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const initialFilters: RequirementsFilters = {
  searchTerm: '',
  status: 'all',
  priority: 'all',
  department: 'all',
  currentPage: 1,
};

// Subjects
export const requirementsState$ = new BehaviorSubject<RequirementsState>(initialState);
export const requirementsFilters$ = new BehaviorSubject<RequirementsFilters>(initialFilters);
export const requirementsRefreshTrigger$ = new BehaviorSubject<number>(0);

// Actions
export const requirementsActions = {
  loadRequirements: () => {
    requirementsState$.next({ ...requirementsState$.value, loading: true, error: null });
    requirementsRefreshTrigger$.next(Date.now());
  },

  setFilters: (filters: Partial<RequirementsFilters>) => {
    const currentFilters = requirementsFilters$.value;
    requirementsFilters$.next({ ...currentFilters, ...filters });
  },

  resetFilters: () => {
    requirementsFilters$.next(initialFilters);
  },

  clearError: () => {
    requirementsState$.next({ ...requirementsState$.value, error: null });
  },

  refresh: () => {
    requirementsRefreshTrigger$.next(Date.now());
  },
};

// Computed Observables
export const requirements$ = requirementsState$.pipe(
  map(state => state.requirements),
  distinctUntilChanged(),
  shareReplay(1)
);

export const requirementsLoading$ = requirementsState$.pipe(
  map(state => state.loading),
  distinctUntilChanged(),
  shareReplay(1)
);

export const requirementsError$ = requirementsState$.pipe(
  map(state => state.error),
  distinctUntilChanged(),
  shareReplay(1)
);

// Filtered requirements
export const filteredRequirements$ = combineLatest([
  requirements$,
  requirementsFilters$
]).pipe(
  map(([requirements, filters]) => {
    return requirements.filter(requirement => {
      const matchesSearch = requirement.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           requirement.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || requirement.status === filters.status;
      const matchesPriority = filters.priority === 'all' || requirement.priority === filters.priority;
      const matchesDepartment = filters.department === 'all' || requirement.department === filters.department;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
    });
  }),
  shareReplay(1)
);

// Utility functions
export const getRequirementsValue = (): RequirementsState => requirementsState$.value;
export const getRequirementsFilters = (): RequirementsFilters => requirementsFilters$.value;

// Cleanup function
export const cleanupRequirements = () => {
  requirementsState$.complete();
  requirementsFilters$.complete();
  requirementsRefreshTrigger$.complete();
}; 