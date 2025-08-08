// supabase/functions/create-requirement-ts/index.ts
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

    const { requirementData } = await req.json()

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
      throw new Error('Solo administradores y técnicos activos pueden crear requerimientos')
    }

    // Validar datos requeridos
    if (!requirementData.title || !requirementData.description || !requirementData.requesting_area_id) {
      throw new Error('Faltan campos requeridos: título, descripción, área solicitante')
    }

    // Validar tipos de datos
    const validTypes = ['document', 'equipment', 'service', 'other']
    const validPriorities = ['low', 'medium', 'high', 'urgent']

    if (requirementData.type && !validTypes.includes(requirementData.type)) {
      throw new Error(`Tipo de requerimiento inválido. Valores permitidos: ${validTypes.join(', ')}`)
    }

    if (requirementData.priority && !validPriorities.includes(requirementData.priority)) {
      throw new Error(`Prioridad inválida. Valores permitidos: ${validPriorities.join(', ')}`)
    }

    // Verificar que el área solicitante existe
    const { data: areaExists } = await supabase
      .from('departments')
      .select('id')
      .eq('id', requirementData.requesting_area_id)
      .single()

    if (!areaExists) {
      throw new Error('El área solicitante especificada no existe')
    }

    // Verificar que el usuario asignado existe (si se especifica)
    if (requirementData.assigned_to) {
      const { data: userExists } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', requirementData.assigned_to)
        .single()

      if (!userExists) {
        throw new Error('El usuario asignado especificado no existe')
      }
    }

    // Preparar datos del requerimiento
    const newRequirementData = {
      title: requirementData.title,
      description: requirementData.description,
      requesting_area_id: requirementData.requesting_area_id,
      type: requirementData.type || 'document',
      priority: requirementData.priority || 'medium',
      status: 'open', // Estado inicial siempre es 'open'
      assigned_to: requirementData.assigned_to || null,
      created_by: user.id,
      // NO incluir estimated_delivery_date - se usará created_at automático
      // NO incluir review_started_at - se establecerá automáticamente por triggers
      // NO incluir delivered_at - se establecerá cuando cambie de estado
      // NO incluir campos de tiempo - se calcularán automáticamente
    }

    // Crear el requerimiento
    const { data: newRequirement, error: createError } = await supabase
      .from('requirements')
      .insert(newRequirementData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating requirement:', createError)
      throw new Error(`Error al crear el requerimiento: ${createError.message}`)
    }

    // Registrar actividad
    try {
      await supabase.rpc('log_activity', {
        p_type: 'requirement',
        p_action: 'created',
        p_title: `Nuevo requerimiento creado: ${newRequirementData.title}`,
        p_description: `Requerimiento "${newRequirementData.title}" creado por ${profile.role_name}`,
        p_user_id: user.id,
        p_item_id: newRequirement.id
      })
    } catch (activityError) {
      console.warn('Error logging activity:', activityError)
      // No fallar la creación por error en el log
    }

    // Enviar notificación si hay asignado
    if (newRequirementData.assigned_to) {
      try {
        await supabase.rpc('create_notification', {
          p_user_id: newRequirementData.assigned_to,
          p_title: 'Nuevo requerimiento asignado',
          p_message: `Se te ha asignado el requerimiento: ${newRequirementData.title}`,
          p_type: 'requirement',
          p_priority: newRequirementData.priority
        })
      } catch (notificationError) {
        console.warn('Error creating notification:', notificationError)
        // No fallar la creación por error en la notificación
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      requirement: newRequirement,
      message: 'Requerimiento creado exitosamente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })

  } catch (error) {
    console.error('Error in create-requirement function:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 