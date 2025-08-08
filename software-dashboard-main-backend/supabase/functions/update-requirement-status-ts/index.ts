// supabase/functions/update-requirement-status/index.ts
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

    const { requirement_id, new_status, delivered_at } = await req.json()

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
      .select('role_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'technician'].includes(profile.role_name)) {
      throw new Error('Solo administradores y técnicos pueden cambiar estados')
    }

    // Preparar datos de actualización según el estado
    const updateData: any = {
      status: new_status,
      last_modified_by: user.id,
      last_modified_at: new Date().toISOString()
    };

    // Lógica especial para estados finales
    if (new_status === 'delivered' || new_status === 'closed' || new_status === 'completed') {
      // ✅ Estados finales: delivered, closed, completed - establecer delivered_at
      updateData.delivered_at = delivered_at || new Date().toISOString();
    }

    // Actualizar requerimiento directamente
    const { data, error } = await supabase
      .from('requirements')
      .update(updateData)
      .eq('id', requirement_id)
      .select()
      .single()

    if (error) throw error

    // Registrar actividad
    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'requirement_status_changed',
      p_details: JSON.stringify({
        requirement_id,
        previous_status: data.status,
        new_status: new_status,
        delivered_at: updateData.delivered_at
      })
    })

    // Enviar notificación en tiempo real
    await supabase.channel('requirements')
      .send({
        type: 'broadcast',
        event: 'requirement_status_updated',
        payload: { 
          requirement_id, 
          new_status, 
          updated_by: user.id,
          delivered_at: updateData.delivered_at
        }
      })

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      message: `Requerimiento marcado como ${new_status === 'delivered' ? 'entregado' : new_status === 'completed' ? 'completado' : 'cerrado'}`
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