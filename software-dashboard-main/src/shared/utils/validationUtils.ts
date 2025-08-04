// =============================================================================
// VALIDATION UTILS - Utilidades centralizadas para validaciones
// Arquitectura de Software Profesional - Eliminación de Duplicación de Lógica
// =============================================================================

import { z } from 'zod';

// =============================================================================
// REGEX PATTERNS - Patrones de expresiones regulares
// =============================================================================

const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  URL: /^https?:\/\/.+/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/
} as const;

// =============================================================================
// VALIDATION SCHEMAS - Esquemas de validación con Zod
// =============================================================================

/**
 * Esquema de validación para email
 */
export const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Formato de email inválido')
  .regex(PATTERNS.EMAIL, 'Formato de email inválido');

/**
 * Esquema de validación para contraseña
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/\d/, 'Debe contener al menos un número')
  .regex(/[@$!%*?&]/, 'Debe contener al menos un carácter especial (@$!%*?&)');

/**
 * Esquema de validación para confirmación de contraseña
 */
export const confirmPasswordSchema = (passwordField: string = 'password') => 
  z.string().refine((val) => val === passwordField, {
    message: 'Las contraseñas no coinciden'
  });

/**
 * Esquema de validación para nombres
 */
export const nameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(50, 'El nombre no puede exceder 50 caracteres')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios');

/**
 * Esquema de validación para teléfonos
 */
export const phoneSchema = z
  .string()
  .regex(PATTERNS.PHONE, 'Formato de teléfono inválido')
  .optional();

/**
 * Esquema de validación para URLs
 */
export const urlSchema = z
  .string()
  .url('URL inválida')
  .optional();

// =============================================================================
// VALIDATION FUNCTIONS - Funciones de validación
// =============================================================================

/**
 * Valida si un email es válido
 */
export const validateEmail = (email: string): boolean => {
  return PATTERNS.EMAIL.test(email);
};

/**
 * Valida si una contraseña cumple con los requisitos de seguridad
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida si dos contraseñas coinciden
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Valida si un nombre es válido
 */
export const validateName = (name: string): boolean => {
  return name.length >= 2 && 
         name.length <= 50 && 
         /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
};

/**
 * Valida si un teléfono es válido
 */
export const validatePhone = (phone: string): boolean => {
  return PATTERNS.PHONE.test(phone);
};

/**
 * Valida si una URL es válida
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida si un valor es numérico
 */
export const validateNumeric = (value: string): boolean => {
  return PATTERNS.NUMERIC.test(value);
};

/**
 * Valida si un valor es decimal
 */
export const validateDecimal = (value: string): boolean => {
  return PATTERNS.DECIMAL.test(value);
};

/**
 * Valida si un valor está dentro de un rango
 */
export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Valida si una fecha es válida y está en el futuro
 */
export const validateFutureDate = (date: Date | string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime()) && dateObj > new Date();
};

/**
 * Valida si una fecha es válida y está en el pasado
 */
export const validatePastDate = (date: Date | string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime()) && dateObj < new Date();
};

// =============================================================================
// FORM VALIDATION - Validaciones específicas para formularios
// =============================================================================

/**
 * Valida un formulario de registro de usuario
 */
export const validateUserRegistration = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validar nombre
  if (!validateName(data.name)) {
    errors.name = 'Nombre inválido';
  }
  
  // Validar email
  if (!validateEmail(data.email)) {
    errors.email = 'Email inválido';
  }
  
  // Validar contraseña
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors.join(', ');
  }
  
  // Validar confirmación de contraseña
  if (!validatePasswordConfirmation(data.password, data.confirmPassword)) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }
  
  // Validar departamento
  if (!data.department || data.department.trim().length === 0) {
    errors.department = 'El departamento es requerido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida un formulario de incidencia
 */
export const validateIncidentForm = (data: {
  title: string;
  description: string;
  affectedArea: string;
  priority: string;
  type: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validar título
  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'El título debe tener al menos 5 caracteres';
  }
  
  // Validar descripción
  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'La descripción debe tener al menos 10 caracteres';
  }
  
  // Validar área afectada
  if (!data.affectedArea || data.affectedArea.trim().length === 0) {
    errors.affectedArea = 'El área afectada es requerida';
  }
  
  // Validar prioridad
  if (!data.priority || !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    errors.priority = 'Prioridad inválida';
  }
  
  // Validar tipo
  if (!data.type || !['technical', 'software', 'hardware', 'network', 'other'].includes(data.type)) {
    errors.type = 'Tipo inválido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// =============================================================================
// SANITIZATION FUNCTIONS - Funciones de sanitización
// =============================================================================

/**
 * Sanitiza un string eliminando caracteres peligrosos
 */
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, '') // Eliminar < y >
    .replace(/javascript:/gi, '') // Eliminar javascript:
    .replace(/on\w+=/gi, ''); // Eliminar event handlers
};

/**
 * Sanitiza un email
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Sanitiza un nombre
 */
export const sanitizeName = (name: string): string => {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); // Solo letras y espacios
};

// =============================================================================
// UTILITY FUNCTIONS - Funciones de utilidad
// =============================================================================

/**
 * Obtiene el mensaje de error de un campo específico
 */
export const getFieldError = (errors: Record<string, string>, field: string): string => {
  return errors[field] || '';
};

/**
 * Verifica si un formulario tiene errores
 */
export const hasFormErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Limpia todos los errores de un formulario
 */
export const clearFormErrors = (): Record<string, string> => {
  return {};
};

// =============================================================================
// EXPORT DEFAULT - Exportación por defecto
// =============================================================================

export default {
  // Schemas
  emailSchema,
  passwordSchema,
  confirmPasswordSchema,
  nameSchema,
  phoneSchema,
  urlSchema,
  
  // Validation functions
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
  validatePhone,
  validateUrl,
  validateNumeric,
  validateDecimal,
  validateRange,
  validateFutureDate,
  validatePastDate,
  
  // Form validation
  validateUserRegistration,
  validateIncidentForm,
  
  // Sanitization
  sanitizeString,
  sanitizeEmail,
  sanitizeName,
  
  // Utilities
  getFieldError,
  hasFormErrors,
  clearFormErrors,
  
  // Patterns
  PATTERNS
}; 