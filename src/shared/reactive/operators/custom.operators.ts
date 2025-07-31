import { Observable, of } from 'rxjs';
import { map, catchError, retry, delay, tap } from 'rxjs/operators';

// Custom operators for RxJS
export class CustomOperators {
  // Retry with exponential backoff
  static retryWithBackoff(maxRetries: number = 3, delayMs: number = 1000) {
    return (source: Observable<any>) => {
      return source.pipe(
        retry({
          count: maxRetries,
          delay: (error, retryCount) => {
            const delayTime = delayMs * Math.pow(2, retryCount - 1);
            return of(error).pipe(delay(delayTime));
          }
        })
      );
    };
  }

  // Log operator for debugging
  static log(message: string) {
    return (source: Observable<any>) => {
      return source.pipe(
        tap({
          next: (value) => console.log(`${message} - Next:`, value),
          error: (error) => console.error(`${message} - Error:`, error),
          complete: () => console.log(`${message} - Complete`)
        })
      );
    };
  }

  // Safe map operator that handles errors
  static safeMap<T, R>(project: (value: T) => R, defaultValue: R) {
    return (source: Observable<T>) => {
      return source.pipe(
        map(project),
        catchError(() => of(defaultValue))
      );
    };
  }

  // Debounce operator for search inputs
  static debounceTime(delayMs: number) {
    return (source: Observable<any>) => {
      return source.pipe(
        delay(delayMs)
      );
    };
  }
}

// Export individual operators
export const retryWithBackoff = CustomOperators.retryWithBackoff;
export const log = CustomOperators.log;
export const safeMap = CustomOperators.safeMap;
export const debounceTime = CustomOperators.debounceTime; 