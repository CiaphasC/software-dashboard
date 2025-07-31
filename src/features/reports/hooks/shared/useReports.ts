// =============================================================================
// USE REPORTS HOOK - Hook personalizado para gestión de reportes
// Implementa el patrón Custom Hook y principios de React
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { incidentsApi } from '@/shared/services';
import { requirementsApi } from '@/shared/services';
import { dashboardApi } from '@/shared/services';
import { Incident, Requirement, DashboardMetrics } from '@/shared/types/common.types';

interface ReportData {
  incidents: Incident[];
  requirements: Requirement[];
  metrics: DashboardMetrics;
}

export const useReports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);

      // Inicializar datos si es necesario
      if (typeof incidentsApi.initializeIncidents === 'function') {
        incidentsApi.initializeIncidents();
      }
      if (typeof requirementsApi.initializeRequirements === 'function') {
        requirementsApi.initializeRequirements();
      }

      // Obtener datos de todas las APIs
      const [incidents, requirements, metrics] = await Promise.all([
        incidentsApi.getIncidents(),
        requirementsApi.getRequirements(),
        dashboardApi.getDashboardMetrics()
      ]);

      setReportData({
        incidents,
        requirements,
        metrics
      });
    } catch (err) {
      setError('Error al cargar los datos del reporte');
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchReportData();
  }, [fetchReportData]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  return {
    reportData,
    loading,
    error,
    refreshData
  };
}; 