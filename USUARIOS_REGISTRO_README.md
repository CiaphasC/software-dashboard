# Sistema de Registro de Usuarios con Validación Administrativa

## Descripción General

Se ha implementado un sistema completo de registro de usuarios con validación administrativa que permite:

1. **Registro de usuarios** desde la página de login (solo rol de Solicitante)
2. **Validación administrativa** de solicitudes de registro
3. **Gestión de usuarios pendientes** por parte de administradores
4. **Restricciones de acceso** basadas en roles
5. **Gestión de contraseñas** segura

## Funcionalidades Implementadas

### 1. Registro de Usuarios

#### Componente: `src/features/auth/pages/Register.tsx`
- Formulario completo de registro con validación
- Campos requeridos: nombre, email, contraseña, confirmación de contraseña, departamento
- **Rol fijo**: Solo se puede solicitar el rol de "Solicitante" durante el registro inicial
- Validación de contraseña fuerte (mínimo 8 caracteres, mayúscula, minúscula, número)
- Diseño moderno con animaciones GSAP
- Navegación entre login y registro

#### Validaciones:
- Email único en el sistema
- Contraseña segura con regex
- Confirmación de contraseña
- Campos obligatorios
- **Rol restringido**: Solo "Solicitante" disponible durante registro

### 2. Gestión de Usuarios Pendientes

#### Componente: `src/features/users/pages/UsersPage.tsx`
- Pestañas separadas para usuarios activos y solicitudes pendientes
- Vista de tabla con información completa de solicitantes
- Acciones de aprobar/rechazar solicitudes
- Modal para proporcionar razón de rechazo
- Contador de solicitudes pendientes

#### Estados de Solicitudes:
- **Pendiente**: Esperando revisión administrativa
- **Aprobado**: Usuario creado y activo
- **Rechazado**: Solicitud denegada con razón

### 3. Gestión de Usuarios Activos

#### Restricciones de Roles:
- **Durante el registro**: Solo se puede solicitar rol de "Solicitante"
- **En gestión de usuarios**: Solo se pueden crear usuarios con roles "Administrador" o "Técnico"
- **Lógica**: Los solicitantes solo pueden existir después de ser aprobados por un administrador

#### Formulario de Usuario (`src/features/users/components/UserForm.tsx`):
- Opciones de rol limitadas a "Administrador" y "Técnico"
- Validación que impide asignar rol de "Solicitante"
- Campos adicionales: `isActive`, `isEmailVerified`
- Valor por defecto: "Técnico"

### 4. Notificaciones para Administradores

#### Componente: `src/shared/components/layout/Header.tsx`
- Badge de notificaciones con contador de solicitudes pendientes
- Dropdown con detalles de solicitudes
- Navegación directa a gestión de usuarios
- Solo visible para usuarios con rol de administrador

### 5. Restricciones de Acceso

#### Control de Acceso:
- Solo administradores pueden crear/editar/eliminar usuarios
- Solo administradores pueden aprobar/rechazar solicitudes
- Mensajes de error informativos para usuarios no autorizados
- Verificación de roles en todas las operaciones críticas

### 6. Gestión de Contraseñas

#### Funcionalidades:
- Campos de contraseña en formularios de usuario
- Validación de contraseña fuerte
- Confirmación de contraseña
- Actualización opcional de contraseña en edición
- Almacenamiento seguro (simulado)

## Estructura de Datos

### Tipos Actualizados

#### `src/shared/types/common.types.ts`
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  department: string;
  password: string;
  requestedRole: UserRole; // Siempre será REQUESTER
  status: PendingUserStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export enum PendingUserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
```

### Esquemas de Validación

#### Registro (`src/features/auth/pages/Register.tsx`)
```typescript
const roleOptions = [
  { value: UserRole.REQUESTER, label: 'Solicitante' },
];
```

#### Gestión de Usuarios (`src/features/users/types/index.ts`)
```typescript
export const userFormSchema = z.object({
  // ... otros campos
  role: z.nativeEnum(UserRole).refine(
    (role) => role !== UserRole.REQUESTER,
    { message: 'No se puede asignar el rol de solicitante desde esta interfaz' }
  ),
  // ... otros campos
});
```

## Servicios Actualizados

### 1. Servicio de Autenticación (`src/shared/services/api/auth/authApi.ts`)

#### Nuevos Métodos:
- `register()`: Registra un nuevo usuario pendiente (solo rol REQUESTER)
- `getPendingUsers()`: Obtiene lista de usuarios pendientes
- `getPendingUsersCount()`: Obtiene contador de solicitudes pendientes
- `approvePendingUser()`: Aprueba una solicitud de registro
- `rejectPendingUser()`: Rechaza una solicitud con razón

### 2. Hook de Autenticación (`src/features/auth/hooks/useAuth.tsx`)

#### Nuevas Funcionalidades:
- `register`: Función para registrar usuarios (solo solicitantes)
- `pendingUsersCount`: Contador de usuarios pendientes
- Actualización automática del contador para administradores

### 3. Hook de Usuarios (`src/features/users/hooks/useUsers.ts`)

#### Nuevas Funcionalidades:
- `pendingUsers`: Lista de usuarios pendientes
- `loadPendingUsers()`: Cargar usuarios pendientes
- `approvePendingUser()`: Aprobar usuario pendiente
- `rejectPendingUser()`: Rechazar usuario pendiente

## Flujo de Usuario

### 1. Registro de Usuario
1. Usuario accede a la página de login
2. Hace clic en "Crear Nueva Cuenta"
3. Completa el formulario de registro (rol fijo: Solicitante)
4. Sistema valida los datos
5. Solicitud se guarda como pendiente
6. Usuario recibe confirmación de solicitud enviada

### 2. Validación Administrativa
1. Administrador ve notificación de solicitudes pendientes
2. Accede a la sección de usuarios
3. Cambia a la pestaña "Solicitudes Pendientes"
4. Revisa la información del solicitante
5. Aprueba o rechaza la solicitud
6. Si rechaza, proporciona razón
7. Sistema actualiza el estado de la solicitud

### 3. Activación de Usuario
1. Al aprobar, se crea el usuario activo con rol "Solicitante"
2. Se agrega a la lista de usuarios del sistema
3. Usuario puede iniciar sesión con sus credenciales
4. Se actualiza el contador de solicitudes pendientes

### 4. Gestión de Usuarios Activos
1. Administradores pueden crear usuarios con roles "Administrador" o "Técnico"
2. No se puede crear usuarios con rol "Solicitante" directamente
3. Los solicitantes solo existen después del proceso de aprobación

## Características Técnicas

### Seguridad
- Validación de contraseñas fuertes
- Verificación de roles para operaciones críticas
- Validación de datos en frontend y backend
- Manejo seguro de contraseñas
- **Restricción de roles**: Lógica clara de cuándo se puede asignar cada rol

### UX/UI
- Diseño moderno y responsivo
- Animaciones fluidas con GSAP
- Feedback visual inmediato
- Mensajes de error informativos
- Estados de carga apropiados

### Performance
- Lazy loading de componentes
- Memoización de observables
- Actualizaciones reactivas eficientes
- Optimización de re-renders

## Archivos Modificados/Creados

### Nuevos Archivos:
- `src/features/auth/pages/Register.tsx`
- `USUARIOS_REGISTRO_README.md`

### Archivos Modificados:
- `src/shared/types/common.types.ts`
- `src/features/auth/types/index.ts`
- `src/shared/services/api/auth/authApi.ts`
- `src/features/auth/hooks/useAuth.tsx`
- `src/features/auth/pages/Login.tsx`
- `src/shared/components/layout/Header.tsx`
- `src/features/users/pages/UsersPage.tsx`
- `src/features/users/hooks/useUsers.ts`
- `src/shared/utils/schemas.ts`
- `src/features/users/components/UserForm.tsx`
- `src/features/users/types/index.ts`
- `src/shared/services/usersService.ts`

## Lógica de Roles Actualizada

### Durante el Registro:
- **Solo disponible**: Rol de "Solicitante"
- **Razón**: Los usuarios nuevos deben solicitar acceso antes de tener otros roles

### En Gestión de Usuarios:
- **Roles disponibles**: "Administrador" y "Técnico"
- **Rol excluido**: "Solicitante" (no se puede crear directamente)
- **Razón**: Los solicitantes solo pueden existir después del proceso de aprobación

### Flujo Lógico:
1. **Registro** → Solo "Solicitante" disponible
2. **Aprobación** → Administrador aprueba solicitud
3. **Activación** → Usuario se convierte en "Solicitante" activo
4. **Gestión** → Administradores pueden crear "Administrador" o "Técnico"

## Próximos Pasos

### Mejoras Sugeridas:
1. **Verificación de Email**: Implementar verificación por email
2. **Auditoría**: Log de todas las acciones administrativas
3. **Notificaciones Push**: Notificaciones en tiempo real
4. **Bulk Actions**: Aprobar/rechazar múltiples solicitudes
5. **Filtros Avanzados**: Filtros por fecha, departamento, rol
6. **Exportación**: Exportar reportes de solicitudes
7. **Plantillas**: Plantillas de respuesta para rechazos

### Consideraciones de Producción:
1. **Hashing de Contraseñas**: Implementar bcrypt o similar
2. **Rate Limiting**: Limitar intentos de registro
3. **Captcha**: Protección contra bots
4. **Logs de Seguridad**: Monitoreo de intentos de acceso
5. **Backup**: Respaldo de datos críticos

## Conclusión

El sistema implementado proporciona una solución completa y segura para el registro de usuarios con validación administrativa, manteniendo altos estándares de UX/UI y siguiendo las mejores prácticas de desarrollo en React y TypeScript. La lógica de roles está claramente definida y restringida según el contexto de uso, asegurando que los usuarios solo puedan solicitar el rol apropiado en cada momento del flujo. 