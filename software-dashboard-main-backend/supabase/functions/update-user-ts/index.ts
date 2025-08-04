// =============================================================================
// UPDATE USER EDGE FUNCTION - Función para actualizar usuarios de forma segura
// Arquitectura de Software Profesional - Seguridad en Operaciones de Admin
// =============================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// =============================================================================
// TYPES - Tipos para la función
// =============================================================================

interface UpdateUserRequest {
  userId: string;
  updates: {
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    isActive?: boolean;
    password?: string;
  };
}

interface UpdateUserResponse {
  success: boolean;
  user?: any;
  error?: string;
}

// =============================================================================
// CORS HEADERS - Headers para CORS
// =============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// =============================================================================
// MAIN FUNCTION - Función principal
// =============================================================================

serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      throw new Error('Método no permitido');
    }

    // Obtener headers de autorización
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Header de autorización requerido');
    }

    // Crear cliente de Supabase con service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuración de Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar que el usuario que hace la petición está autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // Verificar que el usuario tiene permisos de administrador
    const { data: isAdminResult, error: isAdminError } = await supabase.rpc('is_admin', { u: user.id });
    
    if (isAdminError || !isAdminResult) {
      throw new Error('Acceso denegado: se requieren permisos de administrador');
    }

    // Obtener datos de la petición
    const { userId, updates }: UpdateUserRequest = await req.json();

    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    // Preparar datos de actualización para el perfil
    const profileUpdates: any = {};

    if (updates.name) profileUpdates.name = updates.name;
    if (updates.email) profileUpdates.email = updates.email;
    if (updates.isActive !== undefined) profileUpdates.is_active = updates.isActive;

    // Obtener department_id si se proporciona department
    if (updates.department) {
      const { data: department, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('short_name', updates.department)
        .single();

      if (deptError || !department) {
        // Fallback: buscar por nombre completo
        const { data: fallbackDept, error: fallbackError } = await supabase
          .from('departments')
          .select('id')
          .eq('name', updates.department)
          .single();

        if (fallbackError || !fallbackDept) {
          throw new Error(`Departamento "${updates.department}" no encontrado`);
        }
        profileUpdates.department_id = fallbackDept.id;
      } else {
        profileUpdates.department_id = department.id;
      }
    }

    // Obtener role_id si se proporciona role
    if (updates.role) {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', updates.role)
        .single();

      if (roleError || !role) {
        throw new Error(`Rol "${updates.role}" no encontrado`);
      }
      profileUpdates.role_id = role.id;
      profileUpdates.role_name = updates.role;
    }

    // Actualizar perfil en la tabla profiles
    if (Object.keys(profileUpdates).length > 0) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (profileError) {
        throw new Error(`Error actualizando perfil: ${profileError.message}`);
      }
    }

    // Actualizar contraseña si se proporciona
    if (updates.password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(userId, {
        password: updates.password
      });

      if (passwordError) {
        throw new Error(`Error actualizando contraseña: ${passwordError.message}`);
      }
    }

    // Obtener el perfil actualizado
    const { data: updatedProfile, error: getProfileError } = await supabase
      .from('profiles_with_roles')
      .select('*')
      .eq('id', userId)
      .single();

    if (getProfileError) {
      throw new Error(`Error obteniendo perfil actualizado: ${getProfileError.message}`);
    }

    // Registrar la actividad
    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'update_user',
      p_details: JSON.stringify({
        target_user_id: userId,
        updates: updates,
        updated_by: user.id
      })
    });

    // Respuesta exitosa
    const response: UpdateUserResponse = {
      success: true,
      user: updatedProfile
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error en update-user-ts:', error);

    const response: UpdateUserResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
}); 