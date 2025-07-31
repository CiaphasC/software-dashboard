# 🚀 Arquitectura Reactiva Centralizada

Sistema de reactividad basado en RxJS que se puede agregar a cualquier vista del dashboard según sus necesidades.

## 📁 Estructura

```
src/shared/reactive/
├── core/
│   └── ReactiveProvider.tsx    # Provider centralizado
├── hooks/
│   └── useReactiveData.ts      # Hooks para usar reactividad
├── components/
│   └── ReactiveIndicator.tsx   # Indicador de estado reactivo
├── examples/
│   └── ReactiveUsageExample.tsx # Ejemplos de uso
└── index.ts                    # Exports principales
```

## 🎯 Características

✅ **Centralizado** - Un solo provider para toda la app
✅ **Opcional** - Se puede usar en cualquier vista según necesite
✅ **Configurable** - Cada vista puede configurar su reactividad
✅ **Auto-refresh** - Actualización automática de datos
✅ **Tiempo real** - Streams de datos en tiempo real
✅ **Manejo de errores** - Gestión centralizada de errores
✅ **Indicadores visuales** - Estado de conexión y actualización

## 🚀 Uso Básico

### 1. Configurar el Provider (App.tsx)

```tsx
import { ReactiveProvider } from '@/shared/reactive';

const App = () => {
  return (
    <ReactiveProvider
      config={{
        autoRefresh: true,
        refreshInterval: 30000, // 30 segundos
        enableRealTime: true,
        enableErrorHandling: true,
      }}
    >
      {/* Tu app aquí */}
    </ReactiveProvider>
  );
};
```

### 2. Usar en cualquier vista

```tsx
import { useReactiveData, ReactiveIndicator } from '@/shared/reactive';

const MiVista = () => {
  const { data, loading, error, lastUpdated } = useReactiveData(
    () => miApi.getData(),
    {
      autoRefresh: true,
      refreshInterval: 15000,
      realTime: false,
      onSuccess: (data) => console.log('Datos actualizados:', data),
      onError: (err) => console.error('Error:', err)
    }
  );

  return (
    <div>
      <h1>Mi Vista Reactiva</h1>
      <ReactiveIndicator showStatus={true} showLastUpdated={true} />
      
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {data && <p>Datos: {data.length}</p>}
    </div>
  );
};
```

## ⚙️ Configuración

### Opciones del Provider

```tsx
interface ReactiveConfig {
  autoRefresh: boolean;        // Auto-refresh habilitado
  refreshInterval: number;     // Intervalo en ms
  enableRealTime: boolean;     // Streams en tiempo real
  enableErrorHandling: boolean; // Manejo de errores
}
```

### Opciones del Hook

```tsx
interface UseReactiveDataOptions {
  autoRefresh?: boolean;       // Override del provider
  refreshInterval?: number;    // Override del provider
  realTime?: boolean;          // Stream en tiempo real
  initialValue?: T;            // Valor inicial
  onSuccess?: (data: T) => void; // Callback de éxito
  onError?: (error: any) => void; // Callback de error
}
```

## 🎨 Componentes

### ReactiveIndicator

Indicador visual del estado reactivo:

```tsx
<ReactiveIndicator 
  showStatus={true}        // Mostrar estado de conexión
  showLastUpdated={true}   // Mostrar última actualización
  className="custom-class" // Clases CSS personalizadas
/>
```

## 📊 Ejemplos de Uso

### Dashboard con Auto-refresh

```tsx
const Dashboard = () => {
  const { data: metrics } = useReactiveData(
    () => dashboardApi.getMetrics(),
    { autoRefresh: true, refreshInterval: 30000 }
  );
  
  return (
    <div>
      <ReactiveIndicator />
      {/* Dashboard content */}
    </div>
  );
};
```

### Vista con Tiempo Real

```tsx
const LiveView = () => {
  const { data: liveData } = useReactiveData(
    () => api.getLiveData(),
    { realTime: true, refreshInterval: 5000 }
  );
  
  return <div>{/* Live data */}</div>;
};
```

### Vista Sin Auto-refresh

```tsx
const StaticView = () => {
  const { data: staticData } = useReactiveData(
    () => api.getStaticData(),
    { autoRefresh: false }
  );
  
  return <div>{/* Static data */}</div>;
};
```

## 🔧 Ventajas

1. **Reutilizable** - Mismo sistema para todas las vistas
2. **Configurable** - Cada vista decide su nivel de reactividad
3. **Eficiente** - Un solo provider, múltiples streams
4. **Visual** - Indicadores de estado claros
5. **Robusto** - Manejo de errores centralizado
6. **Flexible** - Se puede agregar a cualquier vista existente

## 🎯 Casos de Uso

- **Dashboard** - Auto-refresh cada 30s
- **Incidencias** - Tiempo real cada 15s
- **Reportes** - Sin auto-refresh (datos estáticos)
- **Configuración** - Solo cuando se solicita
- **Notificaciones** - Stream continuo

## 🚀 Migración

Para agregar reactividad a una vista existente:

1. **Importar** los hooks y componentes
2. **Reemplazar** useState/useEffect con useReactiveData
3. **Agregar** ReactiveIndicator donde sea necesario
4. **Configurar** las opciones según la necesidad

¡Listo! Tu vista ahora es reactiva. 🎉 