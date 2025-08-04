# 🎨 FloatingParticles - Componente de Efectos Visuales

## 📋 Descripción

Componente reutilizable para crear efectos de partículas flotantes animadas en las páginas de la aplicación. Este componente centraliza toda la lógica de partículas y elimina la duplicación de código.

## 🚀 Características

- ✅ **Reutilizable**: Un solo componente para todas las páginas
- ✅ **Configurable**: Parámetros personalizables para diferentes estilos
- ✅ **Optimizado**: Usa `useMemo` para evitar re-renders innecesarios
- ✅ **TypeScript**: Tipado completo con interfaces
- ✅ **Presets**: Configuraciones predefinidas para cada página
- ✅ **Performance**: Renderizado condicional con prop `enabled`

## 📦 Instalación

```typescript
import { 
  FloatingParticles, 
  IncidentsFloatingParticles,
  RequirementsFloatingParticles,
  UsersFloatingParticles,
  ReportsFloatingParticles,
  type FloatingParticlesProps 
} from '@/shared/components/ui';
```

## 🎯 Uso Básico

### Componente Genérico

```typescript
<FloatingParticles
  mainCount={20}
  sparkleCount={15}
  specialCount={8}
  mainColors={['blue-400/50', 'sky-400/50']}
  sparkleColor="yellow-300/80"
  specialColors={['sky-300/70', 'blue-600/70']}
  className="custom-class"
  enabled={true}
/>
```

### Componentes con Presets

```typescript
// Para la página de incidencias
<IncidentsFloatingParticles />

// Para la página de requerimientos
<RequirementsFloatingParticles />

// Para la página de usuarios
<UsersFloatingParticles />

// Para la página de reportes
<ReportsFloatingParticles />
```

## ⚙️ Props

### FloatingParticlesProps

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `mainCount` | `number` | `20` | Número de partículas principales |
| `sparkleCount` | `number` | `15` | Número de partículas de brillo |
| `specialCount` | `number` | `8` | Número de partículas especiales |
| `mainColors` | `[string, string]` | `['blue-400/50', 'sky-400/50']` | Colores de partículas principales |
| `sparkleColor` | `string` | `'yellow-300/80'` | Color de partículas de brillo |
| `specialColors` | `[string, string]` | `['sky-300/70', 'blue-600/70']` | Colores de partículas especiales |
| `mainSize` | `string` | `'w-1 h-1'` | Tamaño de partículas principales |
| `sparkleSize` | `string` | `'w-0.5 h-0.5'` | Tamaño de partículas de brillo |
| `specialSize` | `string` | `'w-2 h-2'` | Tamaño de partículas especiales |
| `className` | `string` | `''` | Clase CSS adicional |
| `enabled` | `boolean` | `true` | Si las partículas deben estar habilitadas |

## 🎨 Presets Disponibles

### IncidentsFloatingParticles
- **Colores**: Naranja/Rojo
- **Partículas**: 12 principales, 0 brillo, 0 especiales
- **Estilo**: Minimalista y alerta

### RequirementsFloatingParticles
- **Colores**: Verde/Esmeralda
- **Partículas**: 18 principales, 12 brillo, 6 especiales
- **Estilo**: Abundante y positivo

### UsersFloatingParticles
- **Colores**: Azul/Sky
- **Partículas**: 20 principales, 15 brillo, 8 especiales
- **Estilo**: Profesional y confiable

### ReportsFloatingParticles
- **Colores**: Gris/Azul oscuro
- **Partículas**: 20 principales, 15 brillo, 8 especiales
- **Estilo**: Neutral y analítico

## 🔧 Migración

### Antes (Código Duplicado)

```typescript
// En cada página había código como este:
const FloatingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/50 to-sky-400/50 rounded-full"
          // ... 50+ líneas de código duplicado
        />
      ))}
    </div>
  );
};
```

### Después (Componente Reutilizable)

```typescript
// Ahora solo necesitas importar y usar:
import { UsersFloatingParticles } from '@/shared/components/ui';

<UsersFloatingParticles />
```

## 📊 Beneficios de la Refactorización

### ✅ **Mantenibilidad**
- Un solo lugar para cambios en partículas
- Configuraciones centralizadas
- Fácil debugging

### ✅ **Consistencia**
- Mismo comportamiento en todas las páginas
- Estilos uniformes
- Animaciones coherentes

### ✅ **Performance**
- Menos código duplicado
- Mejor tree-shaking
- Re-renders optimizados

### ✅ **Desarrollo**
- Menos tiempo de desarrollo
- Menos bugs
- Fácil testing

## 🧪 Testing

```typescript
import { render, screen } from '@testing-library/react';
import { FloatingParticles } from '@/shared/components/ui';

test('renders particles when enabled', () => {
  render(<FloatingParticles enabled={true} />);
  // Verificar que las partículas se renderizan
});

test('does not render when disabled', () => {
  render(<FloatingParticles enabled={false} />);
  // Verificar que no se renderiza nada
});
```

## 🔄 Changelog

### v1.0.0 - Refactorización Completa
- ✅ Eliminado código duplicado en 4 páginas
- ✅ Creado componente reutilizable
- ✅ Implementado sistema de presets
- ✅ Agregado soporte TypeScript completo
- ✅ Optimizado performance con useMemo
- ✅ Agregado prop `enabled` para control condicional

## 📝 Notas de Desarrollo

- El componente usa `framer-motion` para animaciones
- Las partículas se generan con posiciones aleatorias
- Cada tipo de partícula tiene su propia animación
- Los presets están optimizados para cada contexto de página
- El componente es completamente responsive

## 🚀 Próximas Mejoras

- [ ] Agregar más presets para nuevas páginas
- [ ] Implementar configuración por tema (claro/oscuro)
- [ ] Agregar controles de velocidad de animación
- [ ] Implementar partículas interactivas
- [ ] Agregar soporte para partículas personalizadas 