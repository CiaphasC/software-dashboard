# Sistema de Creación de Administrador con Edge Functions

## Descripción General

Este sistema implementa la creación automática del usuario administrador durante la migración de la base de datos utilizando una **Edge Function** de Supabase que se invoca mediante un **trigger** y **pg_net**.

## Arquitectura

### Componentes Principales

1. **Edge Function**: `create-admin-user-ts`
   - Ubicación: `supabase/functions/create-admin-user-ts/index.ts`
   - Utiliza `supabase.auth.signUp()` para crear el usuario
   - Maneja la configuración del perfil y roles

2. **Migración SQL**: `20250803234505_create_admin_user_fixed.sql`
   - Utiliza `pg_net` para invocar la edge function
   - Incluye sistema de fallback manual
   - Maneja errores y logging

## Flujo de Ejecución

### 1. Migración SQL
```sql
-- Habilitar pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Función principal que invoca la edge function
CREATE OR REPLACE FUNCTION create_admin_user_via_edge_function()
```

### 2. Invocación de Edge Function
```sql
-- Usando pg_net para hacer HTTP POST
SELECT status, content FROM net.http_post(
  url := supabase_url || '/functions/v1/create-admin-user-ts',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || supabase_anon_key,
    'apikey', supabase_anon_key
  ),
  body := '{}'::jsonb
);
```

### 3. Edge Function
```typescript
// Crear usuario usando supabase.auth.signUp()
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: 'admin@empresa.com',
  password: 'admin123',
  options: {
    data: {
      name: 'Administrador del Sistema',
      role: 'admin',
      department: 'Gerencia'
    }
  }
});
```

## Ventajas del Sistema

### ✅ Beneficios de usar Edge Functions

1. **Seguridad**: La lógica de creación está aislada en la edge function
2. **Flexibilidad**: Fácil de modificar sin tocar la base de datos
3. **Escalabilidad**: Las edge functions se ejecutan en el edge de Supabase
4. **Mantenibilidad**: Código TypeScript más fácil de mantener que SQL complejo

### ✅ Beneficios de usar pg_net

1. **Integración**: Invocación directa desde PostgreSQL
2. **Transaccional**: Se ejecuta dentro del contexto de la migración
3. **Fallback**: Sistema de respaldo si la edge function falla
4. **Logging**: Logs detallados del proceso

## Configuración

### Variables de Entorno Requeridas

La edge function requiere las siguientes variables de entorno:

```bash
SUPABASE_URL=http://127.0.0.1:54321  # Para desarrollo local
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Configuración de pg_net

```sql
-- Habilitar la extensión
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configurar variables de aplicación (opcional)
ALTER DATABASE postgres SET "app.settings.supabase_url" = 'http://127.0.0.1:54321';
ALTER DATABASE postgres SET "app.settings.supabase_anon_key" = 'your_anon_key';
```

## Manejo de Errores

### Sistema de Fallback

Si la edge function falla, el sistema automáticamente:

1. **Registra el error** en los logs
2. **Ejecuta el fallback manual** usando SQL directo
3. **Crea el usuario** con los mismos datos
4. **Continúa la migración** sin interrupciones

### Logging Detallado

```sql
RAISE NOTICE '🚀 Invocando edge function create-admin-user-ts...';
RAISE NOTICE '✅ Edge function ejecutada exitosamente';
RAISE NOTICE '⚠️  Edge function devolvió status: %', response_status;
```

## Datos del Administrador

### Credenciales por Defecto

- **Email**: `admin@empresa.com`
- **Contraseña**: `admin123`
- **Rol**: `admin`
- **Departamento**: `Gerencia`

### Metadatos del Usuario

```json
{
  "name": "Administrador del Sistema",
  "role": "admin",
  "department": "Gerencia"
}
```

## Desarrollo Local

### Ejecutar Edge Function Localmente

```bash
# Iniciar Supabase local
supabase start

# Invocar la edge function
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-admin-user-ts' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

### Ejecutar Migración

```bash
# Aplicar migraciones
supabase db reset

# O aplicar migración específica
supabase db push
```

## Monitoreo y Debugging

### Logs de Edge Function

Los logs se pueden ver en:
- **Desarrollo local**: `supabase logs`
- **Producción**: Dashboard de Supabase > Functions > Logs

### Logs de Migración

Los logs de la migración aparecen durante la ejecución:

```sql
NOTICE:  🚀 Invocando edge function create-admin-user-ts...
NOTICE:  ✅ Edge function ejecutada exitosamente
NOTICE:  📄 Respuesta: {"success":true,"message":"Usuario administrador creado exitosamente"}
```

## Consideraciones de Seguridad

### Service Role Key

- La edge function usa `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS
- Solo se debe usar para operaciones administrativas
- Nunca exponer en el cliente

### Validaciones

- Verificación de existencia previa del admin
- Validación de roles y departamentos
- Manejo de errores robusto

## Mantenimiento

### Actualizar Edge Function

```bash
# Desplegar cambios
supabase functions deploy create-admin-user-ts

# O para desarrollo local
supabase functions serve create-admin-user-ts
```

### Modificar Datos del Admin

Para cambiar las credenciales del administrador, editar en:
- `supabase/functions/create-admin-user-ts/index.ts` (líneas 47-55)

### Agregar Validaciones

Las validaciones adicionales se pueden agregar en:
- La edge function (TypeScript)
- La migración SQL (PostgreSQL)
- Ambas para redundancia 