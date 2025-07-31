// =============================================================================
// EXCEL REPORT GENERATOR - Generador de reportes en formato Excel
// =============================================================================

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

export class ExcelReportGenerator {
  
  /**
   * Genera un reporte en formato Excel con diseño profesional
   */
  async generate(data: ReportData, config: ReportConfig): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Generar hojas del reporte
    await this.generateSummarySheet(workbook, data, config);
    await this.generateIncidentsSheet(workbook, data);
    await this.generateRequirementsSheet(workbook, data);
    await this.generateAnalyticsSheet(workbook, data);

    // Crear blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    return blob;
  }

  // =============================================================================
  // PRIVATE METHODS - Métodos privados de generación
  // =============================================================================

  private async generateSummarySheet(workbook: XLSX.WorkBook, data: ReportData, config: ReportConfig): Promise<void> {
    const summaryData = [
      ['📊 REPORTE DE SISTEMA'],
      [''],
      ['📅 Información del Reporte'],
      ['Título', config.title],
      ['Período', `${config.dateRange.start.toLocaleDateString()} - ${config.dateRange.end.toLocaleDateString()}`],
      ['Generado el', new Date().toLocaleDateString('es-ES')],
      [''],
      ['📈 Resumen Ejecutivo'],
      [''],
      ['Métrica', 'Valor', 'Descripción'],
      ['Total de Incidencias', data.metrics.totalIncidents, 'Número total de incidencias registradas'],
      ['Incidencias Abiertas', data.metrics.openIncidents, 'Incidencias pendientes de resolución'],
      ['Incidencias en Proceso', data.metrics.inProgressIncidents, 'Incidencias siendo atendidas'],
      ['Incidencias Resueltas', data.metrics.resolvedIncidents, 'Incidencias ya resueltas'],
      ['Incidencias Cerradas', data.metrics.closedIncidents, 'Incidencias cerradas'],
      ['Total Requerimientos', data.metrics.totalRequirements, 'Número total de requerimientos'],
      ['Requerimientos Pendientes', data.metrics.pendingRequirements, 'Requerimientos en espera'],
      ['Requerimientos Entregados', data.metrics.deliveredRequirements, 'Requerimientos completados'],
      ['Tiempo Promedio de Resolución', `${data.metrics.averageResolutionTime.toFixed(1)} horas`, 'Tiempo promedio para resolver incidencias'],
      [''],
      ['📊 Tendencias'],
      ['Tendencia de Incidencias', data.metrics.incidentTrend?.isPositive ? '↗️ Positiva' : '↘️ Negativa', `${data.metrics.incidentTrend?.value || 0}%`],
      ['Tendencia de Incidencias Abiertas', data.metrics.openIncidentTrend?.isPositive ? '↗️ Positiva' : '↘️ Negativa', `${data.metrics.openIncidentTrend?.value || 0}%`],
      ['Tendencia de Requerimientos', data.metrics.requirementTrend?.isPositive ? '↗️ Positiva' : '↘️ Negativa', `${data.metrics.requirementTrend?.value || 0}%`],
      ['Tendencia de Requerimientos Pendientes', data.metrics.pendingRequirementTrend?.isPositive ? '↗️ Positiva' : '↘️ Negativa', `${data.metrics.pendingRequirementTrend?.value || 0}%`]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Aplicar estilos al resumen
    summarySheet['!cols'] = [
      { width: 25 }, // Primera columna
      { width: 15 }, // Segunda columna
      { width: 40 }  // Tercera columna
    ];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Resumen');
  }

  private async generateIncidentsSheet(workbook: XLSX.WorkBook, data: ReportData): Promise<void> {
    if (data.incidents.length === 0) return;

    const incidentsData = [
      ['🚨 DETALLE DE INCIDENCIAS'],
      [''],
      ['ID', 'Título', 'Tipo', 'Prioridad', 'Estado', 'Área Afectada', 'Asignado', 'Fecha Creación', 'Fecha Resolución', 'Tiempo Resolución (h)', 'Descripción']
    ];

    data.incidents.forEach(incident => {
      const resolutionTime = incident.resolvedAt && incident.createdAt ? Math.round((new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60)) : 'Pendiente';
      incidentsData.push([
        incident.id,
        incident.title,
        incident.type,
        incident.priority,
        incident.status,
        incident.affectedArea,
        incident.assignedTo || 'Sin asignar',
        new Date(incident.createdAt).toLocaleDateString(),
        incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleDateString() : 'Pendiente',
        resolutionTime !== 'Pendiente' ? `${resolutionTime}h` : 'Pendiente',
        incident.description
      ]);
    });

    const incidentsSheet = XLSX.utils.aoa_to_sheet(incidentsData);
    
    // Aplicar estilos a incidencias
    incidentsSheet['!cols'] = [
      { width: 12 }, // ID
      { width: 35 }, // Título
      { width: 12 }, // Tipo
      { width: 10 }, // Prioridad
      { width: 12 }, // Estado
      { width: 15 }, // Área
      { width: 15 }, // Asignado
      { width: 12 }, // Fecha Creación
      { width: 12 }, // Fecha Resolución
      { width: 15 }, // Tiempo
      { width: 40 }  // Descripción
    ];
    
    XLSX.utils.book_append_sheet(workbook, incidentsSheet, '🚨 Incidencias');
  }

  private async generateRequirementsSheet(workbook: XLSX.WorkBook, data: ReportData): Promise<void> {
    if (data.requirements.length === 0) return;

    const requirementsData = [
      ['📋 DETALLE DE REQUERIMIENTOS'],
      [''],
      ['ID', 'Título', 'Tipo', 'Prioridad', 'Estado', 'Área Solicitante', 'Asignado', 'Fecha Creación', 'Fecha Entrega', 'Tiempo Entrega (h)', 'Descripción']
    ];

    data.requirements.forEach(req => {
      const deliveryTime = req.deliveredAt && req.createdAt ? Math.round((new Date(req.deliveredAt).getTime() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60)) : 'Pendiente';
      requirementsData.push([
        req.id,
        req.title,
        req.type,
        req.priority,
        req.status,
        req.requestingArea,
        req.assignedTo || 'Sin asignar',
        new Date(req.createdAt).toLocaleDateString(),
        req.deliveredAt ? new Date(req.deliveredAt).toLocaleDateString() : 'Pendiente',
        deliveryTime !== 'Pendiente' ? `${deliveryTime}h` : 'Pendiente',
        req.description
      ]);
    });

    const requirementsSheet = XLSX.utils.aoa_to_sheet(requirementsData);
    
    // Aplicar estilos a requerimientos
    requirementsSheet['!cols'] = [
      { width: 12 }, // ID
      { width: 35 }, // Título
      { width: 12 }, // Tipo
      { width: 10 }, // Prioridad
      { width: 12 }, // Estado
      { width: 15 }, // Área
      { width: 15 }, // Asignado
      { width: 12 }, // Fecha Creación
      { width: 12 }, // Fecha Entrega
      { width: 15 }, // Tiempo
      { width: 40 }  // Descripción
    ];
    
    XLSX.utils.book_append_sheet(workbook, requirementsSheet, '📋 Requerimientos');
  }

  private async generateAnalyticsSheet(workbook: XLSX.WorkBook, data: ReportData): Promise<void> {
    // Análisis por área
    const areaData = [
      ['📊 ANÁLISIS POR ÁREA'],
      [''],
      ['Área', 'Incidencias', 'Requerimientos', 'Total Items', 'Estado']
    ];

    // Agrupar por área
    const areaStats = new Map();
    
    // Procesar incidencias
    data.incidents.forEach(incident => {
      const area = incident.affectedArea;
      if (!areaStats.has(area)) {
        areaStats.set(area, { incidents: 0, requirements: 0 });
      }
      areaStats.get(area).incidents++;
    });

    // Procesar requerimientos
    data.requirements.forEach(req => {
      const area = req.requestingArea;
      if (!areaStats.has(area)) {
        areaStats.set(area, { incidents: 0, requirements: 0 });
      }
      areaStats.get(area).requirements++;
    });

    // Agregar datos al Excel
    areaStats.forEach((stats, area) => {
      const total = stats.incidents + stats.requirements;
      const status = total > 10 ? '🔴 Alto' : total > 5 ? '🟡 Medio' : '🟢 Bajo';
      areaData.push([
        area,
        stats.incidents,
        stats.requirements,
        total,
        status
      ]);
    });

    const areaSheet = XLSX.utils.aoa_to_sheet(areaData);
    areaSheet['!cols'] = [
      { width: 20 }, // Área
      { width: 12 }, // Incidencias
      { width: 12 }, // Requerimientos
      { width: 12 }, // Total
      { width: 10 }  // Estado
    ];
    
    XLSX.utils.book_append_sheet(workbook, areaSheet, '📊 Por Área');
  }
} 