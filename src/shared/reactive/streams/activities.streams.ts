import { Observable, interval, merge, of } from 'rxjs';
import { map, switchMap, catchError, retry, shareReplay, distinctUntilChanged } from 'rxjs/operators';

// Activities-specific streams
export class ActivitiesStreams {
  // Live activities feed
  static getLiveActivities$(): Observable<any[]> {
    return interval(5000).pipe( // Every 5 seconds
      map(() => {
        // Simulate live activities
        const activities = [
          { id: '1', title: 'Nueva incidencia reportada', type: 'incident', timestamp: new Date() },
          { id: '2', title: 'Requerimiento aprobado', type: 'requirement', timestamp: new Date() },
          { id: '3', title: 'Incidencia resuelta', type: 'incident', timestamp: new Date() }
        ];
        return activities;
      }),
      shareReplay(1)
    );
  }

  // Activity notifications
  static getActivityNotifications$(): Observable<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: Date;
  }[]> {
    return interval(8000).pipe( // Every 8 seconds
      map(() => {
        const notifications = [
          {
            id: Date.now().toString(),
            message: 'Nueva actividad detectada',
            type: 'info' as const,
            timestamp: new Date()
          }
        ];
        return notifications;
      }),
      shareReplay(1)
    );
  }
}

// Export individual streams
export const liveActivitiesStream$ = ActivitiesStreams.getLiveActivities$();
export const activityNotificationsStream$ = ActivitiesStreams.getActivityNotifications$(); 