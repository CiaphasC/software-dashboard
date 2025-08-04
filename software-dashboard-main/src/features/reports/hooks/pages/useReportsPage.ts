import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '@/features/reports/services/ReportService';
import { useReportConfig, ReportConfig } from '@/features/reports/hooks/components/useReportConfig';
import { useIncidentsStore } from '@/shared/store/incidentsStore';
import { useRequirementsStore } from '@/shared/store/requirementsStore';
import { dataService } from '@/shared/services/supabase';
import { Incident, Requirement, DashboardMetrics } from '@/shared/types/common.types';

interface ReportData {
  incidents: Incident[];
  requirements: Requirement[];
  metrics: DashboardMetrics;
}

interface UseReportsPageReturn {
  // Estados
  reportData: ReportData | null;
  loading: boolean;
  error: string | null;
  generating: boolean;
  reportConfig: ReportConfig;
  
  // Funciones
  setReportConfig: (config: ReportConfig) => void;
  updateReportConfig: (updates: Partial<ReportConfig>) => void;
  generatePDF: () => Promise<void>;
  generateExcel: () => Promise<void>;
  generateCSV: () => Promise<void>;
  generateReport: () => Promise<void>;
  navigateToDashboard: () => void;
  refreshData: () => Promise<void>;
}

export const useReportsPage = (): UseReportsPageReturn => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const { reportConfig, updateReportConfig, setReportConfig } = useReportConfig();

  // Stores de Zustand (reemplazan el hook duplicado)
  const { incidents, loadIncidents } = useIncidentsStore();
  const { requirements, loadRequirements } = useRequirementsStore();

  // Función para cargar datos del reporte
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  }, [loadIncidents, loadRequirements]);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Función para refrescar datos
  const refreshData = useCallback(async () => {
    await fetchReportData();
  }, [fetchReportData]);

  // Generar reporte PDF
  const generatePDF = useCallback(async () => {
    if (!reportData) return;
    
    setGenerating(true);
    try {
      await reportService.generatePDF(reportData, {
        title: reportConfig.title,
        dateRange: reportConfig.dateRange,
        includeSummary: reportConfig.includeSummary,
        includeTables: reportConfig.includeTables,
        includeCharts: reportConfig.includeCharts
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, [reportData, reportConfig]);

  // Generar reporte Excel
  const generateExcel = useCallback(async () => {
    if (!reportData) return;
    
    setGenerating(true);
    try {
      await reportService.generateExcel(reportData, {
        title: reportConfig.title,
        dateRange: reportConfig.dateRange,
        includeSummary: reportConfig.includeSummary,
        includeTables: reportConfig.includeTables,
        includeCharts: reportConfig.includeCharts
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, [reportData, reportConfig]);

  // Generar reporte CSV
  const generateCSV = useCallback(async () => {
    if (!reportData) return;
    
    setGenerating(true);
    try {
      await reportService.generateCSV(reportData, {
        title: reportConfig.title,
        dateRange: reportConfig.dateRange,
        includeSummary: reportConfig.includeSummary,
        includeTables: reportConfig.includeTables,
        includeCharts: reportConfig.includeCharts
      });
    } catch (error) {
      console.error('Error generating CSV:', error);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, [reportData, reportConfig]);

  // Generar reporte según el formato seleccionado
  const generateReport = useCallback(async () => {
    try {
      switch (reportConfig.format) {
        case 'pdf':
          await generatePDF();
          break;
        case 'excel':
          await generateExcel();
          break;
        case 'csv':
          await generateCSV();
          break;
        default:
          throw new Error(`Formato no soportado: ${reportConfig.format}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }, [reportConfig.format, generatePDF, generateExcel, generateCSV]);

  // Navegar al dashboard
  const navigateToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  return {
    // Estados
    reportData,
    loading,
    error,
    generating,
    reportConfig,
    
    // Funciones
    setReportConfig,
    updateReportConfig,
    generatePDF,
    generateExcel,
    generateCSV,
    generateReport,
    navigateToDashboard,
    refreshData
  };
}; 