# Sistema de Estado de Sesión de Usuarios

## 📋 Descripción General

El sistema de estado de sesión permite determinar si un usuario está **activamente usando el sistema** basándose en su último acceso, proporcionando métricas más precisas y útiles para la administración.

## 🎯 Estados de Sesión

### ✅ Activo (Active)
- **Definición**: Usuario que ha iniciado sesión en las últimas **24 horas**
- **Color**: Verde (`success`)
- **Descripción**: "Activo"
- **Uso**: Usuarios que están usando el sistema actualmente

### ⚠️ Reciente (Recent)
- **Definición**: Usuario que ha iniciado sesión entre **1-7 días**
- **Color**: Amarillo (`warning`)
- **Descripción**: "Reciente"
- **Uso**: Usuarios con actividad reciente pero no actual

### 🔄 Antiguo (Old)
- **Definición**: Usuario que ha iniciado sesión entre **7-30 días**
- **Color**: Gris (`secondary`)
- **Descripción**: "Antiguo"
- **Uso**: Usuarios con actividad antigua

### ❌ Inactivo (Inactive)
- **Definición**: Usuario que no ha iniciado sesión en **más de 30 días** o nunca
- **Color**: Rojo (`danger`)
- **Descripción**: "Inactivo"
- **Uso**: Usuarios sin actividad reciente

## 🛠️ Implementación

### Configuración de Umbrales

```typescript
export const SESSION_CONFIG = {
  ACTIVE_THRESHOLD: 24 * 60 * 60 * 1000,    // 24 horas
  RECENT_THRESHOLD: 7 * 24 * 60 * 60 * 1000, // 7 días
  OLD_THRESHOLD: 30 * 24 * 60 * 60 * 1000,   // 30 días
} as const;
```

### Funciones Principales

#### `isUserSessionActive(user, threshold?)`
```typescript
// Verifica si un usuario tiene sesión activa
const isActive = isUserSessionActive(user, 24 * 60 * 60 * 1000);
```

#### `getUserSessionStatus(user)`
```typescript
// Obtiene el estado de sesión de un usuario
const status = getUserSessionStatus(user); // 'active' | 'recent' | 'old' | 'inactive'
```

#### `formatLastLoginTime(lastLoginAt?)`
```typescript
// Formatea el tiempo transcurrido desde el último login
const timeAgo = formatLastLoginTime(user.lastLoginAt);
// Ejemplos: "Hace 2 horas", "Hace 3 días", "Nunca"
```

#### `calculateSessionStats(users)`
```typescript
// Calcula estadísticas de sesión para un grupo de usuarios
const stats = calculateSessionStats(users);
// Retorna: { total, active, inactive, byStatus, activePercentage }
```

## 📊 Estadísticas Actualizadas

### UserStatsCards
- **"Con Sesión Activa"**: Usuarios con login en las últimas 24 horas
- **"Sin Sesión Activa"**: Usuarios sin actividad reciente
- **Porcentajes**: Calculados basados en actividad real

### Lista de Usuarios
- **Estado de Sesión**: Badge con color según actividad
- **Último Acceso**: Tiempo formateado (ej: "Hace 2 horas")

### UserCard
- **Estado de Sesión**: Badge + tiempo transcurrido
- **Información visual**: Iconos y colores intuitivos

## 🎨 Experiencia Visual

### Colores de Estado
- 🟢 **Verde**: Activo (últimas 24h)
- 🟡 **Amarillo**: Reciente (1-7 días)
- ⚪ **Gris**: Antiguo (7-30 días)
- 🔴 **Rojo**: Inactivo (+30 días)

### Formato de Tiempo
- **Reciente**: "Hace X minutos/horas"
- **Mediano**: "Hace X días"
- **Antiguo**: "Hace X días"
- **Nunca**: "Nunca"

## 🔄 Flujo de Funcionamiento

### 1. Determinación de Estado
```typescript
// Al cargar datos de usuario
const userStatus = getUserSessionStatus(user);

// Basado en lastLoginAt vs thresholds
if (timeDiff <= 24h) return 'active';
if (timeDiff <= 7d) return 'recent';
if (timeDiff <= 30d) return 'old';
return 'inactive';
```

### 2. Cálculo de Estadísticas
```typescript
// En UserStatsCards
const sessionStats = calculateSessionStats(users);
const activeUsers = sessionStats.active; // Solo usuarios con sesión activa
```

### 3. Visualización
```typescript
// En componentes
<Badge variant={getSessionStatusColor(status)}>
  {getSessionStatusText(status)}
</Badge>
```

## 📈 Beneficios

### Para Administradores
- ✅ **Métricas precisas** de uso real del sistema
- ✅ **Identificación rápida** de usuarios inactivos
- ✅ **Tendencias de actividad** por períodos
- ✅ **Optimización de recursos** basada en uso real

### Para Usuarios
- ✅ **Feedback visual** del estado de su cuenta
- ✅ **Información clara** sobre su actividad
- ✅ **Indicadores intuitivos** de estado

### Para el Sistema
- ✅ **Datos más útiles** para reportes
- ✅ **Mejor gestión** de sesiones
- ✅ **Optimización** de recursos

## 🔧 Configuración Avanzada

### Personalización de Umbrales
```typescript
// En sessionUtils.ts
export const SESSION_CONFIG = {
  ACTIVE_THRESHOLD: 12 * 60 * 60 * 1000,    // 12 horas (más estricto)
  RECENT_THRESHOLD: 3 * 24 * 60 * 60 * 1000, // 3 días
  OLD_THRESHOLD: 15 * 24 * 60 * 60 * 1000,   // 15 días
} as const;
```

### Fallback para Usuarios sin lastLoginAt
```typescript
// Si no hay lastLoginAt, usar isActive como fallback
if (!user.lastLoginAt) {
  return user.isActive ? 'active' : 'inactive';
}
```

## 📊 Métricas Disponibles

### Estadísticas Generales
- **Total de usuarios**: Todos los usuarios registrados
- **Usuarios activos**: Con sesión en últimas 24h
- **Usuarios inactivos**: Sin actividad reciente
- **Porcentaje de actividad**: (activos / total) * 100

### Estadísticas por Estado
- **Activos**: Usuarios con sesión reciente
- **Recientes**: Usuarios con actividad en la semana
- **Antiguos**: Usuarios con actividad en el mes
- **Inactivos**: Usuarios sin actividad reciente

## 🔮 Futuras Mejoras

### Planificadas
- [ ] **Configuración por usuario** de umbrales
- [ ] **Notificaciones** para usuarios inactivos
- [ ] **Reportes de actividad** detallados
- [ ] **Exportación** de métricas de sesión

### Posibles
- [ ] **Machine Learning** para predecir actividad
- [ ] **Alertas automáticas** para inactividad
- [ ] **Integración con analytics** externos
- [ ] **Dashboard de actividad** en tiempo real

## 🛡️ Consideraciones de Seguridad

### Privacidad
- ✅ **No se almacena** información de sesión sensible
- ✅ **Solo timestamps** de último acceso
- ✅ **Respeto a GDPR** y regulaciones de privacidad

### Rendimiento
- ✅ **Cálculos eficientes** en el cliente
- ✅ **Cache inteligente** de estadísticas
- ✅ **Actualización granular** por componente

### Escalabilidad
- ✅ **Funciona con** grandes volúmenes de usuarios
- ✅ **Optimizado para** actualizaciones frecuentes
- ✅ **Preparado para** crecimiento futuro 