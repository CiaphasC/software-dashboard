// Servicio específico para dashboard - Extraído del api.ts monolítico
import { DashboardMetrics } from '@/shared/types/common.types';
import { incidentsApi } from '../incidents/incidentsApi';
import { requirementsApi } from '../requirements/requirementsApi';
import { log } from '@/shared/utils/logger';

// Simulación de datos de dashboard
let dashboardData: DashboardMetrics | null = null;

// Función para generar datos de dashboard
const generateDashboardMetrics = async (): Promise<DashboardMetrics> => {
  // Obtener datos reales de las APIs
  const incidents = await incidentsApi.getIncidents();
  const requirements = await requirementsApi.getRequirements();
  
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const inProgressIncidents = incidents.filter(i => i.status === 'in_progress').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
  const closedIncidents = incidents.filter(i => i.status === 'closed').length;
  
  const totalRequirements = requirements.length;
  const pendingRequirements = requirements.filter(r => r.status === 'pending').length;
  const deliveredRequirements = requirements.filter(r => r.status === 'delivered').length;
  
  // Calcular tiempo promedio de resolución basado en datos mock
  // Usar un valor consistente basado en la distribución de incidencias
  const highPriorityIncidents = incidents.filter(i => i.priority === 'high' || i.priority === 'urgent').length;
  const mediumPriorityIncidents = incidents.filter(i => i.priority === 'medium').length;
  const lowPriorityIncidents = incidents.filter(i => i.priority === 'low').length;
  
  // Tiempos promedio por prioridad (valores mock consistentes)
  const timeByPriority = {
    high: 2.5,    // 2.5 horas para alta prioridad
    urgent: 1.8,  // 1.8 horas para urgente
    medium: 4.5,  // 4.5 horas para media prioridad
    low: 8.0      // 8.0 horas para baja prioridad
  };
  
  // Calcular tiempo promedio ponderado
  const totalWeightedTime = 
    (highPriorityIncidents * timeByPriority.high) + 
    (mediumPriorityIncidents * timeByPriority.medium) + 
    (lowPriorityIncidents * timeByPriority.low);
  
  const totalIncidentsWithPriority = highPriorityIncidents + mediumPriorityIncidents + lowPriorityIncidents;
  
  // Tiempo promedio final - con valor consistente basado en total de incidencias
  let averageResolutionTime = 4.5; // Valor por defecto
  
  if (totalIncidentsWithPriority > 0) {
    // Usar un cálculo más estable basado en la distribución
    const weightedAverage = totalWeightedTime / totalIncidentsWithPriority;
    
    // Ajustar ligeramente basado en el total de incidencias para simular consistencia
    const adjustment = Math.sin(totalIncidents * 0.1) * 0.5; // Variación pequeña y predecible
    averageResolutionTime = Math.max(2.0, Math.min(10.0, weightedAverage + adjustment));
  }
  
  // Debug: Mostrar información del cálculo
  log('🔍 Dashboard Metrics Debug (Mock Data):', {
    totalIncidents,
    highPriority: highPriorityIncidents,
    mediumPriority: mediumPriorityIncidents,
    lowPriority: lowPriorityIncidents,
    averageResolutionTime: averageResolutionTime.toFixed(2) + 'h',
    calculation: `${totalWeightedTime.toFixed(1)}h / ${totalIncidentsWithPriority} incidencias`
  });

  // Generar datos por mes
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const incidentsByMonth = months.map((month, index) => ({
    month,
    count: Math.floor(Math.random() * 20) + 5
  }));
  
  const requirementsByMonth = months.map((month, index) => ({
    month,
    count: Math.floor(Math.random() * 15) + 3
  }));

  // Top departamentos
  const departments = ['TI', 'Contabilidad', 'Ventas', 'RRHH', 'Administración'];
  const topDepartments = departments.map(dept => ({
    department: dept,
    count: Math.floor(Math.random() * 30) + 10
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // Calcular tendencias
  const incidentTrend = {
    value: Math.floor(Math.random() * 20) - 10, // -10 a +10
    isPositive: Math.random() > 0.5
  };
  
  const openIncidentTrend = {
    value: Math.floor(Math.random() * 15) - 7,
    isPositive: Math.random() > 0.6
  };
  
  const requirementTrend = {
    value: Math.floor(Math.random() * 25) - 12,
    isPositive: Math.random() > 0.5
  };
  
  const pendingRequirementTrend = {
    value: Math.floor(Math.random() * 18) - 9,
    isPositive: Math.random() > 0.7
  };

  return {
    totalIncidents,
    openIncidents,
    inProgressIncidents,
    resolvedIncidents,
    closedIncidents,
    totalRequirements,
    pendingRequirements,
    deliveredRequirements,
    averageResolutionTime,
    incidentsByMonth,
    requirementsByMonth,
    topDepartments,
    incidents: incidents.slice(0, 10), // Solo los 10 más recientes
    requirements: requirements.slice(0, 10),
    incidentTrend,
    openIncidentTrend,
    requirementTrend,
    pendingRequirementTrend
  };
};

export const dashboardApi = {
  // Obtener métricas del dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Inicializar datos
    incidentsApi.initializeIncidents();
    requirementsApi.initializeRequirements();
    
    if (!dashboardData) {
      dashboardData = await generateDashboardMetrics();
    }
    
    return dashboardData;
  },

  // Refrescar métricas del dashboard
  async refreshDashboardMetrics(): Promise<DashboardMetrics> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Regenerar datos para simular cambios
    dashboardData = await generateDashboardMetrics();
    
    return dashboardData;
  },

  // Obtener métricas en tiempo real (simulado)
  async getRealTimeMetrics(): Promise<Partial<DashboardMetrics>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!dashboardData) {
      dashboardData = await generateDashboardMetrics();
    }
    
    // Retornar solo métricas que cambian frecuentemente
    return {
      openIncidents: dashboardData.openIncidents + Math.floor(Math.random() * 3) - 1,
      inProgressIncidents: dashboardData.inProgressIncidents + Math.floor(Math.random() * 2) - 1,
      pendingRequirements: dashboardData.pendingRequirements + Math.floor(Math.random() * 2) - 1
    };
  },

  // Obtener estadísticas de rendimiento
  async getPerformanceStats(): Promise<{
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      uptime: 99.8 + Math.random() * 0.2,
      responseTime: 150 + Math.random() * 100,
      errorRate: Math.random() * 0.5,
      activeUsers: 25 + Math.floor(Math.random() * 15)
    };
  }
}; 