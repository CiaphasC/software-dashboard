import { useState, useEffect } from 'react';
import { Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';

// Hook para queries reactivas
export function useReactiveQuery<T>(
  query$: Observable<T>,
  options: {
    initialValue?: T;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  } = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const subscription = query$.subscribe({
      next: (value) => {
        setData(value);
        setLoading(false);
        options.onSuccess?.(value);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
        options.onError?.(err);
      }
    });

    return () => subscription.unsubscribe();
  }, [query$, options.onSuccess, options.onError]);

  return { data, loading, error };
} 