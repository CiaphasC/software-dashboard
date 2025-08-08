import { z } from 'zod';

// =============================================================================
// USE FORM VALIDATION HOOK - Hook reutilizable para validaciones de formularios
// Arquitectura de Software Profesional - Gestión de Validaciones
// =============================================================================

// =============================================================================
// SCHEMAS BASE - Schemas reutilizables para formularios
// =============================================================================

// Schema base para campos comunes
export const baseFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
});

// Schema para campos de área
export const areaSchema = z.object({
  affectedArea: z.string().min(1, 'El área afectada es requerida'),
});

export const requestingAreaSchema = z.object({
  requestingArea: z.string().min(2, 'El área solicitante es requerida'),
});

// Schema para campos de asignación
export const assignmentSchema = z.object({
  assignedTo: z.string().optional(),
});

// Schema para campos de prioridad
export const prioritySchema = z.object({
  priority: z.string().refine((val) => ['low', 'medium', 'high', 'urgent'].includes(val), {
    message: 'Prioridad inválida'
  }),
});

// Schema para campos de estado
export const statusSchema = z.object({
  status: z.string().refine((val) => ['open', 'in_progress', 'resolved', 'closed'].includes(val), {
    message: 'Estado inválido'
  }),
});

// Schema para campos de fecha
export const dateSchema = z.object({
  estimatedDeliveryDate: z.string().min(1, 'La fecha estimada es requerida'),
});

// =============================================================================
// SCHEMAS ESPECÍFICOS - Schemas para formularios específicos
// =============================================================================

// Schema para incidencias
export const incidentSchema = baseFormSchema
  .merge(areaSchema)
  .merge(assignmentSchema)
  .merge(prioritySchema)
  .merge(statusSchema)
  .extend({
    type: z.string().refine((val) => ['technical', 'software', 'hardware', 'network', 'other'].includes(val), {
      message: 'Tipo de incidencia inválido'
    }),
  });

// Schema para requerimientos
export const requirementSchema = baseFormSchema
  .merge(requestingAreaSchema)
  .merge(assignmentSchema)
  .merge(prioritySchema)
  .merge(dateSchema)
  .extend({
    type: z.string().refine((val) => ['document', 'equipment', 'service', 'other'].includes(val), {
      message: 'Tipo de requerimiento inválido'
    }),
    status: z.string().refine((val) => ['open', 'pending', 'in_progress', 'delivered', 'closed'].includes(val), {
      message: 'Estado inválido'
    }),
  });

// Schema para usuarios
export const userSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role_name: z.string().refine((val) => ['admin', 'technician', 'requester'].includes(val), {
    message: 'Rol inválido'
  }),
  department_id: z.number().optional(),
});

// =============================================================================
// HOOKS DE VALIDACIÓN - Hooks para usar los schemas
// =============================================================================

interface UseFormValidationProps<T> {
  schema: z.ZodSchema<T>;
  data: Partial<T>;
}

export const useFormValidation = <T>({ schema, data }: UseFormValidationProps<T>) => {
  const validate = (): { success: boolean; errors?: Record<string, string> } => {
    try {
      schema.parse(data);
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          errors[field] = err.message;
        });
        return { success: false, errors };
      }
      return { success: false, errors: { general: 'Error de validación' } };
    }
  };

  const validateField = (field: keyof T, value: any): string | null => {
    try {
      const fieldSchema = schema.shape[field as string];
      if (fieldSchema) {
        fieldSchema.parse(value);
        return null;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || null;
      }
    }
    return null;
  };

  return {
    validate,
    validateField,
    schema
  };
};

// =============================================================================
// HOOKS ESPECÍFICOS - Hooks para formularios específicos
// =============================================================================

// Hook para validación de incidencias
export const useIncidentValidation = (data: Partial<z.infer<typeof incidentSchema>>) => {
  return useFormValidation({
    schema: incidentSchema,
    data
  });
};

// Hook para validación de requerimientos
export const useRequirementValidation = (data: Partial<z.infer<typeof requirementSchema>>) => {
  return useFormValidation({
    schema: requirementSchema,
    data
  });
};

// Hook para validación de usuarios
export const useUserValidation = (data: Partial<z.infer<typeof userSchema>>) => {
  return useFormValidation({
    schema: userSchema,
    data
  });
};

// =============================================================================
// TIPOS EXPORTADOS - Tipos TypeScript para los schemas
// =============================================================================

export type IncidentFormData = z.infer<typeof incidentSchema>;
export type RequirementFormData = z.infer<typeof requirementSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type BaseFormData = z.infer<typeof baseFormSchema>; 