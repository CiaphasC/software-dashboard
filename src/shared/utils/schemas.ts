import { z } from 'zod';
import { IncidentType, IncidentStatus, Priority, RequirementType, RequirementStatus, UserRole } from '@/shared/types/common.types';

// Esquemas de usuario
export const userSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.nativeEnum(UserRole),
  department: z.string().min(1, 'El departamento es requerido'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Esquema de registro de usuarios
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'El email es requerido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string()
    .min(1, 'Confirma tu contraseña'),
  department: z.string()
    .min(1, 'Selecciona un departamento'),
  requestedRole: z.nativeEnum(UserRole)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Esquemas de incidencias
export const incidentSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  type: z.nativeEnum(IncidentType),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(IncidentStatus),
  affectedArea: z.string().min(1, 'El área afectada es requerida'),
  assignedTo: z.string().optional(),
  estimatedResolutionDate: z.string().optional(),
});

export const incidentUpdateSchema = z.object({
  status: z.nativeEnum(IncidentStatus),
  assignedTo: z.string().optional(),
  estimatedResolutionDate: z.string().optional(),
  comments: z.string().optional(),
});

// Esquemas de requerimientos
export const requirementSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  type: z.nativeEnum(RequirementType),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(RequirementStatus),
  requestingArea: z.string().min(1, 'El área solicitante es requerida'),
  assignedTo: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
});

export const requirementUpdateSchema = z.object({
  status: z.nativeEnum(RequirementStatus),
  assignedTo: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  comments: z.string().optional(),
});

// Esquemas de filtros
export const filterSchema = z.object({
  status: z.nativeEnum(IncidentStatus).or(z.nativeEnum(RequirementStatus)).optional(),
  priority: z.nativeEnum(Priority).optional(),
  type: z.nativeEnum(IncidentType).or(z.nativeEnum(RequirementType)).optional(),
  department: z.string().optional(),
  assignedTo: z.string().optional(),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  search: z.string().optional(),
});

// Esquemas de reportes
export const reportSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  type: z.enum(['incidents', 'requirements', 'performance', 'custom']),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }),
  format: z.enum(['pdf', 'excel', 'csv']),
});

// Tipos derivados de los esquemas
export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type IncidentFormData = z.infer<typeof incidentSchema>;
export type IncidentUpdateData = z.infer<typeof incidentUpdateSchema>;
export type RequirementFormData = z.infer<typeof requirementSchema>;
export type RequirementUpdateData = z.infer<typeof requirementUpdateSchema>;
export type FilterFormData = z.infer<typeof filterSchema>;
export type ReportFormData = z.infer<typeof reportSchema>; 
