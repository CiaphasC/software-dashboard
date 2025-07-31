import { z } from 'zod';
import { UserRole } from '@/shared/types/common.types';

export const userFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.nativeEnum(UserRole).refine(
    (role) => role !== UserRole.REQUESTER,
    { message: 'No se puede asignar el rol de solicitante desde esta interfaz' }
  ),
  department: z.string().min(1, 'Selecciona un departamento'),
  avatar: z.string().optional(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Si se proporciona contraseña, debe cumplir con los requisitos
  if (data.password && data.password.length > 0) {
    if (data.password.length < 8) {
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      return false;
    }
  }
  return true;
}, {
  message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número",
  path: ["password"],
}).refine((data) => {
  // Si se proporciona contraseña, debe coincidir con confirmPassword
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type UserFormData = z.infer<typeof userFormSchema>;

export interface UserFormProps {
  user?: any;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isOpen: boolean;
} 