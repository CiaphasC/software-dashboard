// API de reportes - Extraída del api.ts monolítico
import { Report } from '@/shared/types/common.types';
import { generateMockData } from '@/shared/utils/mockDataGenerator';

// Simulación de base de datos en memoria
let reports: Report[] = [];

// Generar reportes de ejemplo
const generateMockReports = (): Report[] => {
  const incidents = generateMockData.incidents(100);
  const requirements = generateMockData.requirements(50);
  
  return [
    {
      id: 'report_001',
      title: 'Reporte Mensual de Incidencias - Enero 2024',
      type: 'monthly',
      format: 'pdf',
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      },
      data: {
        totalIncidents: incidents.length,
        resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
        openIncidents: incidents.filter(i => i.status === 'open').length,
        averageResolutionTime: 3.5,
        incidentsByDepartment: [
          { department: 'TI', count: 25 },
          { department: 'Contabilidad', count: 18 },
          { department: 'Ventas', count: 12 },
          { department: 'RRHH', count: 8 }
        ],
        incidentsByPriority: [
          { priority: 'high', count: 15 },
          { priority: 'medium', count: 35 },
          { priority: 'low', count: 13 }
        ]
      },
      createdAt: new Date('2024-02-01'),
      createdBy: 'admin',
      status: 'completed',
      downloadUrl: '/reports/monthly-2024-01.pdf'
    },
    {
      id: 'report_002',
      title: 'Reporte Semanal de Requerimientos - Semana 5',
      type: 'weekly',
      format: 'excel',
      dateRange: {
        start: new Date('2024-01-29'),
        end: new Date('2024-02-04')
      },
      data: {
        totalRequirements: requirements.length,
        pendingRequirements: requirements.filter(r => r.status === 'pending').length,
        deliveredRequirements: requirements.filter(r => r.status === 'delivered').length,
        averageDeliveryTime: 5.2,
        requirementsByType: [
          { type: 'feature', count: 20 },
          { type: 'bugfix', count: 15 },
          { type: 'enhancement', count: 10 },
          { type: 'documentation', count: 5 }
        ]
      },
      createdAt: new Date('2024-02-05'),
      createdBy: 'admin',
      status: 'completed',
      downloadUrl: '/reports/weekly-2024-w05.xlsx'
    },
    {
      id: 'report_003',
      title: 'Reporte de Rendimiento del Sistema - Q1 2024',
      type: 'quarterly',
      format: 'pdf',
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-03-31')
      },
      data: {
        systemUptime: 99.8,
        averageResponseTime: 245,
        totalUsers: 150,
        activeUsers: 89,
        totalIncidents: 245,
        totalRequirements: 89,
        satisfactionScore: 4.2
      },
      createdAt: new Date('2024-04-01'),
      createdBy: 'admin',
      status: 'in_progress',
      downloadUrl: null
    }
  ];
};

// Inicializar reportes
export const initializeReports = () => {
  if (reports.length === 0) {
    reports = generateMockReports();
  }
};

export const reportsApi = {
  // Generar reporte
  async generateReport(type: string, dateRange: { start: Date; end: Date }): Promise<Report> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simular tiempo de generación
    
    const incidents = generateMockData.incidents(50);
    const requirements = generateMockData.requirements(25);
    
    const reportData = {
      totalIncidents: incidents.length,
      resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
      openIncidents: incidents.filter(i => i.status === 'open').length,
      totalRequirements: requirements.length,
      pendingRequirements: requirements.filter(r => r.status === 'pending').length,
      deliveredRequirements: requirements.filter(r => r.status === 'delivered').length,
      averageResolutionTime: 3.2,
      averageDeliveryTime: 4.8,
      incidentsByDepartment: [
        { department: 'TI', count: Math.floor(Math.random() * 30) + 10 },
        { department: 'Contabilidad', count: Math.floor(Math.random() * 20) + 5 },
        { department: 'Ventas', count: Math.floor(Math.random() * 15) + 3 },
        { department: 'RRHH', count: Math.floor(Math.random() * 10) + 2 }
      ],
      incidentsByPriority: [
        { priority: 'high', count: Math.floor(Math.random() * 20) + 5 },
        { priority: 'medium', count: Math.floor(Math.random() * 40) + 15 },
        { priority: 'low', count: Math.floor(Math.random() * 15) + 3 }
      ]
    };

    const newReport: Report = {
      id: `report_${Date.now()}`,
      title: `Reporte ${type} - ${dateRange.start.toLocaleDateString()} a ${dateRange.end.toLocaleDateString()}`,
      type: type as any,
      format: 'pdf',
      dateRange,
      data: reportData,
      createdAt: new Date(),
      createdBy: 'admin',
      status: 'completed',
      downloadUrl: `/reports/${type}-${Date.now()}.pdf`
    };
    
    reports.unshift(newReport);
    
    return newReport;
  },

  // Obtener todos los reportes
  async getReports(): Promise<Report[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (reports.length === 0) {
      initializeReports();
    }
    
    return reports;
  },

  // Obtener reporte por ID
  async getReportById(id: string): Promise<Report | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (reports.length === 0) {
      initializeReports();
    }
    
    return reports.find(r => r.id === id) || null;
  },

  // Obtener reportes por tipo
  async getReportsByType(type: string): Promise<Report[]> {
    const allReports = await this.getReports();
    return allReports.filter(r => r.type === type);
  },

  // Obtener reportes por estado
  async getReportsByStatus(status: string): Promise<Report[]> {
    const allReports = await this.getReports();
    return allReports.filter(r => r.status === status);
  },

  // Exportar datos
  async exportData(format: 'csv' | 'excel'): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const incidents = generateMockData.incidents(100);
    const requirements = generateMockData.requirements(50);
    
    // Simular exportación
    const fileName = `export_${format}_${Date.now()}.${format}`;
    const downloadUrl = `/exports/${fileName}`;
    
    return downloadUrl;
  },

  // Eliminar reporte
  async deleteReport(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = reports.findIndex(r => r.id === id);
    if (index !== -1) {
      reports.splice(index, 1);
    }
  },

  // Obtener estadísticas de reportes
  async getReportStats(): Promise<{
    totalReports: number;
    completedReports: number;
    inProgressReports: number;
    failedReports: number;
    averageGenerationTime: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (reports.length === 0) {
      initializeReports();
    }
    
    return {
      totalReports: reports.length,
      completedReports: reports.filter(r => r.status === 'completed').length,
      inProgressReports: reports.filter(r => r.status === 'in_progress').length,
      failedReports: reports.filter(r => r.status === 'failed').length,
      averageGenerationTime: 2.5
    };
  },

  // Programar reporte recurrente
  async scheduleRecurringReport(
    type: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    recipients: string[]
  ): Promise<{
    id: string;
    status: 'scheduled';
    nextRun: Date;
  }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + (frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : 30));
    
    return {
      id: `schedule_${Date.now()}`,
      status: 'scheduled',
      nextRun
    };
  }
}; 