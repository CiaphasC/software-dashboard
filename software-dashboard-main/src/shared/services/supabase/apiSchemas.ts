// =============================================================================
// EDGE FUNCTIONS API SCHEMAS (Zod) - Validación runtime de contratos
// =============================================================================

import { z } from 'zod'
import type { IncidentWithTimes, RequirementWithTimes } from '@/shared/services/supabase/types'
import type {
  GetIncidentsListResponse,
  IncidentMetricsResponse,
  GetRequirementsListResponse,
  RequirementMetricsResponse,
  GetUsersListResponse,
  UserListItem,
} from '@/shared/services/supabase/apiTypes'

// Utilidades comunes
const stringOrNull = z.string().nullable().optional()
const numberOrNull = z.number().nullable().optional()

// =============================================================================
// Incidents
// =============================================================================

export const IncidentWithTimesSchema: z.ZodType<IncidentWithTimes> = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  type: z.string(),
  priority: z.string(),
  status: z.string(),
  requesting_area_id: z.number().nullable().optional(),
  affected_area_id: z.number(),
  assigned_to: z.string().nullable().optional(),
  created_by: z.string(),
  created_at: z.string(),
  estimated_resolution_date: stringOrNull,
  resolved_at: stringOrNull,
  resolution_time_hours: numberOrNull,
  last_modified_by: stringOrNull,
  last_modified_at: stringOrNull,
  creator_name: stringOrNull,
  assignee_name: stringOrNull,
  affected_area_name: stringOrNull,
  requesting_area_name: stringOrNull,
  creator_email: stringOrNull,
  creator_role: stringOrNull,
  assignee_email: stringOrNull,
  assignee_role: stringOrNull,
  affected_area_short_name: stringOrNull,
  requesting_area_short_name: stringOrNull,
  last_modified_by_name: stringOrNull,
  time_elapsed: stringOrNull,
  time_remaining: stringOrNull,
}).passthrough()

export const GetIncidentsListResponseSchema: z.ZodType<GetIncidentsListResponse> = z.object({
  items: z.array(IncidentWithTimesSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
})

export const IncidentMetricsResponseSchema: z.ZodType<IncidentMetricsResponse> = z.object({
  totalIncidents: z.number(),
  openIncidents: z.number(),
  inProgressIncidents: z.number(),
  resolvedIncidents: z.number(),
  closedIncidents: z.number(),
})

// =============================================================================
// Requirements
// =============================================================================

export const RequirementWithTimesSchema: z.ZodType<RequirementWithTimes> = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  type: z.string(),
  priority: z.string(),
  status: z.string(),
  requesting_area_id: z.number(),
  assigned_to: z.string().nullable().optional(),
  created_by: z.string(),
  created_at: z.string(),
  estimated_delivery_date: stringOrNull,
  delivered_at: stringOrNull,
  delivery_time_hours: numberOrNull,
  last_modified_by: stringOrNull,
  last_modified_at: stringOrNull,
  creator_name: stringOrNull,
  assignee_name: stringOrNull,
  requesting_area_name: stringOrNull,
  creator_email: stringOrNull,
  creator_role: stringOrNull,
  assignee_email: stringOrNull,
  assignee_role: stringOrNull,
  requesting_area_short_name: stringOrNull,
  last_modified_by_name: stringOrNull,
  time_elapsed: stringOrNull,
  time_remaining: stringOrNull,
}).passthrough()

export const GetRequirementsListResponseSchema: z.ZodType<GetRequirementsListResponse> = z.object({
  items: z.array(RequirementWithTimesSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
})

export const RequirementMetricsResponseSchema: z.ZodType<RequirementMetricsResponse> = z.object({
  totalRequirements: z.number(),
  pendingRequirements: z.number(),
  inProgressRequirements: z.number(),
  completedRequirements: z.number(),
  deliveredRequirements: z.number(),
})

// =============================================================================
// Users
// =============================================================================

export const UserListItemSchema: z.ZodType<UserListItem> = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role_name: z.string(),
  department_id: z.number().nullable(),
  is_active: z.boolean(),
}).passthrough()

export const GetUsersListResponseSchema: z.ZodType<GetUsersListResponse> = z.array(UserListItemSchema)

