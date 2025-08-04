// =============================================================================
// DATA SERVICE - Servicio de datos para Supabase
// Arquitectura de Software Profesional - Gestión de Datos del Sistema
// =============================================================================

import { supabase } from './client'
import type { 
  Incident,
  Requirement,
  Department,
  RecentActivity,
  Notification,
  Report,
  IncidentWithUsers,
  RequirementWithUsers,
  ActivityWithUser,
  Inserts,
  Updates,
  QueryParams
} from './types'

// =============================================================================
// DATA TYPES - Tipos específicos de datos
// =============================================================================

export interface IncidentFilters {
  status?: string
  priority?: string
  type?: string
  assignedTo?: string
  createdBy?: string
  department?: string
  dateFrom?: string
  dateTo?: string
}

export interface RequirementFilters {
  status?: string
  priority?: string
  type?: string
  assignedTo?: string
  createdBy?: string
  department?: string
  dateFrom?: string
  dateTo?: string
}

export interface DashboardMetrics {
  totalIncidents: number
  openIncidents: number
  inProgressIncidents: number
  resolvedIncidents: number
  closedIncidents: number
  totalRequirements: number
  pendingRequirements: number
  deliveredRequirements: number
  pendingRegistrations: number
  totalUsers: number
  averageResolutionTime: number
  topDepartments: Array<{ department: string; count: number }>
}

// =============================================================================
// DATA SERVICE - Servicio principal de datos
// =============================================================================

export class DataService {
  // =============================================================================
  // INCIDENTS - Gestión de incidencias
  // =============================================================================

  /**
   * Obtener incidencias con filtros y paginación
   */
  async getIncidents(params?: QueryParams & { filters?: IncidentFilters }): Promise<{
    data: IncidentWithUsers[]
    total: number
    error?: string
  }> {
    try {
      let query = supabase
        .from('incidents_with_times')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (params?.filters) {
        const filters = params.filters
        if (filters.status) query = query.eq('status', filters.status)
        if (filters.priority) query = query.eq('priority', filters.priority)
        if (filters.type) query = query.eq('type', filters.type)
        if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
        if (filters.createdBy) query = query.eq('created_by', filters.createdBy)
        if (filters.department) query = query.eq('affected_area_name', filters.department)
        if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
        if (filters.dateTo) query = query.lte('created_at', filters.dateTo)
      }

      // Aplicar búsqueda
      if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      }

      // Aplicar ordenamiento
      if (params?.sort) {
        query = query.order(params.sort.column, { 
          ascending: params.sort.direction === 'asc' 
        })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Aplicar paginación
      if (params?.page && params?.limit) {
        const offset = (params.page - 1) * params.limit
        query = query.range(offset, offset + params.limit - 1)
      }

      const { data, error, count } = await query

      if (error) {
        throw new Error(error.message)
      }

      return {
        data: data || [],
        total: count || 0
      }
    } catch (error) {
      console.error('❌ Error obteniendo incidencias:', error)
      return {
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Obtener incidencia por ID
   */
  async getIncident(id: string): Promise<IncidentWithUsers | null> {
    try {
      const { data, error } = await supabase
        .from('incidents_with_times')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error obteniendo incidencia:', error)
      return null
    }
  }

  /**
   * Crear nueva incidencia
   */
  async createIncident(incidentData: Inserts<'incidents'>): Promise<Incident> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert(incidentData)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error creando incidencia:', error)
      throw error
    }
  }

  /**
   * Actualizar incidencia
   */
  async updateIncident(id: string, updates: Partial<Updates<'incidents'>>): Promise<Incident> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error actualizando incidencia:', error)
      throw error
    }
  }

  /**
   * Eliminar incidencia
   */
  async deleteIncident(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('❌ Error eliminando incidencia:', error)
      throw error
    }
  }

  // =============================================================================
  // REQUIREMENTS - Gestión de requerimientos
  // =============================================================================

  /**
   * Obtener requerimientos con filtros y paginación
   */
  async getRequirements(params?: QueryParams & { filters?: RequirementFilters }): Promise<{
    data: RequirementWithUsers[]
    total: number
    error?: string
  }> {
    try {
      let query = supabase
        .from('requirements_with_times')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (params?.filters) {
        const filters = params.filters
        if (filters.status) query = query.eq('status', filters.status)
        if (filters.priority) query = query.eq('priority', filters.priority)
        if (filters.type) query = query.eq('type', filters.type)
        if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
        if (filters.createdBy) query = query.eq('created_by', filters.createdBy)
        if (filters.department) query = query.eq('requesting_area_name', filters.department)
        if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
        if (filters.dateTo) query = query.lte('created_at', filters.dateTo)
      }

      // Aplicar búsqueda
      if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      }

      // Aplicar ordenamiento
      if (params?.sort) {
        query = query.order(params.sort.column, { 
          ascending: params.sort.direction === 'asc' 
        })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Aplicar paginación
      if (params?.page && params?.limit) {
        const offset = (params.page - 1) * params.limit
        query = query.range(offset, offset + params.limit - 1)
      }

      const { data, error, count } = await query

      if (error) {
        throw new Error(error.message)
      }

      return {
        data: data || [],
        total: count || 0
      }
    } catch (error) {
      console.error('❌ Error obteniendo requerimientos:', error)
      return {
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Obtener requerimiento por ID
   */
  async getRequirement(id: string): Promise<RequirementWithUsers | null> {
    try {
      const { data, error } = await supabase
        .from('requirements_with_times')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error obteniendo requerimiento:', error)
      return null
    }
  }

  /**
   * Crear nuevo requerimiento
   */
  async createRequirement(requirementData: Inserts<'requirements'>): Promise<Requirement> {
    try {
      const { data, error } = await supabase
        .from('requirements')
        .insert(requirementData)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error creando requerimiento:', error)
      throw error
    }
  }

  /**
   * Actualizar requerimiento
   */
  async updateRequirement(id: string, updates: Partial<Updates<'requirements'>>): Promise<Requirement> {
    try {
      const { data, error } = await supabase
        .from('requirements')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error actualizando requerimiento:', error)
      throw error
    }
  }

  /**
   * Eliminar requerimiento
   */
  async deleteRequirement(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('requirements')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('❌ Error eliminando requerimiento:', error)
      throw error
    }
  }

  // =============================================================================
  // DEPARTMENTS - Gestión de departamentos
  // =============================================================================

  /**
   * Obtener departamentos activos
   */
  async getDepartments(): Promise<Department[]> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('❌ Error obteniendo departamentos:', error)
      throw error
    }
  }

  /**
   * Obtener roles activos
   */
  async getRoles(): Promise<Array<{ id: number; name: string; description: string }>> {
    try {
      // Simplificar la consulta para evitar problemas de stack depth
      const { data, error } = await supabase
        .from('roles')
        .select('id, name, description')
        .eq('is_active', true)

      if (error) {
        console.error('❌ Error en consulta de roles:', error)
        throw new Error(error.message)
      }

      // Ordenar en el cliente para evitar problemas de SQL
      const sortedData = (data || []).sort((a, b) => a.name.localeCompare(b.name))
      
      return sortedData
    } catch (error) {
      console.error('❌ Error obteniendo roles:', error)
      throw error
    }
  }

  // =============================================================================
  // ACTIVITIES - Gestión de actividades recientes
  // =============================================================================

  /**
   * Obtener actividades recientes
   */
  async getRecentActivities(limit: number = 10): Promise<ActivityWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('activities_with_users')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('❌ Error obteniendo actividades:', error)
      throw error
    }
  }

  /**
   * Crear nueva actividad
   */
  async createActivity(activityData: Inserts<'recent_activities'>): Promise<RecentActivity> {
    try {
      const { data, error } = await supabase
        .from('recent_activities')
        .insert(activityData)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error creando actividad:', error)
      throw error
    }
  }

  // =============================================================================
  // NOTIFICATIONS - Gestión de notificaciones
  // =============================================================================

  /**
   * Obtener notificaciones del usuario
   */
  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error)
      throw error
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error)
      throw error
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('❌ Error marcando todas las notificaciones como leídas:', error)
      throw error
    }
  }

  /**
   * Obtener conteo de notificaciones no leídas
   */
  async getUnreadNotificationsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        throw new Error(error.message)
      }

      return count || 0
    } catch (error) {
      console.error('❌ Error obteniendo conteo de notificaciones:', error)
      throw error
    }
  }

  // =============================================================================
  // REPORTS - Gestión de reportes
  // =============================================================================

  /**
   * Obtener reportes del usuario
   */
  async getReports(userId: string): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('❌ Error obteniendo reportes:', error)
      throw error
    }
  }

  /**
   * Crear nuevo reporte
   */
  async createReport(reportData: Inserts<'reports'>): Promise<Report> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error creando reporte:', error)
      throw error
    }
  }

  /**
   * Actualizar reporte
   */
  async updateReport(id: string, updates: Partial<Updates<'reports'>>): Promise<Report> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error actualizando reporte:', error)
      throw error
    }
  }

  // =============================================================================
  // DASHBOARD - Métricas del dashboard
  // =============================================================================

  /**
   * Obtener métricas del dashboard
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_metrics')

      if (error) {
        throw new Error(error.message)
      }

      // Si no hay datos, devolver métricas por defecto
      if (!data) {
        return {
          totalIncidents: 0,
          openIncidents: 0,
          inProgressIncidents: 0,
          resolvedIncidents: 0,
          closedIncidents: 0,
          totalRequirements: 0,
          pendingRequirements: 0,
          deliveredRequirements: 0,
          pendingRegistrations: 0,
          totalUsers: 0,
          averageResolutionTime: 0,
          topDepartments: [],
          userActivity: 0
        }
      }

      // Asegurar que todas las propiedades existan con valores por defecto
      const metrics = data as any
      return {
        totalIncidents: metrics.totalIncidents || 0,
        openIncidents: metrics.openIncidents || 0,
        inProgressIncidents: metrics.inProgressIncidents || 0,
        resolvedIncidents: metrics.resolvedIncidents || 0,
        closedIncidents: metrics.closedIncidents || 0,
        totalRequirements: metrics.totalRequirements || 0,
        pendingRequirements: metrics.pendingRequirements || 0,
        deliveredRequirements: metrics.deliveredRequirements || 0,
        pendingRegistrations: metrics.pendingRegistrations || 0,
        totalUsers: metrics.totalUsers || 0,
        averageResolutionTime: metrics.averageResolutionTime || 0,
        topDepartments: Array.isArray(metrics.topDepartments) ? metrics.topDepartments : [],
        userActivity: metrics.userActivity || 0
      }
    } catch (error) {
      console.error('❌ Error obteniendo métricas del dashboard:', error)
      
      // Devolver métricas por defecto en caso de error
      return {
        totalIncidents: 0,
        openIncidents: 0,
        inProgressIncidents: 0,
        resolvedIncidents: 0,
        closedIncidents: 0,
        totalRequirements: 0,
        pendingRequirements: 0,
        deliveredRequirements: 0,
        pendingRegistrations: 0,
        totalUsers: 0,
        averageResolutionTime: 0,
        topDepartments: [],
        userActivity: 0
      }
    }
  }

  // =============================================================================
  // UTILITY METHODS - Métodos de utilidad
  // =============================================================================

  /**
   * Crear notificación usando función de la base de datos
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'info',
    priority: string = 'medium'
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: title,
        p_message: message,
        p_type: type,
        p_priority: priority
      })

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error creando notificación:', error)
      throw error
    }
  }

  /**
   * Registrar actividad usando función de la base de datos
   */
  async logActivity(
    type: string,
    action: string,
    title: string,
    description: string,
    userId: string,
    itemId: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('log_activity', {
        p_type: type,
        p_action: action,
        p_title: title,
        p_description: description,
        p_user_id: userId,
        p_item_id: itemId
      })

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('❌ Error registrando actividad:', error)
      throw error
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE - Instancia única del servicio
// =============================================================================

export const dataService = new DataService()

// =============================================================================
// EXPORTS - Exportaciones principales
// =============================================================================

export default dataService 