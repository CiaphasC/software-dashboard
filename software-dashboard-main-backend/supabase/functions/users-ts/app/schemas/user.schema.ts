import { z } from 'zod'

// =============================================================================
// SCHEMAS: Zod para entradas de usuarios
// =============================================================================
// Propósito: Centralizar contratos de validación para crear, actualizar y
//            registrar usuarios, generando tipos derivados para los controladores.
// =============================================================================

// Creación de usuario por admin
export const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().min(2),
  department: z.string().min(1), // acepta short_name o name
  isActive: z.boolean().optional().default(true),
})
export type CreateUserInput = z.infer<typeof CreateUserSchema>

// Actualización parcial
export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.string().min(2).optional(),
  department: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
})
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

// Registro público (solicitud)
export const RegisterUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  department: z.string().min(1),
  requestedRole: z.literal('requester'),
})
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>