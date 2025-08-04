// =============================================================================
// DELETE USER EDGE FUNCTION - Función para eliminar usuarios de forma segura
// Arquitectura de Software Profesional - Seguridad en Operaciones de Admin
// =============================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// =============================================================================
// TYPES - Tipos para la función
// =============================================================================

interface DeleteUserRequest {
  userId: string;
}

interface DeleteUserResponse {
  success: boolean;
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
    const { userId }: DeleteUserRequest = await req.json();

    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    // Verificar que no se está intentando eliminar a sí mismo
    if (userId === user.id) {
      throw new Error('No puedes eliminar tu propia cuenta');
    }

    // Obtener información del usuario antes de eliminarlo para el log
    const { data: userToDelete, error: getUserError } = await supabase
      .from('profiles_with_roles')
      .select('*')
      .eq('id', userId)
      .single();

    if (getUserError) {
      throw new Error(`Error obteniendo información del usuario: ${getUserError.message}`);
    }

    // Eliminar usuario de auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      throw new Error(`Error eliminando usuario: ${authError.message}`);
    }

    // Registrar la actividad
    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'delete_user',
      p_details: JSON.stringify({
        deleted_user_id: userId,
        deleted_user_info: userToDelete,
        deleted_by: user.id
      })
    });

    // Respuesta exitosa
    const response: DeleteUserResponse = {
      success: true
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error en delete-user-ts:', error);

    const response: DeleteUserResponse = {
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