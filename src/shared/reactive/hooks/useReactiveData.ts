import { useState, useEffect } from 'react';
import { Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { useReactive } from '../core/ReactiveProvider';

// Hook para usar observables directamente
export function useObservable<T>(observable: Observable<T>): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    const subscription = observable
      .pipe(distinctUntilChanged(), shareReplay(1))
      .subscribe(setValue);

    return () => subscription.unsubscribe();
  }, [observable]);

  return value;
}

// Hook para usar datos reactivos
export function useReactiveData<T>(
  apiCall: () => Promise<T>,
  options: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    realTime?: boolean;
    initialValue?: T;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  } = {}
) {
  const {
    createDataStream,
    createRealTimeStream,
    globalState$,
    showNotification
  } = useReactive();

  const [data, setData] = useState<T | undefined>(options.initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Subscribe to global state
  const globalState = useObservable(globalState$);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Create stream based on options
    const stream$ = options.realTime 
      ? createRealTimeStream(apiCall, options.refreshInterval)
      : createDataStream(apiCall, options.refreshInterval);

    const subscription = stream$.subscribe({
      next: (value) => {
        setData(value);
        setLoading(false);
        setError(null);
        options.onSuccess?.(value);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
        options.onError?.(err);
        showNotification('error', `Error: ${err.message}`);
      }
    });

    return () => subscription.unsubscribe();
  }, [apiCall, options.realTime, options.refreshInterval, createDataStream, createRealTimeStream, showNotification]);

  return {
    data,
    loading: loading || globalState?.isLoading || false,
    error: error || globalState?.error,
    lastUpdated: globalState?.lastUpdated,
    isConnected: globalState?.isConnected || false,
  };
}

// Hook para múltiples streams
export function useMultipleStreams<T extends Record<string, Observable<any>>>(
  streams: T
): { [K in keyof T]: T[K] extends Observable<infer U> ? U | undefined : never } {
  const result: any = {};
  
  Object.keys(streams).forEach(key => {
    const observable = streams[key];
    result[key] = useObservable(observable);
  });

  return result;
}

// Hook para estado reactivo local
export function useReactiveState<T>(initialValue: T) {
  const { createDataStream } = useReactive();
  const [state, setState] = useState<T>(initialValue);

  const updateState = (newState: T | ((prev: T) => T)) => {
    setState(newState);
  };

  return [state, updateState] as const;
} 