import { Observable, interval, merge, of } from 'rxjs';
import { map, switchMap, catchError, retry, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { dashboardApi } from '@/shared/services';

// Real-time streams for dashboard
export class RealTimeStreams {
  // WebSocket connection (simulated for now)
  private static wsConnection$ = new Observable<string>(subscriber => {
    // Simulate WebSocket connection
    const interval$ = interval(5000); // Every 5 seconds
    
    const subscription = interval$.subscribe(() => {
      subscriber.next('connected');
    });

    return () => subscription.unsubscribe();
  }).pipe(
    shareReplay(1)
  );

  // Real-time metrics updates
  static getRealTimeMetrics$(): Observable<any> {
    return this.wsConnection$.pipe(
      switchMap(() => 
        dashboardApi.getDashboardMetrics().pipe(
          catchError(error => {
            console.error('Real-time metrics error:', error);
            return of(null);
          })
        )
      ),
      retry(3),
      shareReplay(1)
    );
  }

  // Live activity feed
  static getLiveActivityFeed$(): Observable<any[]> {
    return interval(3000).pipe( // Every 3 seconds
      switchMap(() => 
        dashboardApi.getRecentActivities().pipe(
          catchError(error => {
            console.error('Live activity feed error:', error);
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

  // System health monitoring
  static getSystemHealth$(): Observable<{
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    memory: number;
    cpu: number;
  }> {
    return interval(10000).pipe( // Every 10 seconds
      map(() => ({
        status: Math.random() > 0.8 ? 'warning' : 'healthy' as const,
        uptime: Date.now() - new Date('2025-01-01').getTime(),
        memory: Math.random() * 100,
        cpu: Math.random() * 100
      })),
      shareReplay(1)
    );
  }

  // Incident alerts
  static getIncidentAlerts$(): Observable<{
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
  }[]> {
    return interval(15000).pipe( // Every 15 seconds
      switchMap(() => 
        dashboardApi.getIncidents().pipe(
          map(incidents => 
            incidents
              .filter(incident => incident.status === 'open')
              .map(incident => ({
                id: incident.id,
                title: incident.title,
                severity: incident.priority as 'low' | 'medium' | 'high' | 'critical',
                timestamp: new Date(incident.createdAt)
              }))
              .slice(0, 5) // Only latest 5
          ),
          catchError(error => {
            console.error('Incident alerts error:', error);
            return of([]);
          })
        )
      ),
      shareReplay(1)
    );
  }

  // Performance metrics
  static getPerformanceMetrics$(): Observable<{
    responseTime: number;
    throughput: number;
    errorRate: number;
    activeUsers: number;
  }> {
    return interval(2000).pipe( // Every 2 seconds
      map(() => ({
        responseTime: Math.random() * 1000 + 100, // 100-1100ms
        throughput: Math.random() * 1000 + 500, // 500-1500 req/s
        errorRate: Math.random() * 5, // 0-5%
        activeUsers: Math.floor(Math.random() * 100) + 10 // 10-110 users
      })),
      shareReplay(1)
    );
  }

  // Combined real-time dashboard stream
  static getCombinedRealTimeStream$(): Observable<{
    metrics: any;
    activities: any[];
    health: any;
    alerts: any[];
    performance: any;
  }> {
    return merge(
      this.getRealTimeMetrics$(),
      this.getLiveActivityFeed$(),
      this.getSystemHealth$(),
      this.getIncidentAlerts$(),
      this.getPerformanceMetrics$()
    ).pipe(
      map(([metrics, activities, health, alerts, performance]) => ({
        metrics,
        activities,
        health,
        alerts,
        performance
      })),
      shareReplay(1)
    );
  }
}

// Export individual streams
export const realTimeMetrics$ = RealTimeStreams.getRealTimeMetrics$();
export const liveActivityFeed$ = RealTimeStreams.getLiveActivityFeed$();
export const systemHealth$ = RealTimeStreams.getSystemHealth$();
export const incidentAlerts$ = RealTimeStreams.getIncidentAlerts$();
export const performanceMetrics$ = RealTimeStreams.getPerformanceMetrics$();
export const combinedRealTimeStream$ = RealTimeStreams.getCombinedRealTimeStream$(); 