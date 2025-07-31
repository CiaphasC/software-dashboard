// Servicio específico para incidencias - Migrado desde api.ts monolítico
import { Incident, FilterOptions, IncidentType, IncidentStatus, Priority } from '@/shared/types/common.types';
import { generateMockData } from '@/shared/utils/mockDataGenerator';

// Simulación de incidencias en memoria
let incidents: Incident[] = [];

// Datos de ejemplo para inicialización
const demoIncidents: Incident[] = [
  {
    id: 'inc_001',
    title: 'Error en sistema de reportes',
    description: 'El sistema de reportes no está generando los archivos PDF correctamente',
    type: IncidentType.SOFTWARE,
    priority: Priority.HIGH,
    status: IncidentStatus.OPEN,
    affectedArea: 'Reportes',
    assignedTo: 'tecnico',
    createdBy: 'solicitante',
    estimatedResolutionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: []
  },
  {
    id: 'inc_002',
    title: 'Lentitud en la red',
    description: 'La conexión a internet está muy lenta en el área de contabilidad',
    type: IncidentType.NETWORK,
    priority: Priority.MEDIUM,
    status: IncidentStatus.IN_PROGRESS,
    affectedArea: 'Contabilidad',
    assignedTo: 'tecnico',
    createdBy: 'admin',
    estimatedResolutionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: []
  }
];

// Función para inicializar datos
export const initializeIncidents = () => {
  if (incidents.length === 0) {
    incidents = [...demoIncidents, ...generateMockData.incidents(15)];
  }
};

// Inicializar datos mock automáticamente al cargar el módulo
initializeIncidents();

export const incidentsApi = {
  // Inicializar datos
  initializeIncidents,
  
  // Obtener todas las incidencias con filtros
  async getIncidents(filters?: FilterOptions): Promise<Incident[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay de red
    
    let filtered = [...incidents];
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(incident => 
        incident.title.toLowerCase().includes(search) ||
        incident.description.toLowerCase().includes(search) ||
        incident.affectedArea.toLowerCase().includes(search)
      );
    }
    
    if (filters?.status) {
      filtered = filtered.filter(incident => incident.status === filters.status);
    }
    
    if (filters?.priority) {
      filtered = filtered.filter(incident => incident.priority === filters.priority);
    }
    
    if (filters?.type) {
      filtered = filtered.filter(incident => incident.type === filters.type);
    }
    
    if (filters?.assignedTo) {
      filtered = filtered.filter(incident => incident.assignedTo === filters.assignedTo);
    }
    
    if (filters?.createdBy) {
      filtered = filtered.filter(incident => incident.createdBy === filters.createdBy);
    }
    
    if (filters?.dateRange) {
      filtered = filtered.filter(incident => {
        const createdAt = new Date(incident.createdAt);
        return createdAt >= filters.dateRange!.start && createdAt <= filters.dateRange!.end;
      });
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Obtener una incidencia por ID
  async getIncidentById(id: string): Promise<Incident | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return incidents.find(incident => incident.id === id) || null;
  },

  // Crear nueva incidencia
  async createIncident(incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newIncident: Incident = {
      ...incidentData,
      id: `inc_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: incidentData.attachments || [],
      comments: incidentData.comments || []
    };
    
    incidents.unshift(newIncident);
    return newIncident;
  },

  // Actualizar incidencia
  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const incidentIndex = incidents.findIndex(incident => incident.id === id);
    if (incidentIndex === -1) {
      throw new Error('Incidencia no encontrada');
    }
    
    incidents[incidentIndex] = {
      ...incidents[incidentIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    return incidents[incidentIndex];
  },

  // Eliminar incidencia
  async deleteIncident(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const incidentIndex = incidents.findIndex(incident => incident.id === id);
    if (incidentIndex === -1) {
      throw new Error('Incidencia no encontrada');
    }
    
    incidents.splice(incidentIndex, 1);
  },

  // Cambiar estado de incidencia
  async changeStatus(id: string, status: IncidentStatus): Promise<Incident> {
    const updates: Partial<Incident> = { status };
    
    if (status === IncidentStatus.RESOLVED || status === IncidentStatus.CLOSED) {
      updates.resolvedAt = new Date();
    }
    
    return this.updateIncident(id, updates);
  },

  // Asignar incidencia a técnico
  async assignIncident(id: string, assignedTo: string): Promise<Incident> {
    return this.updateIncident(id, { assignedTo });
  },

  // Obtener estadísticas de incidencias
  async getIncidentStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byPriority: Record<Priority, number>;
    byType: Record<IncidentType, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stats = {
      total: incidents.length,
      open: incidents.filter(i => i.status === IncidentStatus.OPEN).length,
      inProgress: incidents.filter(i => i.status === IncidentStatus.IN_PROGRESS).length,
      resolved: incidents.filter(i => i.status === IncidentStatus.RESOLVED).length,
      closed: incidents.filter(i => i.status === IncidentStatus.CLOSED).length,
      byPriority: {
        [Priority.LOW]: incidents.filter(i => i.priority === Priority.LOW).length,
        [Priority.MEDIUM]: incidents.filter(i => i.priority === Priority.MEDIUM).length,
        [Priority.HIGH]: incidents.filter(i => i.priority === Priority.HIGH).length,
        [Priority.URGENT]: incidents.filter(i => i.priority === Priority.URGENT).length
      },
      byType: {
        [IncidentType.TECHNICAL]: incidents.filter(i => i.type === IncidentType.TECHNICAL).length,
        [IncidentType.SOFTWARE]: incidents.filter(i => i.type === IncidentType.SOFTWARE).length,
        [IncidentType.HARDWARE]: incidents.filter(i => i.type === IncidentType.HARDWARE).length,
        [IncidentType.NETWORK]: incidents.filter(i => i.type === IncidentType.NETWORK).length,
        [IncidentType.OTHER]: incidents.filter(i => i.type === IncidentType.OTHER).length
      }
    };
    
    return stats;
  }
}; 