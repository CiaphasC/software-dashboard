import { Observable, interval, merge, of } from 'rxjs';
import { map, switchMap, catchError, retry, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { dashboardApi } from '@/shared/services';

// Dashboard-specific streams
export class DashboardStreams {
  // Dashboard metrics stream
  static getDashboardMetrics$(): Observable<any> {
    return interval(30000).pipe( // Every 30 seconds
      switchMap(() => 
        dashboardApi.getDashboardMetrics().pipe(
          catchError(error => {
            console.error('Dashboard metrics error:', error);
            return of(null);
          })
        )
      ),
      retry(3),
      shareReplay(1)
    );
  }

  // Recent activities stream
  static getRecentActivities$(): Observable<any[]> {
    return interval(10000).pipe( // Every 10 seconds
      switchMap(() => 
        dashboardApi.getRecentActivities().pipe(
          catchError(error => {
            console.error('Recent activities error:', error);
            return of([]);
          })
        )
      ),
      distinctUntilChanged((prev, curr) => 
        JSON.stringify(prev) === JSON.stringify(curr)
      ),
      shareReplay(1)
    );
  }

  // System status stream
  static getSystemStatus$(): Observable<{
    status: 'online' | 'offline' | 'maintenance';
    lastCheck: Date;
    responseTime: number;
  }> {
    return interval(5000).pipe( // Every 5 seconds
      map(() => ({
        status: 'online' as const,
        lastCheck: new Date(),
        responseTime: Math.random() * 100 + 50 // 50-150ms
      })),
      shareReplay(1)
    );
  }
}

// Export individual streams
export const dashboardMetricsStream$ = DashboardStreams.getDashboardMetrics$();
export const recentActivitiesStream$ = DashboardStreams.getRecentActivities$();
export const systemStatusStream$ = DashboardStreams.getSystemStatus$(); 