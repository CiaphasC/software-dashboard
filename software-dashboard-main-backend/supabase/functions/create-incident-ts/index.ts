// supabase/functions/create-incident-ts/index.ts
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

                const requestBody = await req.json()
                console.log('🔍 create-incident-ts - Request body completo:', requestBody)
                
                const { incidentData } = requestBody
                console.log('🔍 create-incident-ts - incidentData extraído:', incidentData)

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
      throw new Error('Solo administradores y técnicos activos pueden crear incidencias')
    }

    // Validar datos requeridos
    console.log('🔍 create-incident-ts - Validando campos requeridos:')
    console.log('  - title:', incidentData.title)
    console.log('  - description:', incidentData.description)
    console.log('  - affected_area_id:', incidentData.affected_area_id)
    console.log('  - affected_area_id type:', typeof incidentData.affected_area_id)
    
    if (!incidentData.title || !incidentData.description || !incidentData.affected_area_id) {
      throw new Error('Faltan campos requeridos: título, descripción, área afectada')
    }
    
    // Convertir affected_area_id a number si es string
    let affectedAreaId = incidentData.affected_area_id;
    if (typeof affectedAreaId === 'string') {
      affectedAreaId = parseInt(affectedAreaId, 10);
      if (isNaN(affectedAreaId)) {
        throw new Error('El área afectada debe ser un ID válido');
      }
    }

    // Validar tipos de datos
    const validTypes = ['technical', 'software', 'hardware', 'network', 'other']
    const validPriorities = ['low', 'medium', 'high', 'urgent']

    if (incidentData.type && !validTypes.includes(incidentData.type)) {
      throw new Error(`Tipo de incidencia inválido. Valores permitidos: ${validTypes.join(', ')}`)
    }

    if (incidentData.priority && !validPriorities.includes(incidentData.priority)) {
      throw new Error(`Prioridad inválida. Valores permitidos: ${validPriorities.join(', ')}`)
    }

    // Verificar que el área afectada existe
    const { data: areaExists } = await supabase
      .from('departments')
      .select('id')
      .eq('id', affectedAreaId)
      .single()

    if (!areaExists) {
      throw new Error('El área afectada especificada no existe')
    }

    // Verificar que el usuario asignado existe (si se especifica)
    if (incidentData.assigned_to) {
      const { data: userExists } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', incidentData.assigned_to)
        .single()

      if (!userExists) {
        throw new Error('El usuario asignado especificado no existe')
      }
    }

    // Preparar datos de la incidencia
    const newIncidentData = {
      title: incidentData.title,
      description: incidentData.description,
      affected_area_id: affectedAreaId,
      type: incidentData.type || 'technical',
      priority: incidentData.priority || 'medium',
      status: 'open', // Estado inicial siempre es 'open'
      assigned_to: incidentData.assigned_to || null,
      created_by: user.id,
      // NO incluir estimated_resolution_date - se usará created_at automático
      // NO incluir review_started_at - se establecerá automáticamente por triggers
      // NO incluir resolved_at - se establecerá cuando cambie de estado
      // NO incluir campos de tiempo - se calcularán automáticamente
    }

    // Crear la incidencia
    const { data: newIncident, error: createError } = await supabase
      .from('incidents')
      .insert(newIncidentData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating incident:', createError)
      throw new Error(`Error al crear la incidencia: ${createError.message}`)
    }

    // Registrar actividad
    try {
      await supabase.rpc('log_activity', {
        p_type: 'incident',
        p_action: 'created',
        p_title: `Nueva incidencia creada: ${newIncidentData.title}`,
        p_description: `Incidencia "${newIncidentData.title}" creada por ${profile.role_name}`,
        p_user_id: user.id,
        p_item_id: newIncident.id
      })
    } catch (activityError) {
      console.warn('Error logging activity:', activityError)
      // No fallar la creación por error en el log
    }

    // Enviar notificación si hay asignado
    if (newIncidentData.assigned_to) {
      try {
        await supabase.rpc('create_notification', {
          p_user_id: newIncidentData.assigned_to,
          p_title: 'Nueva incidencia asignada',
          p_message: `Se te ha asignado la incidencia: ${newIncidentData.title}`,
          p_type: 'incident',
          p_priority: newIncidentData.priority
        })
      } catch (notificationError) {
        console.warn('Error creating notification:', notificationError)
        // No fallar la creación por error en la notificación
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      incident: newIncident,
      message: 'Incidencia creada exitosamente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })

  } catch (error) {
    console.error('Error in create-incident function:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 