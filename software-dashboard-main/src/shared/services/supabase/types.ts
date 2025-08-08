// =============================================================================
// SUPABASE TYPES - Tipos TypeScript para Supabase
// Arquitectura de Software Profesional - Tipos de Base de Datos
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================================================
// DATABASE TYPES - Tipos de la base de datos
// =============================================================================

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: number
          name: string
          short_name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          short_name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          short_name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: number
          name: string
          description: string | null
          permissions: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          permissions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          permissions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          department_id: number | null
          role_id: number
          role_name: string
          is_active: boolean
          is_email_verified: boolean
          requested_role: string | null
          last_login_at: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          department_id?: number | null
          role_id: number
          role_name?: string
          is_active?: boolean
          is_email_verified?: boolean
          requested_role?: string | null
          last_login_at?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          department_id?: number | null
          role_id?: number
          role_name?: string
          is_active?: boolean
          is_email_verified?: boolean
          requested_role?: string | null
          last_login_at?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registration_requests: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          department_id: number
          requested_role: string
          status: string
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password: string
          department_id: number
          requested_role?: string
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password?: string
          department_id?: number
          requested_role?: string
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      incidents: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          priority: string
          status: string
          requesting_area_id: number | null
          affected_area_id: number
          assigned_to: string | null
          created_by: string
          estimated_resolution_date: string | null
          resolved_at: string | null
          resolution_time_hours: number | null
          last_modified_by: string | null
          last_modified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: string
          priority?: string
          status?: string
          requesting_area_id?: number | null
          affected_area_id: number
          assigned_to?: string | null
          created_by: string
          estimated_resolution_date?: string | null
          resolved_at?: string | null
          resolution_time_hours?: number | null
          last_modified_by?: string | null
          last_modified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: string
          priority?: string
          status?: string
          requesting_area_id?: number | null
          affected_area_id?: number
          assigned_to?: string | null
          created_by?: string
          estimated_resolution_date?: string | null
          resolved_at?: string | null
          resolution_time_hours?: number | null
          last_modified_by?: string | null
          last_modified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      requirements: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          priority: string
          status: string
          requesting_area_id: number
          assigned_to: string | null
          created_by: string
          estimated_delivery_date: string | null
          delivered_at: string | null
          delivery_time_hours: number | null
          last_modified_by: string | null
          last_modified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: string
          priority?: string
          status?: string
          requesting_area_id: number
          assigned_to?: string | null
          created_by: string
          estimated_delivery_date?: string | null
          delivered_at?: string | null
          delivery_time_hours?: number | null
          last_modified_by?: string | null
          last_modified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: string
          priority?: string
          status?: string
          requesting_area_id?: number
          assigned_to?: string | null
          created_by?: string
          estimated_delivery_date?: string | null
          delivered_at?: string | null
          delivery_time_hours?: number | null
          last_modified_by?: string | null
          last_modified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          name: string
          url: string
          size: number
          type: string
          uploaded_at: string
          uploaded_by: string
          incident_id: string | null
          requirement_id: string | null
        }
        Insert: {
          id?: string
          name: string
          url: string
          size: number
          type: string
          uploaded_at?: string
          uploaded_by: string
          incident_id?: string | null
          requirement_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          url?: string
          size?: number
          type?: string
          uploaded_at?: string
          uploaded_by?: string
          incident_id?: string | null
          requirement_id?: string | null
        }
      }
      recent_activities: {
        Row: {
          id: string
          type: string
          action: string
          title: string
          description: string
          timestamp: string
          user_id: string
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          action: string
          title: string
          description: string
          timestamp?: string
          user_id: string
          item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          action?: string
          title?: string
          description?: string
          timestamp?: string
          user_id?: string
          item_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          priority: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          priority?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          priority?: string
          is_read?: boolean
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          title: string
          type: string
          format: string
          date_range: Json
          data: Json
          status: string
          download_url: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          type: string
          format: string
          date_range: Json
          data?: Json
          status?: string
          download_url?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: string
          format?: string
          date_range?: Json
          data?: Json
          status?: string
          download_url?: string | null
          created_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      profiles_with_roles: {
        Row: {
          id: string
          name: string
          email: string
          department_id: number | null
          role_id: number
          role_name: string
          is_active: boolean
          is_email_verified: boolean
          requested_role: string | null
          last_login_at: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          role_display_name: string
          role_description: string | null
          role_permissions: Json
          department_name: string | null
          department_short_name: string | null
        }
      }
      incidents_with_users: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          priority: string
          status: string
          requesting_area_id: number | null
          affected_area_id: number
          assigned_to: string | null
          created_by: string
          estimated_resolution_date: string | null
          resolved_at: string | null
          resolution_time_hours: number | null
          last_modified_by: string | null
          last_modified_at: string | null
          created_at: string
          updated_at: string
          creator_name: string | null
          creator_email: string | null
          creator_role: string | null
          assignee_name: string | null
          assignee_email: string | null
          assignee_role: string | null
          requesting_area_name: string | null
          requesting_area_short_name: string | null
          affected_area_name: string | null
          affected_area_short_name: string | null
        }
      }
      requirements_with_users: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          priority: string
          status: string
          requesting_area_id: number
          assigned_to: string | null
          created_by: string
          estimated_delivery_date: string | null
          delivered_at: string | null
          delivery_time_hours: number | null
          last_modified_by: string | null
          last_modified_at: string | null
          created_at: string
          updated_at: string
          creator_name: string | null
          creator_email: string | null
          creator_role: string | null
          assignee_name: string | null
          assignee_email: string | null
          assignee_role: string | null
          requesting_area_name: string | null
          requesting_area_short_name: string | null
        }
      }
      activities_with_users: {
        Row: {
          id: string
          type: string
          action: string
          title: string
          description: string
          timestamp: string
          user_id: string
          item_id: string
          created_at: string
          user_name: string | null
          user_email: string | null
          user_role: string | null
        }
      }
      registration_requests_with_admin: {
        Row: {
          id: string
          name: string
          email: string
          department_id: number
          requested_role: string
          status: string
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
          admin_name: string | null
          admin_email: string | null
          department_name: string | null
          department_short_name: string | null
        }
      }
      incidents_with_times: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          priority: string
          status: string
          requesting_area_id: number | null
          affected_area_id: number
          assigned_to: string | null
          created_by: string
          estimated_resolution_date: string | null
          resolved_at: string | null
          resolution_time_hours: number | null
          last_modified_by: string | null
          last_modified_at: string | null
          created_at: string
          updated_at: string
          creator_name: string | null
          creator_email: string | null
          creator_role: string | null
          assignee_name: string | null
          assignee_email: string | null
          assignee_role: string | null
          requesting_area_name: string | null
          requesting_area_short_name: string | null
          affected_area_name: string | null
          affected_area_short_name: string | null
          last_modified_by_name: string | null
          time_elapsed: string | null
          time_remaining: string | null
        }
      }
      requirements_with_times: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          priority: string
          status: string
          requesting_area_id: number
          assigned_to: string | null
          created_by: string
          estimated_delivery_date: string | null
          delivered_at: string | null
          delivery_time_hours: number | null
          last_modified_by: string | null
          last_modified_at: string | null
          created_at: string
          updated_at: string
          creator_name: string | null
          creator_email: string | null
          creator_role: string | null
          assignee_name: string | null
          assignee_email: string | null
          assignee_role: string | null
          requesting_area_name: string | null
          requesting_area_short_name: string | null
          last_modified_by_name: string | null
          time_elapsed: string | null
          time_remaining: string | null
        }
      }
    }
    Functions: {
      get_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type?: string
          p_priority?: string
        }
        Returns: string
      }
      log_activity: {
        Args: {
          p_type: string
          p_action: string
          p_title: string
          p_description: string
          p_user_id: string
          p_item_id: string
        }
        Returns: string
      }
      change_user_role: {
        Args: {
          p_user_id: string
          p_new_role_name: string
          p_admin_id: string
        }
        Returns: boolean
      }
      approve_registration_request: {
        Args: {
          p_request_id: string
          p_admin_id: string
          p_role_name?: string
        }
        Returns: string
      }
      reject_registration_request: {
        Args: {
          p_request_id: string
          p_admin_id: string
          p_reason: string
        }
        Returns: string
      }
      update_incident_status: {
        Args: {
          p_incident_id: string
          p_new_status: string
          p_resolved_at?: string
          p_user_id?: string
        }
        Returns: Json
      }
      update_requirement_status: {
        Args: {
          p_requirement_id: string
          p_new_status: string
          p_delivered_at?: string
          p_user_id?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// =============================================================================
// DOMAIN TYPES - Tipos del dominio de negocio
// =============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Tipos específicos del dominio
export type Profile = Tables<'profiles'>
export type Incident = Tables<'incidents'>
export type Requirement = Tables<'requirements'>
export type Department = Tables<'departments'>
export type Role = Tables<'roles'>
export type RegistrationRequest = Tables<'registration_requests'>
export type Attachment = Tables<'attachments'>
export type RecentActivity = Tables<'recent_activities'>
export type Notification = Tables<'notifications'>
export type Report = Tables<'reports'>

// Tipos de vistas
export type ProfileWithRole = Database['public']['Views']['profiles_with_roles']['Row']
export type IncidentWithUsers = Database['public']['Views']['incidents_with_users']['Row']
export type RequirementWithUsers = Database['public']['Views']['requirements_with_users']['Row']
export type ActivityWithUser = Database['public']['Views']['activities_with_users']['Row']
export type RegistrationRequestWithAdmin = Database['public']['Views']['registration_requests_with_admin']['Row']
export type IncidentWithTimes = Database['public']['Views']['incidents_with_times']['Row']
export type RequirementWithTimes = Database['public']['Views']['requirements_with_times']['Row']

// =============================================================================
// UTILITY TYPES - Tipos de utilidad
// =============================================================================

export type DatabaseError = {
  message: string
  details?: string
  hint?: string
  code?: string
}

export type ApiResponse<T> = {
  data: T | null
  error: DatabaseError | null
}

export type PaginationParams = {
  page?: number
  limit?: number
  offset?: number
}

export type SortParams = {
  column: string
  direction: 'asc' | 'desc'
}

export type FilterParams = {
  [key: string]: any
}

export type QueryParams = PaginationParams & {
  sort?: SortParams
  filters?: FilterParams
  search?: string
} 