// =============================================================================
// CSV REPORT GENERATOR - Generador de reportes en formato CSV
// =============================================================================

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

export class CSVReportGenerator {
  
  /**
   * Genera un reporte en formato CSV con estructura organizada
   */
  async generate(data: ReportData, config: ReportConfig): Promise<Blob> {
    const csvContent = this.generateCSVContent(data, config);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    return blob;
  }

  // =============================================================================
  // PRIVATE METHODS - Métodos privados de generación
  // =============================================================================

  private generateCSVContent(data: ReportData, config: ReportConfig): string {
    const sections: string[] = [];
    
    // Sección de metadata
    sections.push(this.generateMetadataSection(config));
    
    // Sección de resumen
    sections.push(this.generateSummarySection(data));
    
    // Sección de incidencias
    if (data.incidents.length > 0) {
      sections.push(this.generateIncidentsSection(data));
    }
    
    // Sección de requerimientos
    if (data.requirements.length > 0) {
      sections.push(this.generateRequirementsSection(data));
    }
    
    // Sección de análisis
    sections.push(this.generateAnalyticsSection(data));
    
    return sections.join('\n\n');
  }

  private generateMetadataSection(config: ReportConfig): string {
    const rows = [
      ['METADATA DEL REPORTE'],
      ['Título', config.title],
      ['Fecha de Generación', new Date().toLocaleDateString('es-ES')],
      ['Período Inicio', config.dateRange.start.toLocaleDateString()],
      ['Período Fin', config.dateRange.end.toLocaleDateString()],
      ['Incluir Resumen', config.includeSummary ? 'Sí' : 'No'],
      ['Incluir Tablas', config.includeTables ? 'Sí' : 'No'],
      ['Incluir Gráficos', config.includeCharts ? 'Sí' : 'No']
    ];
    
    return this.arrayToCSV(rows);
  }

  private generateSummarySection(data: ReportData): string {
    const rows = [
      ['RESUMEN EJECUTIVO'],
      ['Métrica', 'Valor', 'Descripción'],
      ['Total de Incidencias', data.metrics.totalIncidents.toString(), 'Número total de incidencias registradas'],
      ['Incidencias Abiertas', data.metrics.openIncidents.toString(), 'Incidencias pendientes de resolución'],
      ['Incidencias en Proceso', data.metrics.inProgressIncidents.toString(), 'Incidencias siendo atendidas'],
      ['Incidencias Resueltas', data.metrics.resolvedIncidents.toString(), 'Incidencias ya resueltas'],
      ['Incidencias Cerradas', data.metrics.closedIncidents.toString(), 'Incidencias cerradas'],
      ['Total Requerimientos', data.metrics.totalRequirements.toString(), 'Número total de requerimientos'],
      ['Requerimientos Pendientes', data.metrics.pendingRequirements.toString(), 'Requerimientos en espera'],
      ['Requerimientos Entregados', data.metrics.deliveredRequirements.toString(), 'Requerimientos completados'],
      ['Tiempo Promedio de Resolución', `${data.metrics.averageResolutionTime.toFixed(1)} horas`, 'Tiempo promedio para resolver incidencias']
    ];
    
    return this.arrayToCSV(rows);
  }

  private generateIncidentsSection(data: ReportData): string {
    const headers = [
      'ID', 'Título', 'Tipo', 'Prioridad', 'Estado', 'Área Afectada', 
      'Asignado', 'Fecha Creación', 'Fecha Resolución', 'Tiempo Resolución (h)', 'Descripción'
    ];
    
    const rows = [['DETALLE DE INCIDENCIAS'], headers];
    
    data.incidents.forEach(incident => {
      const resolutionTime = incident.resolvedAt && incident.createdAt ? 
        Math.round((new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60)) : 
        'Pendiente';
      
      rows.push([
        incident.id,
        incident.title,
        incident.type,
        incident.priority,
        incident.status,
        incident.affectedArea,
        incident.assignedTo || 'Sin asignar',
        new Date(incident.createdAt).toLocaleDateString(),
        incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleDateString() : 'Pendiente',
        resolutionTime !== 'Pendiente' ? resolutionTime.toString() : 'Pendiente',
        incident.description
      ]);
    });
    
    return this.arrayToCSV(rows);
  }

  private generateRequirementsSection(data: ReportData): string {
    const headers = [
      'ID', 'Título', 'Tipo', 'Prioridad', 'Estado', 'Área Solicitante', 
      'Asignado', 'Fecha Creación', 'Fecha Entrega', 'Tiempo Entrega (h)', 'Descripción'
    ];
    
    const rows = [['DETALLE DE REQUERIMIENTOS'], headers];
    
    data.requirements.forEach(req => {
      const deliveryTime = req.deliveredAt && req.createdAt ? 
        Math.round((new Date(req.deliveredAt).getTime() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60)) : 
        'Pendiente';
      
      rows.push([
        req.id,
        req.title,
        req.type,
        req.priority,
        req.status,
        req.requestingArea,
        req.assignedTo || 'Sin asignar',
        new Date(req.createdAt).toLocaleDateString(),
        req.deliveredAt ? new Date(req.deliveredAt).toLocaleDateString() : 'Pendiente',
        deliveryTime !== 'Pendiente' ? deliveryTime.toString() : 'Pendiente',
        req.description
      ]);
    });
    
    return this.arrayToCSV(rows);
  }

  private generateAnalyticsSection(data: ReportData): string {
    const sections: string[] = [];
    
    // Análisis por área
    const areaHeaders = ['Área', 'Incidencias', 'Requerimientos', 'Total Items', 'Estado de Carga'];
    const areaRows = [['ANÁLISIS POR ÁREA'], areaHeaders];
    
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
    
    areaStats.forEach((stats, area) => {
      const total = stats.incidents + stats.requirements;
      const status = total > 10 ? 'Alto' : total > 5 ? 'Medio' : 'Bajo';
      areaRows.push([
        area,
        stats.incidents.toString(),
        stats.requirements.toString(),
        total.toString(),
        status
      ]);
    });
    
    sections.push(this.arrayToCSV(areaRows));
    
    // Análisis por prioridad
    const priorityHeaders = ['Prioridad', 'Cantidad', 'Porcentaje (%)'];
    const priorityRows = [['ANÁLISIS POR PRIORIDAD'], priorityHeaders];
    
    const priorityStats = new Map();
    const totalItems = data.incidents.length + data.requirements.length;
    
    [...data.incidents, ...data.requirements].forEach(item => {
      const priority = item.priority;
      priorityStats.set(priority, (priorityStats.get(priority) || 0) + 1);
    });
    
    priorityStats.forEach((count, priority) => {
      const percentage = ((count / totalItems) * 100).toFixed(1);
      priorityRows.push([
        priority,
        count.toString(),
        percentage
      ]);
    });
    
    sections.push(this.arrayToCSV(priorityRows));
    
    // Análisis por estado
    const statusHeaders = ['Estado', 'Cantidad', 'Porcentaje (%)'];
    const statusRows = [['ANÁLISIS POR ESTADO'], statusHeaders];
    
    const statusStats = new Map();
    
    [...data.incidents, ...data.requirements].forEach(item => {
      const status = item.status;
      statusStats.set(status, (statusStats.get(status) || 0) + 1);
    });
    
    statusStats.forEach((count, status) => {
      const percentage = ((count / totalItems) * 100).toFixed(1);
      statusRows.push([
        status,
        count.toString(),
        percentage
      ]);
    });
    
    sections.push(this.arrayToCSV(statusRows));
    
    return sections.join('\n\n');
  }

  private arrayToCSV(rows: string[][]): string {
    return rows.map(row => 
      row.map(cell => this.escapeCSV(cell)).join(',')
    ).join('\n');
  }

  private escapeCSV(value: string): string {
    // Escapar comillas y envolver en comillas si contiene comas, comillas o saltos de línea
    const escaped = value.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
      return `"${escaped}"`;
    }
    return escaped;
  }
} 