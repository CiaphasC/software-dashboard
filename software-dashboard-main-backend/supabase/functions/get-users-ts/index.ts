import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener token de autorización
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token de autorización requerido')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verificar usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Obtener perfil del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role_name, department_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      throw new Error('Perfil de usuario no encontrado')
    }

    // Construir query base
    let query = supabase
      .from('profiles')
      .select('id, name, email, role_name, department_id')
      .eq('is_active', true)

    // Aplicar filtros según el rol del usuario
    if (userProfile.role_name === 'admin') {
      // Administradores ven todos los usuarios activos
      query = query.order('name')
    } else if (userProfile.role_name === 'technician') {
      // Técnicos ven SOLO su propio usuario
      query = query.eq('id', user.id)
    } else {
      // Requester solo ve administradores y técnicos
      query = query.in('role_name', ['admin', 'technician'])
        .order('name')
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      throw new Error('Error obteniendo usuarios')
    }

    // Formatear respuesta
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role_name: user.role_name,
      department_id: user.department_id
    }))

    return new Response(
      JSON.stringify({
        success: true,
        data: formattedUsers,
        message: 'Usuarios obtenidos exitosamente'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error en get-users:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error interno del servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 