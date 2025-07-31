/**
 * SERVICIO DEL DASHBOARD - CONEXIÓN CON LA API
 * 
 * Este archivo contiene toda la lógica de conexión con la API del dashboard.
 * Es el punto central para todas las operaciones de datos del dashboard.
 * 
 * Responsabilidades:
 * - Obtener métricas del dashboard desde la API
 * - Refrescar datos en tiempo real
 * - Manejar filtros y consultas específicas
 * - Exportar datos en diferentes formatos
 * - Validar la frescura de los datos
 * 
 * Uso: Este servicio es utilizado por el hook useDashboardMetrics
 * y puede ser usado directamente en cualquier componente del dashboard.
 */

import { dashboardApi } from '@/shared/services';
import { DashboardMetrics } from '@/shared/types/common.types';
import { log } from '@/shared/utils/logger';

/**
 * Interfaz para las respuestas del servicio del dashboard
 * Define la estructura estándar de respuesta para todas las operaciones
 */
export interface DashboardServiceResponse {
  success: boolean;
  data?: DashboardMetrics;
  error?: string;
}

/**
 * Clase principal del servicio del dashboard
 * Contiene todos los métodos para interactuar con la API del dashboard
 */
export class DashboardService {
  /**
   * Obtiene las métricas del dashboard desde la API
   * 
   * Conecta con: dashboardApi.getDashboardMetrics()
   * Retorna: Métricas completas del dashboard (incidentes, resolución, etc.)
   */
  static async getDashboardMetrics(): Promise<DashboardServiceResponse> {
    try {
      log('DashboardService: Obteniendo métricas del dashboard...');
      const data = await dashboardApi.getDashboardMetrics();
      log('DashboardService: Métricas obtenidas exitosamente:', data);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('DashboardService: Error al obtener métricas:', error);
      return {
        success: false,
        error: 'Error al cargar las métricas del dashboard'
      };
    }
  }

  /**
   * Refresca las métricas del dashboard desde la API
   * 
   * Conecta con: dashboardApi.getDashboardMetrics()
   * Uso: Para actualizar datos en tiempo real o después de cambios
   */
  static async refreshDashboardMetrics(): Promise<DashboardServiceResponse> {
    try {
      log('DashboardService: Refrescando métricas del dashboard...');
      const data = await dashboardApi.getDashboardMetrics();
      log('DashboardService: Métricas refrescadas exitosamente:', data);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('DashboardService: Error al refrescar métricas:', error);
      return {
        success: false,
        error: 'Error al refrescar las métricas del dashboard'
      };
    }
  }

  /**
   * Obtiene métricas específicas por filtro desde la API
   * 
   * Conecta con: dashboardApi.getDashboardMetrics() (futuro: endpoint con filtros)
   * Parámetros: Filtros de fecha, departamento, estado
   * TODO: Implementar endpoint específico para filtros cuando esté disponible
   */
  static async getMetricsByFilter(filter: {
    dateRange?: { start: string; end: string };
    department?: string;
    status?: string;
  }): Promise<DashboardServiceResponse> {
    try {
      log('DashboardService: Obteniendo métricas con filtro:', filter);
      
      // Aquí se implementaría la lógica de filtrado
      // Por ahora usamos la API base
      const data = await dashboardApi.getDashboardMetrics();
      
      // TODO: Implementar filtrado real cuando la API lo soporte
      log('DashboardService: Métricas filtradas obtenidas:', data);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('DashboardService: Error al obtener métricas filtradas:', error);
      return {
        success: false,
        error: 'Error al obtener métricas filtradas'
      };
    }
  }

  /**
   * Obtiene estadísticas en tiempo real desde la API
   * 
   * Conecta con: dashboardApi.getDashboardMetrics() (futuro: endpoint de tiempo real)
   * Uso: Para actualizaciones automáticas y datos live
   * TODO: Implementar WebSocket o polling cuando esté disponible
   */
  static async getRealTimeStats(): Promise<DashboardServiceResponse> {
    try {
      log('DashboardService: Obteniendo estadísticas en tiempo real...');
      
      // TODO: Implementar endpoint de tiempo real cuando esté disponible
      const data = await dashboardApi.getDashboardMetrics();
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('DashboardService: Error al obtener estadísticas en tiempo real:', error);
      return {
        success: false,
        error: 'Error al obtener estadísticas en tiempo real'
      };
    }
  }

  /**
   * Exporta datos del dashboard desde la API
   * 
   * Conecta con: dashboardApi.getDashboardMetrics() (futuro: endpoint de exportación)
   * Formatos: CSV, Excel, PDF
   * TODO: Implementar endpoint de exportación cuando esté disponible
   */
  static async exportDashboardData(format: 'csv' | 'excel' | 'pdf'): Promise<DashboardServiceResponse> {
    try {
      log(`DashboardService: Exportando datos en formato ${format}...`);
      
      // TODO: Implementar exportación cuando esté disponible
      const data = await dashboardApi.getDashboardMetrics();
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('DashboardService: Error al exportar datos:', error);
      return {
        success: false,
        error: `Error al exportar datos en formato ${format}`
      };
    }
  }

  /**
   * Valida si los datos del dashboard están actualizados
   * 
   * Conecta con: API para verificar timestamp de última actualización
   * Uso: Para determinar si los datos necesitan refrescarse
   * TODO: Implementar endpoint de validación cuando esté disponible
   */
  static async validateDataFreshness(): Promise<{ isFresh: boolean; lastUpdated?: string }> {
    try {
      log('DashboardService: Validando frescura de datos...');
      
      // TODO: Implementar validación de frescura cuando esté disponible
      return {
        isFresh: true,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('DashboardService: Error al validar frescura de datos:', error);
      return {
        isFresh: false
      };
    }
  }
}

export default DashboardService; 