// supabase/functions/update-incident-ts/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { incident_id, updates, action } = await req.json()

    // Verificar permisos del usuario
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No autorizado')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Verificar rol del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_name, is_active')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.is_active || !['admin', 'technician'].includes(profile.role_name)) {
      throw new Error('Solo administradores y técnicos activos pueden editar incidencias')
    }

    // Si es una solicitud para obtener permisos de renderizado
    if (action === 'get_permissions') {
      const permissions = getRenderPermissions(profile.role_name, incident_id);
      return new Response(JSON.stringify({ 
        success: true, 
        permissions 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Obtener incidencia actual
    const { data: currentIncident, error: fetchError } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incident_id)
      .single()

    if (fetchError || !currentIncident) {
      throw new Error('Incidencia no encontrada')
    }

    // Validar permisos específicos según el rol
    const validationResult = validateUpdatePermissions(
      profile.role_name, 
      currentIncident, 
      updates
    )

    if (!validationResult.allowed) {
      throw new Error(validationResult.error)
    }

    // Preparar datos de actualización con lógica de estados
    const updateData = {
      ...updates,
      last_modified_by: user.id,
      last_modified_at: new Date().toISOString()
    };

    // Lógica especial para cambios de estado
    if (updates.status) {
      if (updates.status === 'completed' || updates.status === 'closed' || updates.status === 'delivered') {
        // ✅ Estados finales: completed, closed, delivered - establecer resolved_at
        updateData.resolved_at = new Date().toISOString();
      }
    }

    // Actualizar incidencia
    const { data, error } = await supabase
      .from('incidents')
      .update(updateData)
      .eq('id', incident_id)
      .select()
      .single()

    if (error) throw error

    // Registrar actividad
    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'incident_updated',
      p_details: JSON.stringify({
        incident_id,
        changes: updates,
        previous_status: currentIncident.status,
        new_status: updates.status || currentIncident.status
      })
    })

    // Enviar notificación en tiempo real
    await supabase.channel('incidents')
      .send({
        type: 'broadcast',
        event: 'incident_updated',
        payload: { 
          incident_id, 
          updated_by: user.id,
          changes: updates 
        }
      })

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      message: 'Incidencia actualizada correctamente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// Función para determinar permisos de renderizado según el rol
function getRenderPermissions(userRole: string, incidentId?: string) {
  if (userRole === 'admin') {
    return {
      allowedFields: ['title', 'description', 'type', 'priority', 'status', 'affectedArea', 'assignedTo'],
      canEditStatus: true,
      canEditArea: true,
      canEditContent: true,
      isReadOnly: false,
      message: 'Administrador con permisos completos'
    }
  }
  
  if (userRole === 'technician') {
    // Para técnicos, los permisos dependen del estado de la incidencia
    // Si no hay incidentId, asumimos que es una nueva incidencia
    if (!incidentId) {
      return {
        allowedFields: ['title', 'description', 'type', 'priority', 'assignedTo'],
        canEditStatus: false,
        canEditArea: true,
        canEditContent: true,
        isReadOnly: false,
        message: 'Técnico puede crear incidencias'
      }
    }
    
    // Para incidencias existentes, necesitamos verificar el estado
    // Esto se manejará en el frontend cuando se cargue la incidencia
    return {
      allowedFields: ['title', 'description', 'type', 'priority', 'assignedTo'],
      canEditStatus: false,
      canEditArea: false,
      canEditContent: false, // Se determinará según el estado
      isReadOnly: false, // Se determinará según el estado
      message: 'Técnico con permisos limitados'
    }
  }
  
  return {
    allowedFields: [],
    canEditStatus: false,
    canEditArea: false,
    canEditContent: false,
    isReadOnly: true,
    message: 'Usuario sin permisos'
  }
}

// Función para validar permisos de actualización
function validateUpdatePermissions(userRole: string, currentIncident: any, updates: any) {
  if (userRole === 'admin') {
    return { allowed: true, error: null }
  }
  
  if (userRole === 'technician') {
    // Técnicos solo pueden editar si la incidencia está abierta
    if (currentIncident.status !== 'open') {
      return { 
        allowed: false, 
        error: 'Solo puedes editar incidencias en estado abierto' 
      }
    }
    
    // Técnicos no pueden cambiar el estado
    if (updates.status && updates.status !== currentIncident.status) {
      return { 
        allowed: false, 
        error: 'Los técnicos no pueden cambiar el estado de las incidencias' 
      }
    }
    
    // Técnicos no pueden cambiar el área afectada
    if (updates.affected_area_id && updates.affected_area_id !== currentIncident.affected_area_id) {
      return { 
        allowed: false, 
        error: 'Los técnicos no pueden cambiar el área afectada' 
      }
    }
    
    return { allowed: true, error: null }
  }
  
  return { 
    allowed: false, 
    error: 'Usuario sin permisos para esta acción' 
  }
} 