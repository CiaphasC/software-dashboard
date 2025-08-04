import { z } from 'zod';
import { UserRole, User } from '@/shared/types/common.types';

// =============================================================================
// USER FORM TYPES - Tipos para formularios de usuario
// =============================================================================

export interface CreateUserData {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  password: string;
  confirmPassword: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  password?: string;
  confirmPassword?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

// =============================================================================
// USER FORM SCHEMA - Esquema de validación para formularios
// =============================================================================

export const userFormSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'El email es requerido'),
  role: z.nativeEnum(UserRole)
    .refine((role) => role !== UserRole.REQUESTER, {
      message: 'El rol de Solicitante solo se puede asignar durante el registro inicial'
    }),
  department: z.string()
    .min(1, 'Selecciona un departamento'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número')
    .optional(),
  confirmPassword: z.string()
    .min(1, 'Confirma tu contraseña')
    .optional(),
  isActive: z.boolean().default(true),
  isEmailVerified: z.boolean().default(true),
}).refine((data) => {
  // Si se proporciona contraseña, confirmPassword es requerido
  if (data.password && !data.confirmPassword) {
    return false;
  }
  // Si se proporciona confirmPassword, password es requerido
  if (data.confirmPassword && !data.password) {
    return false;
  }
  // Si ambos están presentes, deben coincidir
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// =============================================================================
// USER FORM PROPS - Props para el componente UserForm
// =============================================================================

export interface UserFormProps {
  user?: User | CreateUserData | UpdateUserData;
  onSubmit: (data: CreateUserData | UpdateUserData) => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
  isOpen?: boolean;
  departments?: Array<{ value: string; label: string }>;
  roles?: Array<{ value: UserRole; label: string }>;
}

// =============================================================================
// TYPE EXPORTS - Exportaciones de tipos
// =============================================================================

export type UserFormData = z.infer<typeof userFormSchema>; 