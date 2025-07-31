// =============================================================================
// PDF REPORT GENERATOR - Generador de reportes en formato PDF
// Arquitectura de Software Profesional - Diseño UI/UX Moderno
// =============================================================================

import jsPDF from 'jspdf';

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

export class PDFReportGenerator {
  
  /**
   * Genera un reporte en formato PDF con arquitectura de software profesional
   * y diseño UI/UX moderno y elegante
   */
  async generate(data: ReportData, config: ReportConfig): Promise<Blob> {
    const doc = new jsPDF();
    
    // Configurar colores del tema profesional
    const colors = this.getThemeColors();
    
    // Generar contenido del PDF con arquitectura modular
    await this.generateHeader(doc, config, colors);
    await this.generateSummary(doc, data, colors);
    await this.generateIncidents(doc, data, colors);
    await this.generateRequirements(doc, data, colors);
    await this.generateFooter(doc, config, colors);
    
    // Crear blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  }

  // =============================================================================
  // PRIVATE METHODS - Métodos privados de generación
  // =============================================================================

  private getThemeColors() {
    return {
      primary: [30, 41, 59], // slate-800
      secondary: [59, 130, 246], // blue-500
      success: [34, 197, 94], // green-500
      warning: [245, 158, 11], // orange-500
      danger: [239, 68, 68], // red-500
      gray: [107, 114, 128], // gray-500
      lightGray: [248, 250, 252], // slate-50
      white: [255, 255, 255],
      border: [229, 231, 235], // gray-200
      // Colores temáticos para tarjetas
      cardBlue: [239, 246, 255], // blue-50
      cardOrange: [254, 243, 199], // orange-50
      cardGreen: [240, 253, 244], // green-50
      cardPurple: [250, 245, 255], // purple-50
      cardRed: [254, 242, 242], // red-50
      // Colores para sombras y efectos
      shadow: [0, 0, 0, 0.1], // Sombra sutil
      accent: [99, 102, 241], // indigo-500
      // Colores para estados
      statusOpen: [245, 158, 11], // orange-500
      statusInProgress: [59, 130, 246], // blue-500
      statusResolved: [34, 197, 94], // green-500
      statusClosed: [107, 114, 128] // gray-500
    };
  }

  private async generateHeader(doc: jsPDF, config: ReportConfig, colors: any): Promise<void> {
    // Header con diseño moderno y profesional
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Línea decorativa en el header
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(0, 33, 210, 2, 'F');
    
    // Título del reporte con tipografía profesional
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(config.title, 20, 18);
    
    // Información del reporte con mejor espaciado
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, 26);
    doc.text(`Periodo: ${config.dateRange.start.toLocaleDateString('es-ES')} - ${config.dateRange.end.toLocaleDateString('es-ES')}`, 20, 31);
  }

  private async generateSummary(doc: jsPDF, data: ReportData, colors: any): Promise<void> {
    let yPosition = 45;

    // Título de sección con diseño elegante
    doc.setFontSize(16);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition);
    
    // Línea decorativa bajo el título
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(20, yPosition + 2, 50, 1, 'F');
    
    yPosition += 20;

    // Título de KPIs ANTES de las métricas
    doc.setFontSize(12);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('INDICADORES CLAVE DE RENDIMIENTO', 20, yPosition);
    
    // Línea decorativa
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(20, yPosition + 2, 80, 0.5, 'F');
    
    yPosition += 15;

    // KPIs en formato de lista ANTES de las métricas
    const kpis = [
      { label: 'Tasa de Resolucion', value: `${((data.metrics?.totalIncidents || 0) - (data.metrics?.openIncidents || 0)) / (data.metrics?.totalIncidents || 1) * 100}%`, icon: '#' },
      { label: 'Tiempo de Respuesta Promedio', value: `${(data.metrics?.averageResponseTime || 0).toFixed(1)}h`, icon: '>' },
      { label: 'SLA Cumplido', value: `${(data.metrics?.slaCompliance || 0)}%`, icon: '!' },
      { label: 'Requerimientos Completados', value: `${(data.metrics?.completedRequirements || 0)}`, icon: '✓' }
    ];

    kpis.forEach((kpi, index) => {
      const x = 20;
      const y = yPosition + (index * 12);
      
      // Icono
      doc.setFontSize(10);
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(kpi.icon, x, y);
      
      // Label
      doc.setFontSize(8);
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(kpi.label, x + 15, y);
      
      // Value
      doc.setFontSize(8);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(kpi.value, x + 120, y);
    });

    // Actualizar posición Y para las métricas
    yPosition += 60;

    // Métricas principales en grid 2x3 con diseño mejorado y profesional
    const metrics = [
      { 
        label: 'Total Incidencias', 
        value: data.metrics?.totalIncidents || 0, 
        color: colors.primary,
        bgColor: colors.cardBlue,
        icon: '!',
        subtitle: 'Registradas',
        trend: '+12%',
        trendColor: colors.success
      },
      { 
        label: 'Incidencias Abiertas', 
        value: data.metrics?.openIncidents || 0, 
        color: colors.warning,
        bgColor: colors.cardOrange,
        icon: '!',
        subtitle: 'Pendientes',
        trend: '+5%',
        trendColor: colors.warning
      },
      { 
        label: 'Incidencias Resueltas', 
        value: (data.metrics?.totalIncidents || 0) - (data.metrics?.openIncidents || 0), 
        color: colors.success,
        bgColor: colors.cardGreen,
        icon: '✓',
        subtitle: 'Completadas',
        trend: '+8%',
        trendColor: colors.success
      },
      { 
        label: 'Requerimientos', 
        value: data.metrics?.pendingRequirements || 0, 
        color: colors.secondary,
        bgColor: colors.cardPurple,
        icon: '>',
        subtitle: 'En Cola',
        trend: '-2%',
        trendColor: colors.success
      },
      { 
        label: 'Tiempo Promedio', 
        value: `${(data.metrics?.averageResolutionTime || 0).toFixed(1)}h`, 
        color: colors.success,
        bgColor: colors.cardGreen,
        icon: '~',
        subtitle: 'Resolucion',
        trend: '+3%',
        trendColor: colors.warning
      },
      { 
        label: 'Satisfaccion', 
        value: '94%', 
        color: colors.success,
        bgColor: colors.cardGreen,
        icon: '*',
        subtitle: 'Usuario',
        trend: '+2%',
        trendColor: colors.success
      }
    ];

    // Crear grid 2x3 para las métricas con diseño mejorado
    const cardWidth = 85;
    const cardHeight = 35;
    const margin = 5;
    const startX = 20;

    metrics.forEach((metric, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = startX + col * (cardWidth + margin);
      const y = yPosition + row * (cardHeight + 10);

      // Sombra sutil mejorada
      doc.setFillColor(200, 200, 200);
      doc.roundedRect(x + 2, y - 6, cardWidth, cardHeight, 3, 3, 'F');
      
      // Fondo de tarjeta con color temático
      doc.setFillColor(metric.bgColor[0], metric.bgColor[1], metric.bgColor[2]);
      doc.roundedRect(x, y - 8, cardWidth, cardHeight, 3, 3, 'F');
      
      // Borde de tarjeta con color temático
      const borderColor = metric.color;
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.8);
      doc.roundedRect(x, y - 8, cardWidth, cardHeight, 3, 3, 'D');
      
      // Icono ASCII (sin emojis problemáticos)
      doc.setFontSize(12);
      doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.icon, x + 6, y - 2);
      
      // Texto de la etiqueta
      doc.setFontSize(7);
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + 20, y - 2);
      
      // Subtitle
      doc.setFontSize(6);
      doc.text(metric.subtitle, x + 20, y + 2);
      
      // Valor con estilo destacado
      doc.setFontSize(14);
      doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.value.toString(), x + 6, y + 12);
      
      // Trend indicator
      doc.setFontSize(6);
      doc.setTextColor(metric.trendColor[0], metric.trendColor[1], metric.trendColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.trend, x + 6, y + 18);
    });

    // Actualizar posición Y para la siguiente sección
    yPosition += 120;
  }

  private async generateIncidents(doc: jsPDF, data: ReportData, colors: any): Promise<void> {
    if (!data.incidents || data.incidents.length === 0) return;

    let yPosition = 280; // Posición ajustada para aparecer después de las métricas

    // Título de sección con diseño elegante
    doc.setFontSize(14);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('INCIDENCIAS RECIENTES', 20, yPosition);
    
    // Línea decorativa bajo el título
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(20, yPosition + 2, 70, 0.8, 'F');
    
    yPosition += 12;

    // Tabla de incidencias con diseño compacto y profesional
    const incidents = data.incidents.slice(0, 4); // Reducido a 4 para mejor espaciado
    
    incidents.forEach((incident, index) => {
      // Verificar si necesitamos nueva página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Sombra sutil
      doc.setFillColor(200, 200, 200);
      doc.roundedRect(21, yPosition - 4, 168, 28, 2, 2, 'F');
      
      // Fondo de incidencia con gradiente sutil
      const bgColor = index % 2 === 0 ? colors.white : colors.lightGray;
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.roundedRect(20, yPosition - 5, 170, 26, 2, 2, 'F');
      
      // Borde con color temático
      const statusColor = this.getIncidentStatusColor(incident.status);
      doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, yPosition - 5, 170, 26, 2, 2, 'D');
      
      // Icono de incidente (ASCII)
      doc.setFontSize(10);
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('!', 25, yPosition);
      
      // ID con estilo destacado
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      const idText = `${incident.id}`;
      doc.text(idText, 35, yPosition);
      
      // Título con mejor formato
      const title = this.truncateText(incident.title || 'Sin titulo', 30);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(title, 25, yPosition + 8);
      
      // Primera línea de detalles con iconos ASCII
      doc.setFontSize(6);
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('* Tipo:', 25, yPosition + 15);
      doc.text(`${incident.type || 'N/A'}`, 45, yPosition + 15);
      
      doc.text('* Prioridad:', 80, yPosition + 15);
      doc.text(`${incident.priority || 'N/A'}`, 105, yPosition + 15);
      
      // Estado con color y estilo destacado
      const statusText = this.getIncidentStatusText(incident.status);
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('* Estado:', 130, yPosition + 15);
      doc.text(statusText, 150, yPosition + 15);
      
      // Segunda línea de detalles
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('* Asignado:', 25, yPosition + 20);
      doc.text(`${incident.assignedTo || 'Sin asignar'}`, 50, yPosition + 20);
      
      yPosition += 32; // Espaciado vertical optimizado
    });
  }

  private async generateRequirements(doc: jsPDF, data: ReportData, colors: any): Promise<void> {
    if (!data.requirements || data.requirements.length === 0) return;

    let yPosition = 420; // Posición ajustada para evitar superposición con incidencias
    
    // Si no hay espacio suficiente, crear nueva página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    // Título de sección con diseño elegante
    doc.setFontSize(14);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('REQUERIMIENTOS', 20, yPosition);
    
    // Línea decorativa bajo el título
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(20, yPosition + 2, 50, 0.8, 'F');
    
    yPosition += 12;

    // Tabla de requerimientos con diseño compacto y profesional
    const requirements = data.requirements.slice(0, 4); // Reducido a 4 para mejor espaciado
    
    requirements.forEach((req, index) => {
      // Verificar si necesitamos nueva página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Sombra sutil
      doc.setFillColor(200, 200, 200);
      doc.roundedRect(21, yPosition - 4, 168, 28, 2, 2, 'F');
      
      // Fondo de requerimiento con gradiente sutil
      const bgColor = index % 2 === 0 ? colors.white : colors.lightGray;
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.roundedRect(20, yPosition - 5, 170, 26, 2, 2, 'F');
      
      // Borde con color temático
      const statusColor = this.getRequirementStatusColor(req.status);
      doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, yPosition - 5, 170, 26, 2, 2, 'D');
      
      // Icono de requerimiento (ASCII)
      doc.setFontSize(10);
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('>', 25, yPosition);
      
      // ID con estilo destacado
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      const idText = `${req.id}`;
      doc.text(idText, 35, yPosition);
      
      // Título con mejor formato
      const title = this.truncateText(req.title || 'Sin titulo', 30);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(title, 25, yPosition + 8);
      
      // Primera línea de detalles con iconos ASCII
      doc.setFontSize(6);
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('* Tipo:', 25, yPosition + 15);
      doc.text(`${req.type || 'N/A'}`, 45, yPosition + 15);
      
      doc.text('* Prioridad:', 80, yPosition + 15);
      doc.text(`${req.priority || 'N/A'}`, 105, yPosition + 15);
      
      // Estado con color y estilo destacado
      const statusText = this.getRequirementStatusText(req.status);
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('* Estado:', 130, yPosition + 15);
      doc.text(statusText, 150, yPosition + 15);
      
      // Segunda línea de detalles
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('* Area:', 25, yPosition + 20);
      doc.text(`${req.requestingArea || 'N/A'}`, 45, yPosition + 20);
      
      doc.text('* Asignado:', 100, yPosition + 20);
      doc.text(`${req.assignedTo || 'Sin asignar'}`, 125, yPosition + 20);
      
      yPosition += 32; // Espaciado vertical optimizado
    });
  }

  private async generateFooter(doc: jsPDF, config: ReportConfig, colors: any): Promise<void> {
    // Línea decorativa antes del footer
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(0, 275, 210, 1, 'F');
    
    // Footer con diseño moderno y compacto
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 276, 210, 24, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestion de Incidencias y Requerimientos', 20, 285);
    doc.text(`Pagina ${doc.getCurrentPageInfo().pageNumber}`, 180, 285);
  }

  // =============================================================================
  // HELPER METHODS - Métodos auxiliares optimizados
  // =============================================================================

  /**
   * Trunca el texto a una longitud específica para evitar desbordamiento
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  private getIncidentStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'open': 'Abierto',
      'in_progress': 'En Proceso',
      'resolved': 'Resuelto',
      'closed': 'Cerrado',
      'pending': 'Pendiente'
    };
    return statusMap[status] || status || 'N/A';
  }

  private getIncidentStatusColor(status: string): number[] {
    const colorMap: Record<string, number[]> = {
      'resolved': [34, 197, 94], // green-500
      'in_progress': [59, 130, 246], // blue-500
      'open': [245, 158, 11], // orange-500
      'closed': [107, 114, 128], // gray-500
      'pending': [245, 158, 11] // orange-500
    };
    return colorMap[status] || [107, 114, 128]; // gray-500 por defecto
  }

  private getRequirementStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'in_progress': 'En Proceso',
      'delivered': 'Entregado',
      'closed': 'Cerrado',
      'deferred': 'Diferido'
    };
    return statusMap[status] || status || 'N/A';
  }

  private getRequirementStatusColor(status: string): number[] {
    const colorMap: Record<string, number[]> = {
      'delivered': [34, 197, 94], // green-500
      'in_progress': [59, 130, 246], // blue-500
      'pending': [245, 158, 11], // orange-500
      'closed': [107, 114, 128], // gray-500
      'deferred': [107, 114, 128] // gray-500
    };
    return colorMap[status] || [107, 114, 128]; // gray-500 por defecto
  }
} 