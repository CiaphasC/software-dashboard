import { useState, useEffect, useMemo, useCallback } from 'react';
import { logger } from '@/shared/utils/logger'
import { useIncidentsStore } from '@/shared/store/incidentsStore';
import { useRequirementsStore } from '@/shared/store/requirementsStore';
import { dataService } from '@/shared/services/supabase';
import { Incident, Requirement, DashboardMetrics } from '@/shared/types/common.types';

interface ReportData {
  incidents: Incident[];
  requirements: Requirement[];
  metrics: DashboardMetrics;
}

interface UseReportPreviewReturn {
  reportData: ReportData | null;
  isLoading: boolean;
  error: string | null;
  summaryStats: {
    totalIncidents: number;
    openIncidents: number;
    pendingRequirements: number;
  };
  recentIncidents: any[];
  recentRequirements: any[];
  refreshData: () => Promise<void>;
}

export const useReportPreview = (): UseReportPreviewReturn => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Stores de Zustand (reemplazan el hook duplicado)
  const { loadIncidents } = useIncidentsStore();
  const { loadRequirements } = useRequirementsStore();

  // Función para cargar datos del reporte
  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLocalError(null);

      // Cargar datos de incidencias y requerimientos usando los stores
      await Promise.all([
        loadIncidents(),
        loadRequirements()
      ]);

      // Obtener métricas del dashboard
      const metrics = await dataService.getDashboardMetrics();

      // Obtener los datos actualizados de los stores después de cargarlos
      const currentIncidents = useIncidentsStore.getState().incidents;
      const currentRequirements = useRequirementsStore.getState().requirements;

      setReportData({
        incidents: currentIncidents,
        requirements: currentRequirements,
        metrics
      });
    } catch (err) {
      setError('Error al cargar los datos del reporte');
      logger.error('useReportPreview: Error fetching report data', err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [loadIncidents, loadRequirements]);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Procesar datos del reporte
  const processedReportData = useMemo(() => {
    if (!reportData) return null;

    try {
      return {
        incidents: reportData.incidents || [],
        requirements: reportData.requirements || [],
        metrics: reportData.metrics || {
          totalIncidents: 0,
          openIncidents: 0,
          pendingRequirements: 0
        }
      };
    } catch (err) {
      setLocalError('Error al procesar los datos del reporte');
      return null;
    }
  }, [reportData]);

  // Estadísticas resumidas
  const summaryStats = useMemo(() => {
    if (!processedReportData) {
      return {
        totalIncidents: 0,
        openIncidents: 0,
        pendingRequirements: 0
      };
    }

    return {
      totalIncidents: processedReportData.metrics.totalIncidents || 0,
      openIncidents: processedReportData.metrics.openIncidents || 0,
      pendingRequirements: processedReportData.metrics.pendingRequirements || 0
    };
  }, [processedReportData]);

  // Incidencias recientes (últimas 5)
  const recentIncidents = useMemo(() => {
    if (!processedReportData?.incidents) return [];
    
    return processedReportData.incidents
      .slice(0, 5)
      .map(incident => ({
        ...incident,
        statusText: getStatusText(incident.status),
        statusColor: getStatusColor(incident.status)
      }));
  }, [processedReportData?.incidents]);

  // Requerimientos recientes (últimos 5)
  const recentRequirements = useMemo(() => {
    if (!processedReportData?.requirements) return [];
    
    return processedReportData.requirements
      .slice(0, 5)
      .map(req => ({
        ...req,
        statusText: getRequirementStatusText(req.status),
        statusColor: getRequirementStatusColor(req.status)
      }));
  }, [processedReportData?.requirements]);

  // Función para refrescar datos
  const refreshData = useCallback(async () => {
    setLocalError(null);
    await fetchReportData();
  }, [fetchReportData]);

  // Limpiar errores locales cuando cambian los datos
  useEffect(() => {
    if (reportData && localError) {
      setLocalError(null);
    }
  }, [reportData, localError]);

  return {
    reportData: processedReportData,
    isLoading,
    error: error || localError,
    summaryStats,
    recentIncidents,
    recentRequirements,
    refreshData
  };
};

// Funciones auxiliares para mapear estados
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'open': 'Abierto',
    'in_progress': 'En Proceso',
    'resolved': 'Resuelto',
    'closed': 'Cerrado'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'resolved': 'bg-green-100 text-green-700',
    'in_progress': 'bg-blue-100 text-blue-700',
    'open': 'bg-orange-100 text-orange-700',
    'closed': 'bg-gray-100 text-gray-700'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-700';
};

const getRequirementStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'in_progress': 'En Proceso',
    'delivered': 'Entregado',
    'closed': 'Cerrado'
  };
  return statusMap[status] || status;
};

const getRequirementStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'delivered': 'bg-green-100 text-green-700',
    'in_progress': 'bg-blue-100 text-blue-700',
    'pending': 'bg-yellow-100 text-yellow-700',
    'closed': 'bg-gray-100 text-gray-700'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-700';
}; 