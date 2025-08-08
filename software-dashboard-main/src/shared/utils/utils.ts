import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
// import { es, enUS } from 'date-fns/locale';
import currency from 'currency.js';
import { IncidentStatus, RequirementStatus, Priority, IncidentType, RequirementType } from '@/shared/types/common.types';
import { useSettingsStore } from '@/shared/store';
import type { Department } from '@/shared/services/supabase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export function useFormatters() {
  const { config } = useSettingsStore();
  const locale = config.general.language === 'es' ? 'es-PE' : 'en-US';
  const tz = config.general.timezone || 'America/Lima';
  const dateFormat = config.general.dateFormat || 'dd/MM/yyyy';
  const currencyCode = config.general.currency || 'PEN';

  function formatDate(date: Date | string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    // Formato personalizado
    let options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: tz };
    if (dateFormat === 'MM/DD/YYYY') options = { ...options, month: '2-digit', day: '2-digit', year: 'numeric' };
    if (dateFormat === 'YYYY-MM-DD') options = { ...options, year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat(locale, options).format(d);
  }

  function formatDateTime(date: Date | string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    let options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: tz };
    return new Intl.DateTimeFormat(locale, options).format(d);
  }

  function formatMoney(amount: number) {
    return currency(amount, {
      symbol: currencyCode === 'PEN' ? 'S/' : currencyCode === 'USD' ? 'USD' : '€',
      precision: 2,
      separator: ',',
      decimal: '.',
    }).format();
  }

  return { formatDate, formatDateTime, formatMoney, locale, tz, dateFormat, currencyCode };
}

export function getStatusColor(status: IncidentStatus | RequirementStatus): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case IncidentStatus.OPEN:
    case RequirementStatus.OPEN:
      return 'warning';
    case IncidentStatus.PENDING:
    case RequirementStatus.PENDING:
      return 'warning';
    case IncidentStatus.IN_PROGRESS:
    case RequirementStatus.IN_PROGRESS:
      return 'primary';
    case IncidentStatus.COMPLETED:
    case RequirementStatus.COMPLETED:
      return 'success';
    case IncidentStatus.DELIVERED:
    case RequirementStatus.DELIVERED:
      return 'success';
    case IncidentStatus.CLOSED:
    case RequirementStatus.CLOSED:
      return 'danger';
    default:
      return 'secondary';
  }
}

export function getPriorityColor(priority: Priority): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  switch (priority) {
    case Priority.HIGH:
      return 'danger';
    case Priority.MEDIUM:
      return 'warning';
    case Priority.LOW:
      return 'success';
    case Priority.URGENT:
      return 'primary';
    default:
      return 'secondary';
  }
}

export function getStatusText(status: IncidentStatus | RequirementStatus): string {
  switch (status) {
    case IncidentStatus.OPEN:
      return 'Abierta';
    case IncidentStatus.PENDING:
      return 'Pendiente';
    case IncidentStatus.IN_PROGRESS:
      return 'En Proceso';
    case IncidentStatus.COMPLETED:
      return 'Completada';
    case IncidentStatus.DELIVERED:
      return 'Entregada';
    case IncidentStatus.CLOSED:
      return 'Cerrada';
    case RequirementStatus.OPEN:
      return 'Abierto';
    case RequirementStatus.PENDING:
      return 'Pendiente';
    case RequirementStatus.IN_PROGRESS:
      return 'En Proceso';
    case RequirementStatus.COMPLETED:
      return 'Completado';
    case RequirementStatus.DELIVERED:
      return 'Entregado';
    case RequirementStatus.CLOSED:
      return 'Cerrado';
    default:
      return 'Desconocido';
  }
}

export function getPriorityText(priority: Priority): string {
  switch (priority) {
    case Priority.HIGH:
      return 'Alta';
    case Priority.MEDIUM:
      return 'Media';
    case Priority.LOW:
      return 'Baja';
    default:
      return 'Desconocida';
  }
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 

// =============================================================================
// DATA TRANSFORMATION - Transformación de datos para formularios
// =============================================================================

/**
 * Convierte datos de incidencia de Supabase al formato del formulario
 */
export const transformIncidentForForm = (incident: any) => {
  return {
    title: incident.title,
    description: incident.description,
    type: incident.type,
    priority: incident.priority,
    status: incident.status,
    affectedArea: incident.affected_area_id?.toString() || '',
    assignedTo: incident.assigned_to || '',
    // REMOVER estimatedResolutionDate - se usará created_at automático
  };
};

/**
 * Convierte datos del formulario al formato de Supabase
 */
export const transformFormDataForSupabase = (formData: any) => {
  console.log('🔍 transformFormDataForSupabase - formData recibido:', formData);
  console.log('🔍 transformFormDataForSupabase - affectedArea:', formData.affectedArea);
  console.log('🔍 transformFormDataForSupabase - affectedArea type:', typeof formData.affectedArea);
  
  // Validar que affectedArea no sea vacío
  if (!formData.affectedArea || formData.affectedArea === '') {
    console.error('🔍 transformFormDataForSupabase - ERROR: affectedArea está vacío');
    throw new Error('El área afectada es requerida');
  }
  
  const transformed = {
    title: formData.title,
    description: formData.description,
    type: formData.type,
    priority: formData.priority,
    status: formData.status,
    affected_area_id: formData.affectedArea, // Mantener como string, el edge function lo convertirá
    assigned_to: formData.assignedTo || null,
    // REMOVER estimated_resolution_date - se usará created_at automático
  };
  
  console.log('🔍 transformFormDataForSupabase - datos transformados:', transformed);
  console.log('🔍 transformFormDataForSupabase - affected_area_id:', transformed.affected_area_id);
  
  return transformed;
};

/**
 * Convierte un departamento a formato de área para el formulario
 */
export const convertDepartmentToArea = (department: Department): { value: string; label: string } => {
  return {
    value: department.id.toString(),
    label: department.name
  };
};

/**
 * Convierte un área del formulario a ID de departamento para Supabase
 */
export const convertAreaToDepartmentId = (areaValue: string): number => {
  return parseInt(areaValue, 10);
};

/**
 * Encuentra un departamento por su ID
 */
export const findDepartmentById = (departments: Department[], id: number): Department | undefined => {
  return departments.find(dept => dept.id === id);
};

/**
 * Encuentra un departamento por su nombre
 */
export const findDepartmentByName = (departments: Department[], name: string): Department | undefined => {
  return departments.find(dept => dept.name === name);
}; 

/**
 * Convierte un string de Supabase a enum de estado de incidencia
 */
export const convertStringToIncidentStatus = (status: string): IncidentStatus => {
  switch (status) {
    case 'open': return IncidentStatus.OPEN;
    case 'pending': return IncidentStatus.PENDING;
    case 'in_progress': return IncidentStatus.IN_PROGRESS;
    case 'completed': return IncidentStatus.COMPLETED;
    case 'delivered': return IncidentStatus.DELIVERED;
    case 'closed': return IncidentStatus.CLOSED;
    default: return IncidentStatus.OPEN;
  }
};

/**
 * Convierte un string de Supabase a enum de estado de requerimiento
 */
export const convertStringToRequirementStatus = (status: string): RequirementStatus => {
  switch (status) {
    case 'open': return RequirementStatus.OPEN;
    case 'pending': return RequirementStatus.PENDING;
    case 'in_progress': return RequirementStatus.IN_PROGRESS;
    case 'completed': return RequirementStatus.COMPLETED;
    case 'delivered': return RequirementStatus.DELIVERED;
    case 'closed': return RequirementStatus.CLOSED;
    default: return RequirementStatus.PENDING;
  }
}; 

/**
 * Formatea una duración en horas a un formato legible
 */
export const formatDuration = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  } else if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
}; 
