# Filtrado de Usuarios por Seguridad - Edge Function get-users

## 🔒 Descripción

El edge function `get-users` implementa un sistema de filtrado de seguridad que restringe qué usuarios puede ver cada rol en la aplicación, mejorando la privacidad y seguridad de los datos.

## 🎯 Comportamiento por Rol

### 👑 Administradores (`admin`)
- **Pueden ver**: Todos los usuarios activos en el sistema
- **Uso**: Control total para asignar incidencias y requerimientos
- **Ejemplo**: Lista completa de usuarios para gestión

### 🔧 Técnicos (`technician`)
- **Pueden ver**: SOLO su propio usuario
- **Uso**: Auto-asignación de incidencias
- **Ejemplo**: Solo aparece su nombre en el dropdown

### 👤 Requesters (`requester`)
- **Pueden ver**: Administradores y técnicos
- **Uso**: Asignar incidencias a personal autorizado
- **Ejemplo**: Lista de personal técnico disponible

## 🔧 Implementación Técnica

### Edge Function: `get-users-ts/index.ts`

```typescript
// Obtener perfil del usuario que hace la petición
const { data: userProfile } = await supabase
  .from('profiles')
  .select('role_name, department_id')
  .eq('id', user.id)
  .single()

// Aplicar filtros según el rol
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
```

### Frontend: Hook `useFilteredUsersData`

```typescript
export const useFilteredUsersData = (userRole?: string) => {
  return useFormData<User>({
    loadFunction: async () => {
      // El edge function ya maneja el filtrado según el rol
      // No necesitamos filtrar en el frontend
      return await edgeFunctionsService.getUsers();
    },
    dependencies: [userRole]
  });
};
```

## 📊 Ejemplos de Respuesta

### Para Administrador:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Administrador del Sistema",
      "email": "admin@example.com",
      "role_name": "admin",
      "department_id": 1
    },
    {
      "id": "uuid-2", 
      "name": "Técnico Juan",
      "email": "juan@example.com",
      "role_name": "technician",
      "department_id": 2
    },
    {
      "id": "uuid-3",
      "name": "Usuario María",
      "email": "maria@example.com", 
      "role_name": "requester",
      "department_id": 3
    }
  ]
}
```

### Para Técnico:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-2",
      "name": "Técnico Juan", 
      "email": "juan@example.com",
      "role_name": "technician",
      "department_id": 2
    }
  ]
}
```

### Para Requester:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Administrador del Sistema",
      "email": "admin@example.com",
      "role_name": "admin",
      "department_id": 1
    },
    {
      "id": "uuid-2",
      "name": "Técnico Juan", 
      "email": "juan@example.com",
      "role_name": "technician",
      "department_id": 2
    }
  ]
}
```

## 🛡️ Beneficios de Seguridad

### ✅ Privacidad de Datos
- Los técnicos no pueden ver información personal de otros usuarios
- Los requesters solo ven personal autorizado para asignaciones

### ✅ Control de Acceso
- El filtrado se implementa en el backend (más seguro)
- No se puede eludir desde el frontend
- Basado en el token de autenticación del usuario

### ✅ Cumplimiento
- Cumple con principios de menor privilegio
- Protege información sensible de usuarios
- Facilita auditorías de seguridad

## 🔄 Casos de Uso

### 📝 Creación de Incidencias
- **Admin**: Puede asignar a cualquier usuario
- **Técnico**: Solo puede auto-asignarse
- **Requester**: Puede asignar a admins y técnicos

### 📋 Gestión de Requerimientos
- **Admin**: Control total de asignaciones
- **Técnico**: Auto-asignación de tareas
- **Requester**: Asignación a personal técnico

### 👥 Gestión de Usuarios
- **Admin**: Vista completa para administración
- **Técnico**: Vista limitada (solo su perfil)
- **Requester**: Vista de personal autorizado

## 🚀 Implementación en Formularios

### Dropdown de Usuarios
```typescript
const IncidentForm = () => {
  const { users } = useIncidentFormData(userRole);
  
  return (
    <select>
      <option value="">Selecciona un usuario</option>
      {users.map(user => (
        <option key={user.id} value={user.id}>
          {user.name} ({user.role_name})
        </option>
      ))}
    </select>
  );
};
```

### Comportamiento Dinámico
- **Admin**: Dropdown con todos los usuarios
- **Técnico**: Dropdown con solo su usuario (auto-seleccionado)
- **Requester**: Dropdown con admins y técnicos

### Auto-Selección Inteligente
El formulario implementa auto-selección basada en el rol:

```typescript
// Para técnicos: auto-selecciona su usuario
if (user?.role_name === 'technician' && users.length === 1) {
  const technicianUser = users[0];
  setValue('assignedTo', technicianUser.id);
  usersDropdown.handleSelect(technicianUser.id);
}
// Para otros roles: selecciona el primer usuario disponible
else if (users.length > 0) {
  const firstUser = users[0];
  setValue('assignedTo', firstUser.id);
  usersDropdown.handleSelect(firstUser.id);
}
```

### 📱 Ejemplos Visuales del Comportamiento

#### 🔧 Técnico - Formulario de Nueva Incidencia:
```
┌─────────────────────────────────────┐
│ 📝 Nueva Incidencia                │
├─────────────────────────────────────┤
│ Título: [________________]         │
│ Descripción: [________________]    │
│ Área Afectada: [Administración ▼] │
│ Asignado a: [Técnico Juan ▼] ✅   │ ← Auto-seleccionado
│ Tipo: [Técnico ▼]                 │
│ Prioridad: [Media ▼]              │
└─────────────────────────────────────┘
```

#### 👑 Administrador - Formulario de Nueva Incidencia:
```
┌─────────────────────────────────────┐
│ 📝 Nueva Incidencia                │
├─────────────────────────────────────┤
│ Título: [________________]         │
│ Descripción: [________________]    │
│ Área Afectada: [Administración ▼] │
│ Asignado a: [Admin del Sistema ▼] ✅ ← Primer usuario
│ Tipo: [Técnico ▼]                 │
│ Prioridad: [Media ▼]              │
└─────────────────────────────────────┘
```

#### 👤 Requester - Formulario de Nueva Incidencia:
```
┌─────────────────────────────────────┐
│ 📝 Nueva Incidencia                │
├─────────────────────────────────────┤
│ Título: [________________]         │
│ Descripción: [________________]    │
│ Área Afectada: [Administración ▼] │
│ Asignado a: [Admin del Sistema ▼] ✅ ← Primer admin/técnico
│ Tipo: [Técnico ▼]                 │
│ Prioridad: [Media ▼]              │
└─────────────────────────────────────┘
```

## 🔧 Configuración y Mantenimiento

### Agregar Nuevos Roles
Para agregar nuevos roles, modificar la lógica en el edge function:

```typescript
if (userProfile.role_name === 'admin') {
  // Lógica para admin
} else if (userProfile.role_name === 'technician') {
  // Lógica para técnico
} else if (userProfile.role_name === 'supervisor') {
  // Nueva lógica para supervisor
} else {
  // Lógica por defecto
}
```

### Testing
```bash
# Probar con diferentes roles
curl -H "Authorization: Bearer ADMIN_TOKEN" /functions/v1/get-users-ts
curl -H "Authorization: Bearer TECHNICIAN_TOKEN" /functions/v1/get-users-ts
curl -H "Authorization: Bearer REQUESTER_TOKEN" /functions/v1/get-users-ts
```

## 📝 Notas de Implementación

- ✅ El filtrado es transparente para el frontend
- ✅ No requiere cambios en los componentes existentes
- ✅ Mantiene la funcionalidad de asignación
- ✅ Mejora la seguridad sin afectar la UX
- ✅ Fácil de mantener y extender

## 🎯 Resumen de la Solución Implementada

### ✅ Problema Resuelto:
**"¿Por qué no aparece de frente el nombre del usuario seleccionado por defecto?"**

### 🔧 Solución Implementada:

1. **Filtrado Backend**: El edge function `get-users` filtra usuarios según el rol
2. **Auto-Selección Frontend**: El hook `useIncidentForm` auto-selecciona el usuario apropiado
3. **Sincronización Automática**: `useEffect` sincroniza el dropdown cuando se cargan los datos

### 🚀 Comportamiento Final:

**🔧 Para Técnicos:**
- Edge function devuelve: `[{"id": "uuid-2", "name": "Técnico Juan"}]`
- Frontend auto-selecciona: `"Técnico Juan"`
- Resultado: ✅ Usuario aparece seleccionado por defecto

**👑 Para Administradores:**
- Edge function devuelve: `[admin1, admin2, technician1, ...]`
- Frontend auto-selecciona: `"Admin del Sistema"` (primer usuario)
- Resultado: ✅ Usuario aparece seleccionado por defecto

**👤 Para Requesters:**
- Edge function devuelve: `[admin1, technician1, technician2, ...]`
- Frontend auto-selecciona: `"Admin del Sistema"` (primer admin/técnico)
- Resultado: ✅ Usuario aparece seleccionado por defecto

### 📊 Beneficios Logrados:

- ✅ **UX Mejorada**: Usuario aparece seleccionado automáticamente
- ✅ **Seguridad Mantenida**: Filtrado por rol en backend
- ✅ **Funcionalidad Preservada**: Asignación funciona correctamente
- ✅ **Transparencia**: No requiere cambios en componentes existentes 