import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, shareReplay, startWith } from 'rxjs/operators';

/**
 * HOOK OPTIMIZADO PARA OBSERVABLES
 * 
 * Este hook está optimizado para evitar bucles infinitos y mejorar la performance
 * mediante memoización y gestión inteligente de suscripciones.
 * 
 * CARACTERÍSTICAS:
 * - Memoización de observables para evitar recreaciones
 * - Gestión automática de suscripciones
 * - Prevención de bucles infinitos
 * - Optimización de re-renders
 */

// Hook para usar observables en React con optimizaciones
export function useObservable<T>(
  observable: Observable<T>,
  initialValue?: T
): T | undefined {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const subscriptionRef = useRef<Subscription>();
  const observableRef = useRef<Observable<T>>();

  // Memoizar el observable para evitar recreaciones
  const memoizedObservable = useMemo(() => {
    // Solo recrear si el observable realmente cambió
    if (observableRef.current !== observable) {
      observableRef.current = observable;
      return observable.pipe(
        distinctUntilChanged(),
        shareReplay(1)
      );
    }
    return observableRef.current;
  }, [observable]);

  useEffect(() => {
    // Limpiar suscripción anterior
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Crear nueva suscripción
    subscriptionRef.current = memoizedObservable.subscribe({
      next: (newValue) => {
        setValue(newValue);
      },
      error: (error) => {
        console.error('Error en observable:', error);
        setValue(initialValue);
      }
    });

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [memoizedObservable, initialValue]);

  return value;
}

/**
 * HOOK OPTIMIZADO PARA BEHAVIORSUBJECT
 * 
 * Versión optimizada para BehaviorSubject con gestión de estado bidireccional.
 */
export function useBehaviorSubject<T>(subject: BehaviorSubject<T>): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(subject.value);
  const subjectRef = useRef<BehaviorSubject<T>>();

  // Memoizar el subject para evitar recreaciones
  const memoizedSubject = useMemo(() => {
    if (subjectRef.current !== subject) {
      subjectRef.current = subject;
    }
    return subjectRef.current;
  }, [subject]);

  useEffect(() => {
    if (!memoizedSubject) return;

    const subscription = memoizedSubject
      .pipe(
        distinctUntilChanged(),
        shareReplay(1)
      )
      .subscribe({
        next: (newValue) => {
          setValue(newValue);
        },
        error: (error) => {
          console.error('Error en BehaviorSubject:', error);
        }
      });

    return () => subscription.unsubscribe();
  }, [memoizedSubject]);

  const setSubjectValue = useCallback((newValue: T) => {
    if (memoizedSubject) {
      memoizedSubject.next(newValue);
    }
  }, [memoizedSubject]);

  return [value, setSubjectValue];
}

/**
 * HOOK OPTIMIZADO PARA MÚLTIPLES OBSERVABLES
 * 
 * Versión optimizada que evita recreaciones innecesarias.
 */
export function useObservables<T extends Record<string, Observable<any>>>(
  observables: T
): { [K in keyof T]: T[K] extends Observable<infer U> ? U | undefined : never } {
  const result: any = {};
  
  // Memoizar las claves para evitar recreaciones
  const keys = useMemo(() => Object.keys(observables), [observables]);
  
  keys.forEach(key => {
    const observable = observables[key];
    result[key] = useObservable(observable);
  });

  return result;
}

/**
 * HOOK OPTIMIZADO PARA ESTADO REACTIVO CON ACCIONES
 * 
 * Versión simplificada y optimizada.
 */
export function useReactiveState<T, A>(
  state$: BehaviorSubject<T>,
  actions: A
): [T, A] {
  const [state] = useBehaviorSubject(state$);
  return [state, actions];
}

/**
 * HOOK OPTIMIZADO PARA EFECTOS REACTIVOS
 * 
 * Versión optimizada con gestión de dependencias mejorada.
 */
export function useReactiveEffect<T>(
  observable: Observable<T>,
  effect: (value: T) => void | (() => void),
  deps: React.DependencyList = []
) {
  const memoizedObservable = useMemo(() => 
    observable.pipe(distinctUntilChanged(), shareReplay(1)), 
    [observable]
  );

  const memoizedEffect = useCallback(effect, deps);

  useEffect(() => {
    const subscription = memoizedObservable.subscribe({
      next: (value) => {
        const cleanup = memoizedEffect(value);
        if (cleanup) {
          return cleanup;
        }
      },
      error: (error) => {
        console.error('Error en reactive effect:', error);
      }
    });

    return () => subscription.unsubscribe();
  }, [memoizedObservable, memoizedEffect]);
}

/**
 * HOOK OPTIMIZADO PARA QUERIES REACTIVAS
 * 
 * Versión optimizada con mejor gestión de estado.
 */
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

  const memoizedQuery$ = useMemo(() => 
    query$.pipe(
      distinctUntilChanged(),
      shareReplay(1),
      startWith(options.initialValue)
    ), 
    [query$, options.initialValue]
  );

  const memoizedOnSuccess = useCallback(options.onSuccess || (() => {}), [options.onSuccess]);
  const memoizedOnError = useCallback(options.onError || (() => {}), [options.onError]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const subscription = memoizedQuery$.subscribe({
      next: (value) => {
        setData(value);
        setLoading(false);
        memoizedOnSuccess(value);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
        memoizedOnError(err);
      }
    });

    return () => subscription.unsubscribe();
  }, [memoizedQuery$, memoizedOnSuccess, memoizedOnError]);

  return { data, loading, error };
}

/**
 * HOOK OPTIMIZADO PARA ESTADO LOCAL REACTIVO
 * 
 * Versión optimizada con mejor gestión de memoria.
 */
export function useLocalReactiveState<T>(initialValue: T) {
  const [state$, setState$] = useState(() => new BehaviorSubject<T>(initialValue));
  
  const setValue = useCallback((value: T) => {
    state$.next(value);
  }, [state$]);

  const getValue = useCallback(() => state$.value, [state$]);

  const value = useObservable(state$, initialValue);

  return {
    state$,
    value,
    setValue,
    getValue
  };
} 