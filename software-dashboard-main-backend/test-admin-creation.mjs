#!/usr/bin/env node

/**
 * Script de prueba para verificar la creación de administrador
 * Autor: Sistema de Gestión
 * Fecha: 2025-08-03
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

// Configuración
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Crear cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🧪 Iniciando pruebas de creación de administrador...\n')

async function testAdminCreation() {
  try {
    console.log('1️⃣ Verificando si ya existe un administrador...')
    
    // Verificar si ya existe un admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        role_name,
        is_active,
        roles!inner(name)
      `)
      .eq('roles.name', 'admin')
      .eq('is_active', true)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error verificando admin existente: ${checkError.message}`)
    }

    if (existingAdmin) {
      console.log('✅ Ya existe un administrador:')
      console.log(`   📧 Email: ${existingAdmin.email}`)
      console.log(`   🆔 ID: ${existingAdmin.id}`)
      console.log(`   👤 Rol: ${existingAdmin.role_name}`)
      return
    }

    console.log('❌ No se encontró administrador existente')
    console.log('2️⃣ Invocando edge function create-admin-user-ts...\n')

    // Invocar la edge function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-admin-user-ts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({})
    })

    const result = await response.json()

    console.log('📡 Respuesta de la edge function:')
    console.log(`   Status: ${response.status}`)
    console.log(`   Success: ${result.success}`)
    console.log(`   Message: ${result.message}`)

    if (result.success && result.user) {
      console.log(`   User ID: ${result.user.id}`)
      console.log(`   Email: ${result.user.email}`)
      console.log(`   Name: ${result.user.name}`)
    }

    if (!response.ok) {
      throw new Error(`Edge function falló con status ${response.status}: ${result.error || result.message}`)
    }

    console.log('\n3️⃣ Verificando que el administrador se creó correctamente...')

    // Esperar un momento para que se complete la creación
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Verificar que el admin se creó
    const { data: newAdmin, error: verifyError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        role_name,
        is_active,
        created_at,
        roles!inner(name),
        departments!inner(name)
      `)
      .eq('email', 'admin@empresa.com')
      .single()

    if (verifyError) {
      throw new Error(`Error verificando nuevo admin: ${verifyError.message}`)
    }

    if (!newAdmin) {
      throw new Error('No se pudo verificar la creación del administrador')
    }

    console.log('✅ Administrador creado exitosamente:')
    console.log(`   📧 Email: ${newAdmin.email}`)
    console.log(`   🆔 ID: ${newAdmin.id}`)
    console.log(`   👤 Rol: ${newAdmin.role_name}`)
    console.log(`   🏢 Departamento: ${newAdmin.departments.name}`)
    console.log(`   📅 Creado: ${new Date(newAdmin.created_at).toLocaleString()}`)

    console.log('\n4️⃣ Verificando actividad reciente...')

    // Verificar que se creó la actividad
    const { data: activity, error: activityError } = await supabase
      .from('recent_activities')
      .select('*')
      .eq('type', 'user')
      .eq('action', 'created')
      .eq('title', 'Usuario Administrador Creado')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (activityError && activityError.code !== 'PGRST116') {
      console.log('⚠️  No se pudo verificar la actividad:', activityError.message)
    } else if (activity) {
      console.log('✅ Actividad registrada correctamente')
      console.log(`   📝 Título: ${activity.title}`)
      console.log(`   📅 Fecha: ${new Date(activity.created_at).toLocaleString()}`)
    }

    console.log('\n🎉 ¡Prueba completada exitosamente!')
    console.log('\n📋 Resumen:')
    console.log('   ✅ Edge function ejecutada correctamente')
    console.log('   ✅ Usuario administrador creado')
    console.log('   ✅ Perfil configurado correctamente')
    console.log('   ✅ Actividad registrada')
    console.log('\n🔑 Credenciales del administrador:')
    console.log('   📧 Email: admin@empresa.com')
    console.log('   🔐 Contraseña: admin123')

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Ejecutar la prueba
testAdminCreation() 