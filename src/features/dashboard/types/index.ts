// Tipos específicos para el feature de dashboard
export interface DashboardMetrics {
  totalIncidents: number;
  openIncidents: number;
  inProgressIncidents: number;
  resolvedIncidents: number;
  closedIncidents: number;
  totalRequirements: number;
  pendingRequirements: number;
  deliveredRequirements: number;
  averageResolutionTime: number;
  incidentsByMonth: Array<{
    month: string;
    count: number;
  }>;
  requirementsByMonth: Array<{
    month: string;
    count: number;
  }>;
  topDepartments: Array<{
    department: string;
    count: number;
  }>;
  incidents: any[]; // Referencia a tipos de incidents
  requirements: any[]; // Referencia a tipos de requirements
  incidentTrend: { value: number; isPositive: boolean };
  openIncidentTrend: { value: number; isPositive: boolean };
  requirementTrend: { value: number; isPositive: boolean };
  resolutionTimeTrend: { value: number; isPositive: boolean };
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  className?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

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
