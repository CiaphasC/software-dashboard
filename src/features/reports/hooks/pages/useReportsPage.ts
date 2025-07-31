import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../shared/useReports';
import { reportService } from '@/features/reports/services/ReportService';
import { useReportConfig, ReportConfig } from '../components/useReportConfig';

interface UseReportsPageReturn {
  // Estados
  reportData: any;
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
}

export const useReportsPage = (): UseReportsPageReturn => {
  const navigate = useNavigate();
  const { reportData, loading, error } = useReports();
  const [generating, setGenerating] = useState(false);
  const { reportConfig, updateReportConfig, setReportConfig } = useReportConfig();

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
    navigateToDashboard
  };
}; 