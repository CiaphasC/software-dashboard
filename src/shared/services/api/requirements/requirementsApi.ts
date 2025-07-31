// Servicio específico para requerimientos - Migrado desde api.ts monolítico
import { Requirement, FilterOptions, RequirementType, RequirementStatus, Priority } from '@/shared/types/common.types';
import { generateMockData } from '@/shared/utils/mockDataGenerator';

// Simulación de requerimientos en memoria
let requirements: Requirement[] = [];

// Datos de ejemplo para inicialización
const demoRequirements: Requirement[] = [
  {
    id: 'req_001',
    title: 'Solicitud de nueva impresora para contabilidad',
    description: 'Se requiere una impresora láser para el departamento de contabilidad debido al alto volumen de documentos',
    type: RequirementType.EQUIPMENT,
    priority: Priority.MEDIUM,
    status: RequirementStatus.PENDING,
    requestingArea: 'Contabilidad',
    assignedTo: 'tecnico',
    createdBy: 'admin',
    estimatedDeliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: []
  },
  {
    id: 'req_002',
    title: 'Instalación de software de diseño',
    description: 'Se necesita instalar Adobe Creative Suite en la computadora del área de marketing',
    type: RequirementType.SERVICE,
    priority: Priority.HIGH,
    status: RequirementStatus.IN_PROGRESS,
    requestingArea: 'Marketing',
    assignedTo: 'tecnico',
    createdBy: 'solicitante',
    estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: []
  }
];

// Función para inicializar datos
export const initializeRequirements = () => {
  if (requirements.length === 0) {
    requirements = [...demoRequirements, ...generateMockData.requirements(12)];
  }
};

export const requirementsApi = {
  // Inicializar datos
  initializeRequirements,
  
  // Obtener todos los requerimientos con filtros
  async getRequirements(filters?: FilterOptions): Promise<Requirement[]> {
    await new Promise(resolve => setTimeout(resolve, 350)); // Simular delay de red
    
    let filtered = [...requirements];
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(requirement => 
        requirement.title.toLowerCase().includes(search) ||
        requirement.description.toLowerCase().includes(search) ||
        requirement.requestingArea.toLowerCase().includes(search)
      );
    }
    
    if (filters?.status) {
      filtered = filtered.filter(requirement => requirement.status === filters.status);
    }
    
    if (filters?.priority) {
      filtered = filtered.filter(requirement => requirement.priority === filters.priority);
    }
    
    if (filters?.type) {
      filtered = filtered.filter(requirement => requirement.type === filters.type);
    }
    
    if (filters?.assignedTo) {
      filtered = filtered.filter(requirement => requirement.assignedTo === filters.assignedTo);
    }
    
    if (filters?.createdBy) {
      filtered = filtered.filter(requirement => requirement.createdBy === filters.createdBy);
    }
    
    if (filters?.dateRange) {
      filtered = filtered.filter(requirement => {
        const createdAt = new Date(requirement.createdAt);
        return createdAt >= filters.dateRange!.start && createdAt <= filters.dateRange!.end;
      });
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Obtener un requerimiento por ID
  async getRequirementById(id: string): Promise<Requirement | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return requirements.find(requirement => requirement.id === id) || null;
  },

  // Crear nuevo requerimiento
  async createRequirement(requirementData: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Requirement> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newRequirement: Requirement = {
      ...requirementData,
      id: `req_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: requirementData.attachments || [],
      comments: requirementData.comments || []
    };
    
    requirements.unshift(newRequirement);
    return newRequirement;
  },

  // Actualizar requerimiento
  async updateRequirement(id: string, updates: Partial<Requirement>): Promise<Requirement> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const requirementIndex = requirements.findIndex(requirement => requirement.id === id);
    if (requirementIndex === -1) {
      throw new Error('Requerimiento no encontrado');
    }
    
    requirements[requirementIndex] = {
      ...requirements[requirementIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    return requirements[requirementIndex];
  },

  // Eliminar requerimiento
  async deleteRequirement(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const requirementIndex = requirements.findIndex(requirement => requirement.id === id);
    if (requirementIndex === -1) {
      throw new Error('Requerimiento no encontrado');
    }
    
    requirements.splice(requirementIndex, 1);
  },

  // Cambiar estado de requerimiento
  async changeStatus(id: string, status: RequirementStatus): Promise<Requirement> {
    const updates: Partial<Requirement> = { status };
    
    if (status === RequirementStatus.DELIVERED || status === RequirementStatus.CLOSED) {
      updates.deliveredAt = new Date();
    }
    
    return this.updateRequirement(id, updates);
  },

  // Asignar requerimiento a técnico
  async assignRequirement(id: string, assignedTo: string): Promise<Requirement> {
    return this.updateRequirement(id, { assignedTo });
  },

  // Obtener estadísticas de requerimientos
  async getRequirementStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    delivered: number;
    closed: number;
    byPriority: Record<Priority, number>;
    byType: Record<RequirementType, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stats = {
      total: requirements.length,
      pending: requirements.filter(r => r.status === RequirementStatus.PENDING).length,
      inProgress: requirements.filter(r => r.status === RequirementStatus.IN_PROGRESS).length,
      delivered: requirements.filter(r => r.status === RequirementStatus.DELIVERED).length,
      closed: requirements.filter(r => r.status === RequirementStatus.CLOSED).length,
      byPriority: {
        [Priority.LOW]: requirements.filter(r => r.priority === Priority.LOW).length,
        [Priority.MEDIUM]: requirements.filter(r => r.priority === Priority.MEDIUM).length,
        [Priority.HIGH]: requirements.filter(r => r.priority === Priority.HIGH).length,
        [Priority.URGENT]: requirements.filter(r => r.priority === Priority.URGENT).length
      },
      byType: {
        [RequirementType.DOCUMENT]: requirements.filter(r => r.type === RequirementType.DOCUMENT).length,
        [RequirementType.EQUIPMENT]: requirements.filter(r => r.type === RequirementType.EQUIPMENT).length,
        [RequirementType.SERVICE]: requirements.filter(r => r.type === RequirementType.SERVICE).length,
        [RequirementType.OTHER]: requirements.filter(r => r.type === RequirementType.OTHER).length
      }
    };
    
    return stats;
  }
}; 