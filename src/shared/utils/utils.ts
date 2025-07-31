import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
// import { es, enUS } from 'date-fns/locale';
import currency from 'currency.js';
import { IncidentStatus, RequirementStatus, Priority } from '@/shared/types/common.types';
import { useConfig } from '@/shared/context/ConfigContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-PE', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    timeZone: 'America/Lima'
  }).format(d);
}

export function useFormatters() {
  const { config } = useConfig();
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
    case RequirementStatus.PENDING:
      return 'warning';
    case IncidentStatus.IN_PROGRESS:
    case RequirementStatus.IN_PROGRESS:
      return 'primary';
    case IncidentStatus.RESOLVED:
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
    case IncidentStatus.IN_PROGRESS:
      return 'En Proceso';
    case IncidentStatus.RESOLVED:
      return 'Resuelta';
    case IncidentStatus.CLOSED:
      return 'Cerrada';
    case RequirementStatus.PENDING:
      return 'Pendiente';
    case RequirementStatus.IN_PROGRESS:
      return 'En Proceso';
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
