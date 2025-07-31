import { z } from 'zod';
import { UserRole } from '@/shared/types/common.types';

export const userFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.nativeEnum(UserRole),
  department: z.string().min(1, 'Selecciona un departamento'),
  avatar: z.string().optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export interface UserFormProps {
  user?: any;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isOpen: boolean;
} 