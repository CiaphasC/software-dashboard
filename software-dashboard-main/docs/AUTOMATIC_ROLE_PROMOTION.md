# Promoción Automática de Roles

## 📋 Descripción General

El sistema implementa una **promoción automática de roles** que mejora la experiencia de los usuarios al aprobar solicitudes de registro. Cuando un usuario solicita el rol de **Solicitante**, automáticamente se le asigna el rol de **Técnico** al ser aprobado.

## 🎯 Objetivo

### ✅ Beneficios de la Promoción Automática
- **Mejor experiencia de usuario**: Los usuarios obtienen más funcionalidades automáticamente
- **Reducción de solicitudes**: Menos necesidad de solicitar cambios de rol posteriormente
- **Eficiencia administrativa**: Menos trabajo manual para administradores
- **Adopción del sistema**: Mayor engagement al tener acceso a más herramientas

## 🛠️ Implementación Técnica

### Lógica de Promoción

```typescript
// En approveRegistrationRequest()
let finalRoleName = roleName || request.requested_role;

// Lógica especial: si el usuario solicitó ser solicitante, promoverlo a técnico
if (finalRoleName === 'requester') {
  finalRoleName = 'technician';
  console.log(`🔄 Usuario solicitante promovido automáticamente a técnico: ${request.name}`);
}
```

### Flujo de Aprobación

1. **Usuario solicita registro** como "Solicitante"
2. **Administrador aprueba** la solicitud
3. **Sistema automáticamente** asigna rol "Técnico"
4. **Usuario recibe notificación** sobre la promoción
5. **Usuario puede acceder** con privilegios de técnico

## 📊 Estados de Rol

### Antes de la Aprobación
- **Rol Solicitado**: "Solicitante"
- **Estado**: Pendiente de aprobación
- **Privilegios**: Ninguno (no puede acceder)

### Después de la Aprobación
- **Rol Asignado**: "Técnico" (promoción automática)
- **Estado**: Activo
- **Privilegios**: Acceso completo como técnico

## 🎨 Experiencia de Usuario

### Para Administradores

#### Indicadores Visuales
- **Badge de rol solicitado**: Muestra "Solicitante"
- **Flecha de promoción**: "→ Técnico (promoción automática)"
- **Mensaje informativo**: Explica la regla de promoción
- **Toast de confirmación**: "Usuario aprobado y promovido a Técnico"

#### Interfaz de Aprobación
```typescript
// Mensaje de confirmación personalizado
const promotionMessage = pendingUser.requestedRole === 'requester' 
  ? `Usuario ${pendingUser.name} aprobado exitosamente y promovido a Técnico`
  : `Usuario ${pendingUser.name} aprobado exitosamente`;
```

### Para Usuarios Aprobados

#### Notificación Personalizada
```typescript
const notificationMessage = finalRoleName === 'technician' && request.requested_role === 'requester'
  ? 'Tu solicitud de registro ha sido aprobada. Has sido promovido al rol de Técnico. Ya puedes iniciar sesión en el sistema.'
  : 'Tu solicitud de registro ha sido aprobada. Ya puedes iniciar sesión en el sistema.';
```

## 🔧 Configuración

### Umbrales de Promoción
- **Rol origen**: `'requester'` (Solicitante)
- **Rol destino**: `'technician'` (Técnico)
- **Condición**: Aprobación automática

### Personalización
```typescript
// En auth.ts - Configuración de promoción
const PROMOTION_RULES = {
  requester: 'technician',  // Solicitante → Técnico
  // Futuras reglas pueden agregarse aquí
  // 'technician': 'admin',  // Técnico → Administrador (ejemplo)
} as const;
```

## 📈 Métricas y Seguimiento

### Logs de Promoción
```typescript
console.log(`🔄 Usuario solicitante promovido automáticamente a técnico: ${request.name}`);
```

### Estadísticas Disponibles
- **Usuarios promovidos**: Contador de promociones automáticas
- **Tasa de promoción**: Porcentaje de solicitantes promovidos
- **Tiempo de aprobación**: Promedio desde solicitud hasta promoción

## 🔄 Flujo Completo

### 1. Solicitud de Registro
```typescript
// Usuario solicita como "requester"
const registrationData = {
  name: "Juan Pérez",
  email: "juan@empresa.com",
  requestedRole: "requester",  // ← Rol solicitado
  department: "IT"
};
```

### 2. Aprobación por Administrador
```typescript
// Administrador aprueba
await authService.approveRegistrationRequest(requestId, adminId);
// Sistema automáticamente promueve a "technician"
```

### 3. Creación de Usuario
```typescript
// Usuario creado con rol promovido
const userProfile = {
  role_name: "technician",  // ← Rol final (promovido)
  is_active: true
};
```

### 4. Notificación al Usuario
```typescript
// Notificación personalizada sobre la promoción
const message = "Tu solicitud ha sido aprobada. Has sido promovido al rol de Técnico.";
```

## 🛡️ Consideraciones de Seguridad

### Validaciones
- ✅ **Solo administradores** pueden aprobar usuarios
- ✅ **Verificación de estado** de solicitud (pendiente)
- ✅ **Validación de roles** existentes en el sistema
- ✅ **Logs de auditoría** para todas las promociones

### Permisos
- ✅ **Rol técnico** tiene acceso a funcionalidades avanzadas
- ✅ **Privilegios escalados** automáticamente
- ✅ **Sin intervención manual** requerida

## 🔮 Futuras Mejoras

### Planificadas
- [ ] **Configuración de reglas** de promoción por administrador
- [ ] **Múltiples niveles** de promoción automática
- [ ] **Notificaciones avanzadas** con detalles de privilegios
- [ ] **Dashboard de promociones** para seguimiento

### Posibles
- [ ] **Promoción basada en tiempo** (ej: técnico → admin después de X meses)
- [ ] **Promoción basada en actividad** (ej: usuarios activos promovidos)
- [ ] **Promoción condicional** (ej: solo si hay vacantes)
- [ ] **Reversión automática** de promociones por inactividad

## 📝 Casos de Uso

### Escenario 1: Nuevo Empleado
1. **Empleado solicita** registro como "Solicitante"
2. **Administrador aprueba** la solicitud
3. **Sistema promueve** automáticamente a "Técnico"
4. **Empleado accede** con privilegios completos

### Escenario 2: Usuario Existente
1. **Usuario solicita** cambio de rol a "Solicitante"
2. **Administrador aprueba** el cambio
3. **Sistema promueve** automáticamente a "Técnico"
4. **Usuario obtiene** acceso adicional inmediatamente

### Escenario 3: Rol Personalizado
1. **Usuario solicita** rol específico (no "Solicitante")
2. **Administrador aprueba** con rol personalizado
3. **Sistema asigna** el rol especificado (sin promoción)
4. **Usuario accede** con privilegios del rol solicitado

## 🎯 Beneficios del Negocio

### Para la Organización
- ✅ **Mayor adopción** del sistema por usuarios
- ✅ **Reducción de tickets** de soporte
- ✅ **Mejor utilización** de funcionalidades
- ✅ **Escalabilidad** automática de permisos

### Para los Usuarios
- ✅ **Acceso inmediato** a herramientas avanzadas
- ✅ **Mejor experiencia** de onboarding
- ✅ **Menos fricción** en el proceso de aprobación
- ✅ **Mayor autonomía** en el uso del sistema

### Para los Administradores
- ✅ **Menos trabajo manual** de gestión de roles
- ✅ **Proceso estandarizado** de aprobación
- ✅ **Mejor visibilidad** del estado de usuarios
- ✅ **Reducción de errores** en asignación de roles 