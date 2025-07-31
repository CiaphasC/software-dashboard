import { Subject, BehaviorSubject } from 'rxjs';

// Shared subjects for inter-component communication
export class SharedSubjects {
  // Global notification subject
  static notification$ = new Subject<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>();

  // Global loading subject
  static loading$ = new BehaviorSubject<boolean>(false);

  // Global error subject
  static error$ = new Subject<string>();

  // User action subject
  static userAction$ = new Subject<{
    action: string;
    data?: any;
    timestamp: Date;
  }>();

  // Theme change subject
  static themeChange$ = new Subject<'light' | 'dark'>();

  // Language change subject
  static languageChange$ = new Subject<string>();

  // Refresh data subject
  static refreshData$ = new Subject<string>();

  // Modal control subject
  static modalControl$ = new Subject<{
    action: 'open' | 'close';
    modalId: string;
    data?: any;
  }>();

  // Sidebar toggle subject
  static sidebarToggle$ = new Subject<boolean>();

  // Search subject
  static search$ = new Subject<{
    query: string;
    filters?: any;
  }>();

  // Filter change subject
  static filterChange$ = new Subject<{
    type: string;
    filters: any;
  }>();

  // Pagination subject
  static paginationChange$ = new Subject<{
    page: number;
    pageSize: number;
  }>();

  // Sort subject
  static sortChange$ = new Subject<{
    field: string;
    direction: 'asc' | 'desc';
  }>();
}

// Export individual subjects
export const notification$ = SharedSubjects.notification$;
export const loading$ = SharedSubjects.loading$;
export const error$ = SharedSubjects.error$;
export const userAction$ = SharedSubjects.userAction$;
export const themeChange$ = SharedSubjects.themeChange$;
export const languageChange$ = SharedSubjects.languageChange$;
export const refreshData$ = SharedSubjects.refreshData$;
export const modalControl$ = SharedSubjects.modalControl$;
export const sidebarToggle$ = SharedSubjects.sidebarToggle$;
export const search$ = SharedSubjects.search$;
export const filterChange$ = SharedSubjects.filterChange$;
export const paginationChange$ = SharedSubjects.paginationChange$;
export const sortChange$ = SharedSubjects.sortChange$; 