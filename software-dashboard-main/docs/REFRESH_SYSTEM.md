# Sistema de Refresh Granular

## 📋 Descripción General

El sistema de refresh granular permite actualizar **solo los componentes específicos** en lugar de toda la página, proporcionando una experiencia de usuario más fluida y eficiente.

## 🎯 Características Principales

### ✅ Refresh Inteligente por Página
- **Dashboard**: Solo métricas generales
- **Usuarios**: Solo lista y estadísticas de usuarios
- **Incidencias**: Solo lista de incidencias
- **Requerimientos**: Solo lista de requerimientos

### ✅ Detección de Formularios Activos
- **Pausa automática** cuando hay formularios abiertos
- **Detección de modales** activos
- **Prevención de pérdida de datos** durante edición

### ✅ Intervals Personalizables
- **Estadísticas**: 45 segundos
- **Listas**: 60 segundos
- **Métricas**: 30 segundos (global)

## 🛠️ Implementación

### Hook Principal: `useComponentRefresh`

```typescript
const { manualRefresh, isEnabled, lastRefresh } = useComponentRefresh({
  type: 'users-stats',
  enabled: true,
  interval: 45000,
  dependencies: ['users-stats']
});
```

### Tipos de Refresh Disponibles

| Tipo | Descripción | Uso |
|------|-------------|-----|
| `users-list` | Lista de usuarios | UsersPage |
| `users-stats` | Estadísticas de usuarios | UserStatsCards |
| `incidents-list` | Lista de incidencias | IncidentsPage |
| `incidents-stats` | Estadísticas de incidencias | IncidentStatsCards |
| `requirements-list` | Lista de requerimientos | RequirementsPage |
| `requirements-stats` | Estadísticas de requerimientos | RequirementStatsCards |
| `pending-users-count` | Contador de usuarios pendientes | Header |
| `dashboard-metrics` | Métricas del dashboard | Dashboard |
| `all` | Todo (fallback) | - |

### Componente Indicador: `RefreshIndicator`

```typescript
<RefreshIndicator
  isEnabled={isEnabled}
  lastRefresh={lastRefresh}
  refreshType="users-stats"
  onManualRefresh={manualRefresh}
/>
```

## 🔧 Configuración

### Settings Store
```typescript
dashboard: {
  autoRefresh: true,
  refreshInterval: 30000, // 30 segundos por defecto
  showCharts: true,
  showMetrics: true
}
```

### Detección de Formularios
```typescript
// Atributos de datos para detección
data-modal="open"
data-form="user-form"
data-loading="true"
```

## 🎨 Experiencia de Usuario

### Indicadores Visuales
- **Verde**: Actualizado recientemente (< 10s)
- **Azul**: Actualizado normalmente
- **Gris**: Auto-refresh deshabilitado

### Animaciones
- **Pulso suave** cuando está activo
- **Iconos animados** durante refresh
- **Transiciones fluidas** entre estados

## 🚀 Beneficios

### Rendimiento
- ✅ **Menos carga de red** (solo datos necesarios)
- ✅ **Mejor rendimiento** del navegador
- ✅ **Menos re-renders** innecesarios

### Experiencia
- ✅ **Sin interrupciones** en formularios
- ✅ **Datos siempre actualizados**
- ✅ **Feedback visual claro**

### Mantenibilidad
- ✅ **Código modular** y reutilizable
- ✅ **Configuración centralizada**
- ✅ **Fácil extensión** para nuevos componentes

## 📝 Uso en Componentes

### Ejemplo: UserStatsCards
```typescript
export const UserStatsCards: React.FC = () => {
  const { manualRefresh, isEnabled, lastRefresh } = useComponentRefresh({
    type: 'users-stats',
    enabled: true,
    interval: 45000
  });

  return (
    <div>
      <RefreshIndicator
        isEnabled={isEnabled}
        lastRefresh={lastRefresh}
        refreshType="users-stats"
        onManualRefresh={manualRefresh}
      />
      {/* Contenido del componente */}
    </div>
  );
};
```

### Ejemplo: UsersPage
```typescript
export const UsersPage: React.FC = () => {
  const { manualRefresh } = useComponentRefresh({
    type: 'users-list',
    enabled: true,
    interval: 60000
  });

  return (
    <div>
      <Button onClick={manualRefresh}>
        Actualizar Lista
      </Button>
      {/* Lista de usuarios */}
    </div>
  );
};
```

## 🔄 Flujo de Funcionamiento

1. **Inicialización**: Componente registra su tipo de refresh
2. **Configuración**: Se establece el intervalo personalizado
3. **Detección**: Sistema verifica si hay formularios activos
4. **Ejecución**: Si es seguro, ejecuta refresh específico
5. **Actualización**: Componente se actualiza con nuevos datos
6. **Indicación**: Usuario ve el estado del refresh

## 🛡️ Seguridad

### Prevención de Conflictos
- ✅ **No refresh** durante edición de formularios
- ✅ **No refresh** con modales abiertos
- ✅ **No refresh** durante carga de datos

### Validaciones
- ✅ **Verificación de autenticación**
- ✅ **Verificación de permisos**
- ✅ **Verificación de estado de la aplicación**

## 📊 Monitoreo

### Métricas Disponibles
- **Frecuencia de refresh** por componente
- **Tiempo de respuesta** de cada refresh
- **Errores de refresh** y recuperación
- **Uso de recursos** por tipo de refresh

### Logs
```typescript
// Ejemplo de log de refresh
{
  timestamp: "2025-08-03T10:30:00Z",
  component: "users-stats",
  type: "auto",
  duration: 150,
  success: true,
  dataUpdated: ["users", "pendingCount"]
}
```

## 🔮 Futuras Mejoras

### Planificadas
- [ ] **Refresh inteligente** basado en actividad del usuario
- [ ] **Optimización de red** con cache inteligente
- [ ] **Métricas avanzadas** de rendimiento
- [ ] **Configuración por usuario** de intervals

### Posibles
- [ ] **WebSocket** para updates en tiempo real
- [ ] **Service Worker** para refresh offline
- [ ] **Machine Learning** para optimizar intervals
- [ ] **Integración con analytics** para métricas de uso 