// =============================================================================
// REPORT SERVICE - Servicio unificado para generación de reportes
// =============================================================================

// Generadores se cargan bajo demanda para reducir el peso inicial del bundle
import { saveAs } from 'file-saver';
import { logger } from '@/shared/utils/logger'

interface ReportData {
  incidents: any[];
  requirements: any[];
  metrics: any;
}

interface ReportConfig {
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  includeSummary: boolean;
  includeTables: boolean;
  includeCharts: boolean;
}

export type ReportFormat = 'pdf' | 'excel' | 'csv';

export class ReportService {
  private pdfGenerator: any | null = null;
  private excelGenerator: any | null = null;
  private csvGenerator: any | null = null;

  private async getPdfGenerator() {
    if (!this.pdfGenerator) {
      const { PDFReportGenerator } = await import('./generators/PDFReportGenerator');
      this.pdfGenerator = new PDFReportGenerator();
    }
    return this.pdfGenerator;
  }

  private async getExcelGenerator() {
    if (!this.excelGenerator) {
      const { ExcelReportGenerator } = await import('./generators/ExcelReportGenerator');
      this.excelGenerator = new ExcelReportGenerator();
    }
    return this.excelGenerator;
  }

  private async getCsvGenerator() {
    if (!this.csvGenerator) {
      const { CSVReportGenerator } = await import('./generators/CSVReportGenerator');
      this.csvGenerator = new CSVReportGenerator();
    }
    return this.csvGenerator;
  }

  /**
   * Genera un reporte en el formato especificado
   */
  async generateReport(data: ReportData, config: ReportConfig, format: ReportFormat): Promise<void> {
    try {
      let blob: Blob;
      let filename: string;

      switch (format) {
        case 'pdf':
          blob = await (await this.getPdfGenerator()).generate(data, config);
          filename = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        
        case 'excel':
          blob = await (await this.getExcelGenerator()).generate(data, config);
          filename = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        
        case 'csv':
          blob = await (await this.getCsvGenerator()).generate(data, config);
          filename = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        
        default:
          throw new Error(`Formato no soportado: ${format}`);
      }

      // Descargar el archivo
      saveAs(blob, filename);
    } catch (error) {
      logger.error('ReportService: Error generando reporte', error as Error);
      throw new Error(`Error al generar reporte ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera un reporte PDF
   */
  async generatePDF(data: ReportData, config: ReportConfig): Promise<void> {
    return this.generateReport(data, config, 'pdf');
  }

  /**
   * Genera un reporte Excel
   */
  async generateExcel(data: ReportData, config: ReportConfig): Promise<void> {
    return this.generateReport(data, config, 'excel');
  }

  /**
   * Genera un reporte CSV
   */
  async generateCSV(data: ReportData, config: ReportConfig): Promise<void> {
    return this.generateReport(data, config, 'csv');
  }

  /**
   * Obtiene la configuración por defecto para un reporte
   */
  getDefaultConfig(): ReportConfig {
    return {
      title: 'Reporte del Sistema',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
        end: new Date()
      },
      includeSummary: true,
      includeTables: true,
      includeCharts: true
    };
  }

  /**
   * Valida si la configuración del reporte es válida
   */
  validateConfig(config: ReportConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.title || config.title.trim().length === 0) {
      errors.push('El título del reporte es requerido');
    }

    if (!config.dateRange) {
      errors.push('El rango de fechas es requerido');
    } else {
      if (!config.dateRange.start || !config.dateRange.end) {
        errors.push('Las fechas de inicio y fin son requeridas');
      } else if (config.dateRange.start > config.dateRange.end) {
        errors.push('La fecha de inicio no puede ser posterior a la fecha de fin');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Exportar instancia singleton
export const reportService = new ReportService(); 