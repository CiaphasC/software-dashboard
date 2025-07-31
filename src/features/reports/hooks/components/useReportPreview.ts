import { useState, useEffect, useMemo } from 'react';
import { useReports } from '../shared/useReports';

interface ReportData {
  incidents: any[];
  requirements: any[];
  metrics: any;
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
  refreshData: () => void;
}

export const useReportPreview = (): UseReportPreviewReturn => {
  const { reportData: reportsData, loading: isLoading, error, refreshData: refetch } = useReports();
  const [localError, setLocalError] = useState<string | null>(null);

  // Procesar datos del reporte
  const reportData = useMemo(() => {
    if (!reportsData) return null;

    try {
      return {
        incidents: reportsData.incidents || [],
        requirements: reportsData.requirements || [],
        metrics: reportsData.metrics || {
          totalIncidents: 0,
          openIncidents: 0,
          pendingRequirements: 0
        }
      };
    } catch (err) {
      setLocalError('Error al procesar los datos del reporte');
      return null;
    }
  }, [reportsData]);

  // Estadísticas resumidas
  const summaryStats = useMemo(() => {
    if (!reportData) {
      return {
        totalIncidents: 0,
        openIncidents: 0,
        pendingRequirements: 0
      };
    }

    return {
      totalIncidents: reportData.metrics.totalIncidents || 0,
      openIncidents: reportData.metrics.openIncidents || 0,
      pendingRequirements: reportData.metrics.pendingRequirements || 0
    };
  }, [reportData]);

  // Incidencias recientes (últimas 5)
  const recentIncidents = useMemo(() => {
    if (!reportData?.incidents) return [];
    
    return reportData.incidents
      .slice(0, 5)
      .map(incident => ({
        ...incident,
        statusText: getStatusText(incident.status),
        statusColor: getStatusColor(incident.status)
      }));
  }, [reportData?.incidents]);

  // Requerimientos recientes (últimos 5)
  const recentRequirements = useMemo(() => {
    if (!reportData?.requirements) return [];
    
    return reportData.requirements
      .slice(0, 5)
      .map(req => ({
        ...req,
        statusText: getRequirementStatusText(req.status),
        statusColor: getRequirementStatusColor(req.status)
      }));
  }, [reportData?.requirements]);

  // Función para refrescar datos
  const refreshData = () => {
    setLocalError(null);
    refetch();
  };

  // Limpiar errores locales cuando cambian los datos
  useEffect(() => {
    if (reportsData && localError) {
      setLocalError(null);
    }
  }, [reportsData, localError]);

  return {
    reportData,
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