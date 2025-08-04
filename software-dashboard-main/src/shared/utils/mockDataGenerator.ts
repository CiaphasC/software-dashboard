// Generador de datos mock para desarrollo y testing
import { Incident, Requirement, IncidentType, IncidentStatus, Priority, RequirementType, RequirementStatus } from '@/shared/types/common.types';

const randomChoice = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const randomDate = (daysAgo: number = 30): Date => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return pastDate;
};

const incidentTitles = [
  'Sistema lento en {department}',
  'Error en acceso a {system}',
  'Problema con impresora en {area}',
  'Falla en conexión de red',
  'Error en respaldo de datos',
  'Problema con email corporativo',
  'Falla en sistema de facturación',
  'Error en base de datos',
  'Problema con software de contabilidad',
  'Falla en equipo de seguridad'
];

const requirementTitles = [
  'Solicitud de nuevo equipo para {department}',
  'Instalación de software en {area}',
  'Configuración de accesos para nuevo empleado',
  'Actualización de sistema operativo',
  'Creación de usuario en sistema',
  'Instalación de impresora',
  'Configuración de correo electrónico',
  'Solicitud de licencia de software',
  'Backup de información',
  'Mantenimiento preventivo de equipos'
];

const departments = ['TI', 'Contabilidad', 'Ventas', 'RRHH', 'Administración', 'Gerencia', 'Logística'];
const areas = ['Oficina Principal', 'Sucursal Norte', 'Sucursal Sur', 'Almacén', 'Recepción'];
const systems = ['ERP', 'CRM', 'Sistema de Facturación', 'Sistema de Nómina', 'Portal Web'];
const users = ['admin', 'tecnico', 'solicitante'];

export const generateMockData = {
  incidents: (count: number = 10): Incident[] => {
    return Array.from({ length: count }, (_, index) => {
      const createdAt = randomDate(60);
      const department = randomChoice(departments);
      const area = randomChoice(areas);
      const system = randomChoice(systems);
      
      return {
        id: `mock_inc_${Date.now()}_${index}`,
        title: randomChoice(incidentTitles)
          .replace('{department}', department)
          .replace('{area}', area)
          .replace('{system}', system),
        description: `Descripción detallada del problema reportado en ${department}. Requiere atención técnica para resolver el inconveniente.`,
        type: randomChoice(Object.values(IncidentType)),
        priority: randomChoice(Object.values(Priority)),
        status: randomChoice(Object.values(IncidentStatus)),
        affectedArea: randomChoice([department, area]),
        assignedTo: Math.random() > 0.3 ? 'tecnico' : undefined,
        reportedBy: randomChoice(users),
        estimatedResolutionDate: Math.random() > 0.4 ? new Date(createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined,
        resolvedAt: Math.random() > 0.7 ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        createdAt,
        updatedAt: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        attachments: [],
        comments: undefined
      };
    });
  },

  requirements: (count: number = 10): Requirement[] => {
    return Array.from({ length: count }, (_, index) => {
      const createdAt = randomDate(90);
      const department = randomChoice(departments);
      const area = randomChoice(areas);
      
      return {
        id: `mock_req_${Date.now()}_${index}`,
        title: randomChoice(requirementTitles)
          .replace('{department}', department)
          .replace('{area}', area),
        description: `Solicitud de servicio requerida por ${department}. Incluye especificaciones técnicas y justificación del requerimiento.`,
        type: randomChoice(Object.values(RequirementType)),
        priority: randomChoice(Object.values(Priority)),
        status: randomChoice(Object.values(RequirementStatus)),
        requestingArea: department,
        assignedTo: Math.random() > 0.4 ? 'tecnico' : undefined,
        requestedBy: randomChoice(users),
        estimatedDeliveryDate: Math.random() > 0.3 ? new Date(createdAt.getTime() + Math.random() * 21 * 24 * 60 * 60 * 1000) : undefined,
        deliveredAt: Math.random() > 0.8 ? new Date(createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined,
        createdAt,
        updatedAt: new Date(createdAt.getTime() + Math.random() * 48 * 60 * 60 * 1000),
        attachments: [],
        comments: undefined
      };
    });
  }
}; 