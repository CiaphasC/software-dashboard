import { z } from 'zod';
import { UserRole } from '@/shared/types/common.types';

// =============================================================================
// GSAP TYPES - Tipos para GSAP
// =============================================================================

export interface GSAPRef {
  gsap: {
    context: (callback: () => void) => { revert: () => void };
    timeline: () => {
      to: (target: any, vars: any) => any;
      from: (target: any, vars: any) => any;
      set: (target: any, vars: any) => any;
    };
    set: (target: any, vars: any) => void;
    to: (target: any, vars: any) => any;
    from: (target: any, vars: any) => any;
    utils: {
      toArray: (selector: string | Element | Element[]) => Element[];
    };
  };
}

// =============================================================================
// REGISTER FORM TYPES - Tipos para formulario de registro
// =============================================================================

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  requestedRole: UserRole;
}

// =============================================================================
// REGISTER SCHEMA - Esquema de validación para registro
// =============================================================================

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
    .refine((role) => role === UserRole.REQUESTER, {
      message: 'Solo se puede solicitar el rol de Solicitante durante el registro'
    })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// =============================================================================
// REGISTER PROPS - Props para el componente Register
// =============================================================================

export interface RegisterProps {
  onBackToLogin: () => void;
}

// =============================================================================
// AUTH CONTEXT TYPES - Tipos para el contexto de autenticación
// =============================================================================

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterFormData) => Promise<void>;
  pendingUsersCount: number;
  updatePendingUsersCount: () => Promise<void>;
}

// =============================================================================
// USER TYPES - Tipos de usuario
// =============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date;
}

// =============================================================================
// PENDING USER TYPES - Tipos para usuarios pendientes
// =============================================================================

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  password: string;
  department: string;
  requestedRole: UserRole;
  status: PendingUserStatus;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export enum PendingUserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// =============================================================================
// TYPE EXPORTS - Exportaciones de tipos
// =============================================================================

export type { User, PendingUser };
export { UserRole } from '@/shared/types/common.types'; 
