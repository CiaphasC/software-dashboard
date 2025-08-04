# Sistema de Creación de Administrador con Edge Functions

## 🚀 Implementación Completada

Se ha implementado exitosamente un sistema de creación automática del usuario administrador que utiliza:

- **Edge Function**: `create-admin-user-ts` con `supabase.auth.signUp()`
- **Migración SQL**: `20250803234505_create_admin_user_fixed.sql` con `pg_net`
- **Sistema de Fallback**: Creación manual si la edge function falla

## 📁 Archivos Modificados/Creados

### Edge Function
- `supabase/functions/create-admin-user-ts/index.ts` - Función principal
- `supabase/functions/create-admin-user-ts/deno.json` - Configuración de dependencias

### Migración SQL
- `supabase/migrations/20250803234505_create_admin_user_fixed.sql` - Migración actualizada

### Documentación
- `docs/EDGE_FUNCTION_ADMIN_CREATION.md` - Documentación técnica completa
- `test-admin-creation.mjs` - Script de pruebas
- `README_ADMIN_CREATION.md` - Este archivo

## 🔧 Cómo Usar

### 1. Desarrollo Local

```bash
# Iniciar Supabase local
cd software-dashboard-main-backend
supabase start

# Aplicar migraciones (esto ejecutará automáticamente la creación del admin)
supabase db reset

# O aplicar migración específica
supabase db push
```

### 2. Probar Edge Function Manualmente

```bash
# Invocar la edge function directamente
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-admin-user-ts' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

### 3. Ejecutar Script de Pruebas

```bash
# Instalar dependencias si no están instaladas
npm install @supabase/supabase-js dotenv

# Ejecutar script de pruebas
node test-admin-creation.mjs
```

## 🔑 Credenciales del Administrador

- **Email**: `admin@empresa.com`
- **Contraseña**: `admin123`
- **Rol**: `admin`
- **Departamento**: `Gerencia`

## 🔄 Flujo de Ejecución

1. **Migración SQL** se ejecuta durante `supabase db reset`
2. **pg_net** invoca la **Edge Function** via HTTP POST
3. **Edge Function** usa `supabase.auth.signUp()` para crear el usuario
4. **Sistema de Fallback** se ejecuta si la edge function falla
5. **Logs detallados** muestran el progreso en cada paso

## 📊 Logs Esperados

Durante la ejecución verás logs como:

```
NOTICE:  🚀 Invocando edge function create-admin-user-ts...
NOTICE:  ✅ Edge function ejecutada exitosamente
NOTICE:  📄 Respuesta: {"success":true,"message":"Usuario administrador creado exitosamente"}
```

## 🛠️ Configuración de Variables de Entorno

### Para Desarrollo Local
```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Para Producción
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔍 Monitoreo

### Logs de Edge Function
```bash
# Ver logs en desarrollo local
supabase logs

# Ver logs específicos de la función
supabase logs --function create-admin-user-ts
```

### Logs de Migración
Los logs aparecen durante la ejecución de `supabase db reset` o `supabase db push`.

## 🚨 Solución de Problemas

### Error: "pg_net extension not found"
```sql
-- Ejecutar manualmente en la base de datos
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Error: "Edge function not found"
```bash
# Verificar que la función está desplegada
supabase functions list

# Redesplegar si es necesario
supabase functions deploy create-admin-user-ts
```

### Error: "Service role key not found"
```bash
# Verificar variables de entorno
echo $SUPABASE_SERVICE_ROLE_KEY

# Configurar en .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_key" >> .env
```

## 📈 Ventajas del Sistema Implementado

### ✅ Seguridad
- Usa `supabase.auth.signUp()` para creación segura
- Service role key para operaciones administrativas
- Validaciones robustas en múltiples niveles

### ✅ Confiabilidad
- Sistema de fallback automático
- Logging detallado para debugging
- Manejo de errores comprehensivo

### ✅ Mantenibilidad
- Código TypeScript bien estructurado
- Documentación completa
- Scripts de prueba incluidos

### ✅ Escalabilidad
- Edge functions se ejecutan en el edge de Supabase
- Invocación asíncrona via HTTP
- No bloquea la migración principal

## 🎯 Próximos Pasos

1. **Probar en entorno de desarrollo**
2. **Verificar logs y funcionamiento**
3. **Desplegar a producción**
4. **Monitorear ejecución en producción**

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs con `supabase logs`
2. Ejecutar script de pruebas: `node test-admin-creation.mjs`
3. Verificar documentación en `docs/EDGE_FUNCTION_ADMIN_CREATION.md`
4. Revisar configuración de variables de entorno 