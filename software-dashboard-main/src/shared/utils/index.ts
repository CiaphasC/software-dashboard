export * from './utils'
export * from './dateUtils'
// TODO: agregar formatters centralizados cuando se creen

// =============================================================================
// UTILS INDEX - Exportaciones centralizadas de utilidades
// Arquitectura de Software Profesional - Barrel Exports
// =============================================================================

// Utilidades básicas
export * from './logger';
export * from './schemas';
export * from './mockDataGenerator';

// Utilidades centralizadas (FASE 2)
export * from './dateUtils';
export * from './validationUtils';

// Exportaciones por defecto
export { default as dateUtils } from './dateUtils';
export { default as validationUtils } from './validationUtils';

// Re-exportar utils después de dateUtils para evitar conflictos
export { cn, useFormatters, getStatusColor, getPriorityColor, getStatusText, getPriorityText, capitalize, truncate, debounce } from './utils'; 