import { z } from 'zod'

export const IncidentCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional().default(''),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  departmentId: z.coerce.number().int().positive(),
  assignedTo: z.string().uuid().optional(),
  type: z.enum(['technical', 'software', 'hardware', 'network', 'other']).default('technical'),
})
export type IncidentCreate = z.infer<typeof IncidentCreateSchema>

export const IncidentUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.enum(['technical', 'software', 'hardware', 'network', 'other']).optional(),
  assignedTo: z.string().uuid().optional(),
  departmentId: z.number().int().positive().optional(),
})
export type IncidentUpdate = z.infer<typeof IncidentUpdateSchema>


