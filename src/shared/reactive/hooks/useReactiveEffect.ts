import { useEffect } from 'react';
import { Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';

// Hook para efectos reactivos
export function useReactiveEffect<T>(
  observable: Observable<T>,
  effect: (value: T) => void | (() => void),
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const subscription = observable
      .pipe(distinctUntilChanged(), shareReplay(1))
      .subscribe(effect);

    return () => subscription.unsubscribe();
  }, [observable, effect, ...deps]);
} 