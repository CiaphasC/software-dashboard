// =============================================================================
// AUTH SERVICE - Servicio de autenticación para Supabase
// Autenticación con Supabase Auth
// =============================================================================

import { supabase, supabaseAdmin } from './client'
import { logger } from '@/shared/utils/logger'
import type { 
  Profile, 
  RegistrationRequest, 
  ProfileWithRole,
  RegistrationRequestWithAdmin,
  Inserts,
  Updates 
} from './types'

// =============================================================================
// AUTH TYPES - Tipos específicos de autenticación
// =============================================================================

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  department: string
  isActive: boolean
  isEmailVerified: boolean
  avatarUrl?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  department: string
  requestedRole: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: string
  department: string
  isActive?: boolean
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: string
  department?: string
  isActive?: boolean
  password?: string
}

// =============================================================================
// AUTH SERVICE - Servicio principal de autenticación
// =============================================================================

export class AuthService {
  // =============================================================================
  // AUTHENTICATION METHODS - Métodos de autenticación
  // =============================================================================

  /**
   * Iniciar sesión con email y contraseña
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('Usuario no encontrado')
      }

      // Obtener perfil completo del usuario
      const profile = await this.getProfile(data.user.id)
      
      if (!profile) {
        throw new Error('Perfil de usuario no encontrado')
      }

      if (!profile.is_active) {
        throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.')
      }

      // Actualizar último login
      await this.updateLastLogin(data.user.id)

      return this.mapProfileToAuthUser(profile)
    } catch (error) {
      logger.error('❌ Error en login:', (error as Error).message)
      throw error
    }
  }

  /**
   * Registrar nuevo usuario (crea solicitud de registro)
   */
  async register(userData: RegisterData): Promise<void> {
    try {
      // ✅ USAR EDGE FUNCTION PARA REGISTRO PÚBLICO
      const { data, error } = await supabase.functions.invoke('register-user-ts', {
        body: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          department: userData.department,
          requestedRole: userData.requestedRole
        }
      });

      if (error) {
        throw new Error(`Error en Edge Function: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Error desconocido en el registro');
      }

      logger.info(`✅ Registro exitoso via Edge Function: ${data.message}`)
    } catch (error) {
      logger.error('❌ Error en registro:', (error as Error).message)
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      logger.error('❌ Error en logout:', (error as Error).message)
      throw error
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }

      const profile = await this.getProfile(user.id)
      return profile ? this.mapProfileToAuthUser(profile) : null
    } catch (error) {
      logger.error('❌ Error obteniendo usuario actual:', (error as Error).message)
      return null
    }
  }

  /**
   * Verificar sesión actual
   */
  async verifySession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        return false
      }

      // Verificar si el usuario existe y está activo
      const profile = await this.getProfile(session.user.id)
      return profile?.is_active ?? false
    } catch (error) {
      logger.error('❌ Error verificando sesión:', (error as Error).message)
      return false
    }
  }

  // =============================================================================
  // PROFILE MANAGEMENT - Gestión de perfiles
  // =============================================================================

  /**
   * Obtener perfil de usuario
   */
  async getProfile(userId: string): Promise<ProfileWithRole | null> {
    try {
      const { data, error } = await supabase
        .from('profiles_with_roles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        logger.error('❌ Error obteniendo perfil:', (error as any)?.message ?? String(error))
        return null
      }

      return data
    } catch (error) {
      logger.error('❌ Error obteniendo perfil:', (error as Error).message)
      return null
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId: string, updates: Partial<Updates<'profiles'>>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      logger.error('❌ Error actualizando perfil:', (error as Error).message)
      throw error
    }
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId)
    } catch (error) {
      logger.error('❌ Error actualizando último login:', (error as Error).message)
    }
  }

  // =============================================================================
  // USER MANAGEMENT - Gestión de usuarios (solo admin)
  // =============================================================================

  /**
   * Obtener todos los usuarios
   */
  async getUsers(): Promise<ProfileWithRole[]> {
    try {
      const { data, error } = await supabase
        .from('profiles_with_roles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      logger.error('❌ Error obteniendo usuarios:', (error as Error).message)
      throw error
    }
  }

  /**
   * Crear usuario (solo admin)
   */
  async createUser(userData: CreateUserData): Promise<Profile> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const { HttpClient } = await import('@/shared/services/http/httpClient');
      const client = new httpClient.HttpClient(import.meta.env.VITE_SUPABASE_URL + '/functions/v1');
      const result = await client.request<{ success: boolean; user: { id: string } }>('create-user-ts', {
        method: 'POST',
        body: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          department: userData.department,
          isActive: userData.isActive ?? true
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });
      if (!result.success) throw new Error('Error creando usuario');
      const profile = await this.getProfile(result.user.id);
      if (!profile) throw new Error('Error obteniendo perfil del usuario creado');
      return profile;
    } catch (error) {
      logger.error('❌ Error creando usuario:', (error as Error).message)
      throw error;
    }
  }

  /**
   * Actualizar usuario (solo admin)
   */
  async updateUser(userId: string, updates: UpdateUserData): Promise<Profile> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const { httpClient } = await import('@/shared/services/http/httpClient');
      const client = new httpClient.HttpClient(import.meta.env.VITE_SUPABASE_URL + '/functions/v1');
      const result = await client.request<{ success: boolean; user: Profile }>('update-user-ts', {
        method: 'POST',
        body: { userId, updates },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });
      if (!result.success) throw new Error('Error actualizando usuario');
      return result.user;
    } catch (error) {
      logger.error('❌ Error actualizando usuario:', (error as Error).message)
      throw error;
    }
  }

  /**
   * Eliminar usuario (solo admin)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const { httpClient } = await import('@/shared/services/http/httpClient');
      const client = new httpClient.HttpClient(import.meta.env.VITE_SUPABASE_URL + '/functions/v1');
      const result = await client.request<{ success: boolean }>('delete-user-ts', {
        method: 'POST',
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });
      if (!result.success) throw new Error('Error eliminando usuario');
    } catch (error) {
      logger.error('❌ Error eliminando usuario:', (error as Error).message)
      throw error;
    }
  }

  // =============================================================================
  // REGISTRATION REQUESTS - Gestión de solicitudes de registro
  // =============================================================================

  /**
   * Obtener solicitudes de registro pendientes
   */
  async getPendingRegistrationRequests(): Promise<RegistrationRequestWithAdmin[]> {
    try {
      const { data, error } = await supabase
        .from('registration_requests_with_admin')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      logger.error('❌ Error obteniendo solicitudes pendientes:', (error as Error).message)
      throw error
    }
  }

  /**
   * Obtener conteo de solicitudes pendientes
   */
  async getPendingRegistrationRequestsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('registration_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (error) {
        throw new Error(error.message)
      }

      return count || 0
    } catch (error) {
      logger.error('❌ Error obteniendo conteo de solicitudes:', (error as Error).message)
      throw error
    }
  }

  /**
   * Aprobar solicitud de registro
   * Si el usuario solicitó rol de 'requester', automáticamente se le asigna 'technician'
   */
  async approveRegistrationRequest(requestId: string, adminId: string, roleName?: string): Promise<void> {
    try {
      // Primero obtener la solicitud para tener los datos del usuario
      const { data: request, error: requestError } = await supabase
        .from('registration_requests')
        .select('*')
        .eq('id', requestId)
        .eq('status', 'pending')
        .single()

      if (requestError || !request) {
        throw new Error('Solicitud no encontrada o ya procesada')
      }

      // 🔑 DETERMINAR EL ROL FINAL
      // Si el usuario solicitó ser 'requester', automáticamente se le asigna 'technician'
      // Si se especifica un rol personalizado, usar ese
      let finalRoleName = roleName || request.requested_role;
      
      // Lógica especial: si el usuario solicitó ser solicitante, promoverlo a técnico
      if (finalRoleName === 'requester') {
        finalRoleName = 'technician';
        logger.info(`🔄 Usuario solicitante promovido automáticamente a técnico: ${request.name}`)
      }

      // 🔑 CREAR USUARIO REAL VIA EDGE FUNCTION (usa Service Role en el servidor)
      const { httpClient } = await import('@/shared/services/http/httpClient');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      // Obtener short_name del departamento desde id de la solicitud
      let deptShortName: string | null = null;
      if (request.department_id) {
        const { data: dept } = await supabase
          .from('departments')
          .select('short_name')
          .eq('id', request.department_id)
          .single();
        deptShortName = dept?.short_name ?? null;
      }

      const client = new HttpClient((import.meta.env.VITE_SUPABASE_URL as string) + '/functions/v1');
      const createRes = await client.request<{ success: boolean; user?: { id: string } }>('create-user-ts', {
        method: 'POST',
        body: {
          name: request.name,
          email: request.email,
          password: request.password,
          role: finalRoleName,
          // La Edge Function espera short_name del departamento
          department: deptShortName ?? request.department_short_name ?? 'general',
          isActive: true,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        timeoutMs: 30000,
      });

      if (!createRes.ok || !createRes.data?.success || !createRes.data.user?.id) {
        throw new Error(createRes.data?.error || 'Error creando usuario (Edge Function)');
      }

      // Obtener el ID del rol final
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('name', finalRoleName)
        .single()

      if (!role) {
        throw new Error(`Rol ${finalRoleName} no encontrado`)
      }

      // Actualizar el perfil creado automáticamente por el trigger
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role_id: role.id,
          role_name: finalRoleName,
          department_id: request.department_id,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', createRes.data.user.id)

      if (profileError) {
        throw new Error(`Error actualizando perfil: ${profileError.message}`)
      }

      // Llamar a la función de la base de datos para actualizar el estado de la solicitud
      const { error: functionError } = await supabase.rpc('approve_registration_request', {
        p_request_id: requestId,
        p_admin_id: adminId,
        p_role_name: finalRoleName
      })

      if (functionError) {
        throw new Error(`Error actualizando solicitud: ${functionError.message}`)
      }

      // Crear notificación para el usuario aprobado
      const notificationMessage = finalRoleName === 'technician' && request.requested_role === 'requester'
        ? 'Tu solicitud de registro ha sido aprobada. Has sido promovido al rol de Técnico. Ya puedes iniciar sesión en el sistema.'
        : 'Tu solicitud de registro ha sido aprobada. Ya puedes iniciar sesión en el sistema.';

      await supabase.rpc('create_notification', {
        p_user_id: createRes.data.user.id,
        p_title: 'Cuenta Aprobada',
        p_message: notificationMessage,
        p_type: 'success',
        p_priority: 'high'
      })

    } catch (error) {
      logger.error('❌ Error aprobando solicitud:', (error as Error).message)
      throw error
    }
  }

  /**
   * Rechazar solicitud de registro
   */
  async rejectRegistrationRequest(requestId: string, adminId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('reject_registration_request', {
        p_request_id: requestId,
        p_admin_id: adminId,
        p_reason: reason
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      logger.error('❌ Error rechazando solicitud:', (error as Error).message)
      throw error
    }
  }

  // =============================================================================
  // UTILITY METHODS - Métodos de utilidad
  // =============================================================================

  /**
   * Obtener ID de departamento por nombre
   */
  private async getDepartmentId(departmentShortName: string): Promise<number> {
    logger.debug(`🔍 Buscando departamento con short_name: "${departmentShortName}"`)
    
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, short_name')
      .eq('short_name', departmentShortName)
      .single()

    if (error) {
      logger.error(`❌ Error buscando departamento "${departmentShortName}": ${(error as Error).message}`)
      
      // Intentar buscar por nombre completo como fallback
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('departments')
        .select('id, name, short_name')
        .eq('name', departmentShortName)
        .single()
      
      if (fallbackError || !fallbackData) {
        logger.error(`❌ También falló la búsqueda por nombre completo "${departmentShortName}": ${(fallbackError as Error).message}`)
        
        // Listar todos los departamentos disponibles para depuración
        const { data: allDepartments } = await supabase
          .from('departments')
          .select('id, name, short_name')
          .order('name');
        
        logger.debug(`📋 Departamentos disponibles: ${allDepartments?.length ?? 0}`)
        throw new Error(`Departamento "${departmentShortName}" no encontrado. Departamentos disponibles: ${allDepartments?.map(d => `${d.name} (${d.short_name})`).join(', ')}`);
      }
      
      logger.info(`✅ Departamento encontrado por nombre completo: ${fallbackData.name} (${fallbackData.short_name})`)
      return fallbackData.id;
    }

    if (!data) {
      throw new Error(`Departamento "${departmentShortName}" no encontrado`);
    }

    logger.info(`✅ Departamento encontrado: ${data.name} (${data.short_name})`)
    return data.id;
  }

  /**
   * Mapear perfil a usuario de autenticación
   */
  private mapProfileToAuthUser(profile: ProfileWithRole): AuthUser {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role_name,
      department: profile.department_name || 'Sin departamento',
      isActive: profile.is_active,
      isEmailVerified: profile.is_email_verified,
      avatarUrl: profile.avatar_url || undefined,
      lastLoginAt: profile.last_login_at || undefined,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      logger.error('❌ Error cambiando contraseña:', (error as Error).message)
      throw error
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      logger.error('❌ Error enviando email de recuperación:', (error as Error).message)
      throw error
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE - Instancia única del servicio
// =============================================================================

export const authService = new AuthService()

// =============================================================================
// EXPORTS - Exportaciones principales
// =============================================================================

export default authService 