// Tipos específicos para el feature de activities
export interface RecentActivity {
  id: string;
  type: 'incident' | 'requirement';
  action: 'created' | 'updated' | 'resolved' | 'closed';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  itemId: string;
}

export interface ActivityFilters {
  type?: 'all' | 'incident' | 'requirement';
  action?: 'all' | 'created' | 'updated' | 'resolved' | 'closed';
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ActivityStreamConfig {
  maxActivities: number;
  cleanupDays: number;
  debounceTime: number;
}

export interface ActivityMetrics {
  totalActivities: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  mostActiveUser: string;
  averageActivitiesPerDay: number;
  activityTrend: { value: number; isPositive: boolean };
} 
