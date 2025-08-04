// Edge Function para crear usuario administrador usando supabase.auth.signUp()
// Autor: Sistema de Gestión
// Fecha: 2025-08-03

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuración de la función
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener variables de entorno
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Faltan variables de entorno requeridas')
    }

    // Crear cliente Supabase con service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Datos del administrador
    const adminData = {
      email: 'admin@empresa.com',
      password: 'admin123',
      options: {
        data: {
          name: 'Administrador del Sistema',
          role: 'admin',
          department: 'Gerencia'
        }
      }
    }

    // Crear usuario usando supabase.auth.signUp()
    const { data: authData, error: authError } = await supabase.auth.signUp(adminData)

    if (authError) {
      console.error('Error en signUp:', authError)
      throw new Error(`Error creando usuario: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario')
    }

    const userId = authData.user.id

    // Obtener IDs necesarios de la base de datos
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .eq('is_active', true)
      .single()

    if (roleError || !roleData) {
      throw new Error('No se encontró el rol admin')
    }

    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('name', 'Gerencia')
      .single()

    if (deptError || !deptData) {
      throw new Error('No se encontró el departamento Gerencia')
    }

    // Actualizar el perfil del usuario
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role_id: roleData.id,
        role_name: 'admin',
        department_id: deptData.id,
        is_active: true,
        is_email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error actualizando perfil:', profileError)
      throw new Error(`Error actualizando perfil: ${profileError.message}`)
    }

    // Crear actividad de registro
    const { error: activityError } = await supabase
      .from('recent_activities')
      .insert({
        type: 'user',
        action: 'created',
        title: 'Usuario Administrador Creado',
        description: 'Usuario administrador creado automáticamente durante la instalación del sistema',
        user_id: userId,
        item_id: userId
      })

    if (activityError) {
      console.error('Error creando actividad:', activityError)
      // No lanzar error aquí, es opcional
    }

    console.log('✅ Usuario administrador creado exitosamente')
    console.log('📧 Email:', adminData.email)
    console.log('🔑 Contraseña:', adminData.password)
    console.log('🆔 User ID:', userId)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuario administrador creado exitosamente',
        user: {
          id: userId,
          email: adminData.email,
          name: adminData.options.data.name
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error en create-admin-user:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Error creando usuario administrador'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
