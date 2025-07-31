import { Observable, of, throwError } from 'rxjs';
import { catchError, retry, tap, map } from 'rxjs/operators';

// Error handling operators for RxJS
export class ErrorOperators {
  // Handle errors gracefully with fallback value
  static handleError<T>(fallbackValue: T) {
    return (source: Observable<T>) => {
      return source.pipe(
        catchError((error) => {
          console.error('Error occurred:', error);
          return of(fallbackValue);
        })
      );
    };
  }

  // Retry with custom error handling
  static retryWithError(maxRetries: number = 3, errorHandler?: (error: any) => void) {
    return (source: Observable<any>) => {
      return source.pipe(
        retry(maxRetries),
        catchError((error) => {
          if (errorHandler) {
            errorHandler(error);
          }
          return throwError(() => error);
        })
      );
    };
  }

  // Log errors without breaking the stream
  static logError(message: string = 'Error occurred') {
    return (source: Observable<any>) => {
      return source.pipe(
        catchError((error) => {
          console.error(`${message}:`, error);
          return of(null);
        })
      );
    };
  }

  // Transform error to user-friendly message
  static transformError<T>(errorTransformer: (error: any) => string) {
    return (source: Observable<T>) => {
      return source.pipe(
        catchError((error) => {
          const userMessage = errorTransformer(error);
          return throwError(() => new Error(userMessage));
        })
      );
    };
  }
}

// Export individual operators
export const handleError = ErrorOperators.handleError;
export const retryWithError = ErrorOperators.retryWithError;
export const logError = ErrorOperators.logError;
export const transformError = ErrorOperators.transformError; 