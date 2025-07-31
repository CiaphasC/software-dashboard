import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { BehaviorSubject, Subject, Observable, interval, merge } from 'rxjs';
import { switchMap, catchError, retry, shareReplay } from 'rxjs/operators';

// Types
export interface ReactiveState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isConnected: boolean;
}

export interface ReactiveConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  enableRealTime: boolean;
  enableErrorHandling: boolean;
}

// Default configuration
const defaultConfig: ReactiveConfig = {
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  enableRealTime: true,
  enableErrorHandling: true,
};

// Reactive Context
interface ReactiveContextType {
  // Global state
  globalState$: BehaviorSubject<ReactiveState>;
  globalConfig$: BehaviorSubject<ReactiveConfig>;
  
  // Shared subjects
  refreshTrigger$: Subject<void>;
  errorSubject$: Subject<string>;
  notificationSubject$: Subject<{ type: 'success' | 'error' | 'warning' | 'info'; message: string }>;
  
  // Actions
  refresh: () => void;
  setConfig: (config: Partial<ReactiveConfig>) => void;
  clearError: () => void;
  showNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  
  // Utility functions
  createDataStream: <T>(apiCall: () => Promise<T>, intervalMs?: number) => Observable<T>;
  createRealTimeStream: <T>(apiCall: () => Promise<T>, intervalMs?: number) => Observable<T>;
}

const ReactiveContext = createContext<ReactiveContextType | null>(null);

// Provider Component
interface ReactiveProviderProps {
  children: ReactNode;
  config?: Partial<ReactiveConfig>;
}

export const ReactiveProvider: React.FC<ReactiveProviderProps> = ({ 
  children, 
  config = {} 
}) => {
  // Initialize subjects
  const globalState$ = new BehaviorSubject<ReactiveState>({
    isLoading: false,
    error: null,
    lastUpdated: null,
    isConnected: true,
  });

  const globalConfig$ = new BehaviorSubject<ReactiveConfig>({
    ...defaultConfig,
    ...config,
  });

  const refreshTrigger$ = new Subject<void>();
  const errorSubject$ = new Subject<string>();
  const notificationSubject$ = new Subject<{ type: 'success' | 'error' | 'warning' | 'info'; message: string }>();

  // Actions
  const refresh = () => {
    refreshTrigger$.next();
  };

  const setConfig = (newConfig: Partial<ReactiveConfig>) => {
    const currentConfig = globalConfig$.value;
    globalConfig$.next({ ...currentConfig, ...newConfig });
  };

  const clearError = () => {
    globalState$.next({ ...globalState$.value, error: null });
  };

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    notificationSubject$.next({ type, message });
  };

  // Utility functions
  const createDataStream = function<T>(apiCall: () => Promise<T>, intervalMs?: number): Observable<T> {
    const config = globalConfig$.value;
    const refreshInterval = intervalMs || config.refreshInterval;

    if (config.autoRefresh) {
      return merge(
        refreshTrigger$,
        interval(refreshInterval)
      ).pipe(
        switchMap(() => 
          apiCall().then(data => {
            globalState$.next({ 
              ...globalState$.value, 
              isLoading: false, 
              lastUpdated: new Date(),
              error: null 
            });
            return data;
          }).catch(error => {
            globalState$.next({ 
              ...globalState$.value, 
              isLoading: false, 
              error: error.message 
            });
            throw error;
          })
        ),
        retry(3),
        shareReplay(1)
      );
    } else {
      return refreshTrigger$.pipe(
        switchMap(() => apiCall()),
        retry(3),
        shareReplay(1)
      );
    }
  };

  const createRealTimeStream = function<T>(apiCall: () => Promise<T>, intervalMs: number = 5000): Observable<T> {
    const config = globalConfig$.value;
    
    if (!config.enableRealTime) {
      return createDataStream(apiCall);
    }

    return interval(intervalMs).pipe(
      switchMap(() => apiCall()),
      catchError(error => {
        globalState$.next({ 
          ...globalState$.value, 
          error: error.message 
        });
        return [];
      }),
      shareReplay(1)
    );
  };

  // Error handling
  useEffect(() => {
    const errorSubscription = errorSubject$.subscribe(error => {
      globalState$.next({ ...globalState$.value, error });
    });

    return () => errorSubscription.unsubscribe();
  }, []);

  const contextValue: ReactiveContextType = {
    globalState$,
    globalConfig$,
    refreshTrigger$,
    errorSubject$,
    notificationSubject$,
    refresh,
    setConfig,
    clearError,
    showNotification,
    createDataStream,
    createRealTimeStream,
  };

  return (
    <ReactiveContext.Provider value={contextValue}>
      {children}
    </ReactiveContext.Provider>
  );
};

// Hook to use reactive context
export const useReactive = () => {
  const context = useContext(ReactiveContext);
  if (!context) {
    throw new Error('useReactive must be used within a ReactiveProvider');
  }
  return context;
}; 