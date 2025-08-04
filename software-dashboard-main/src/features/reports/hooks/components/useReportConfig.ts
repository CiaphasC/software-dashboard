import { useState, useCallback } from 'react';

export interface ReportConfig {
  title: string;
  dateRange: { start: Date; end: Date };
  type: 'incidents' | 'requirements' | 'performance' | 'comprehensive';
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeTables: boolean;
  includeSummary: boolean;
}

interface UseReportConfigReturn {
  reportConfig: ReportConfig;
  updateReportConfig: (updates: Partial<ReportConfig>) => void;
  setReportConfig: (config: ReportConfig) => void;
  resetConfig: () => void;
}

export const useReportConfig = (): UseReportConfigReturn => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: 'Reporte de Sistema',
    dateRange: { 
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
      end: new Date() 
    },
    type: 'comprehensive',
    format: 'pdf',
    includeCharts: true,
    includeTables: true,
    includeSummary: true
  });

  // Función para actualizar parcialmente la configuración
  const updateReportConfig = useCallback((updates: Partial<ReportConfig>) => {
    setReportConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Función para resetear la configuración a valores por defecto
  const resetConfig = useCallback(() => {
    setReportConfig({
      title: 'Reporte de Sistema',
      dateRange: { 
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
        end: new Date() 
      },
      type: 'comprehensive',
      format: 'pdf',
      includeCharts: true,
      includeTables: true,
      includeSummary: true
    });
  }, []);

  return {
    reportConfig,
    updateReportConfig,
    setReportConfig,
    resetConfig
  };
}; 