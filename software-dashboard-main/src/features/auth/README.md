# Feature de Autenticación

## Estructura de Archivos

```
auth/
├── components/           # Componentes específicos de autenticación
│   ├── ui/              # Componentes UI reutilizables
│   │   ├── AuthCard.tsx     # Tarjeta principal con animaciones
│   │   ├── AuthBackground.tsx # Fondo animado con partículas
│   │   ├── PasswordInput.tsx  # Input de contraseña con toggle
│   │   └── index.ts
│   ├── Login.tsx        # Componente de formulario de login
│   ├── Register.tsx     # Componente de formulario de registro
│   └── index.ts
├── pages/
│   └── LoginPage.tsx    # Página principal que maneja el estado
├── hooks/               # Hooks específicos de autenticación
├── types/               # Tipos TypeScript
└── index.ts             # Exports principales
```

## Componentes

### LoginPage.tsx
- **Página principal** que maneja el estado entre login y registro
- Renderiza el fondo animado y los componentes correspondientes
- Controla la navegación entre formularios

### Login.tsx
- **Componente de formulario de login**
- Maneja la autenticación de usuarios existentes
- Incluye validación y animaciones GSAP

### Register.tsx
- **Componente de formulario de registro**
- Maneja la creación de nuevas cuentas
- Incluye validación de contraseñas y campos requeridos

## Componentes UI Reutilizables

### AuthCard.tsx
- **Tarjeta principal** con efectos 3D y animaciones
- Configurable con título, subtítulo, icono y footer
- Efectos de hover y animaciones GSAP integradas

### AuthBackground.tsx
- **Fondo animado** con partículas y efectos visuales
- Gradientes dinámicos y ondas animadas
- MotionPath para partículas flotantes

### PasswordInput.tsx
- **Input de contraseña** con funcionalidad de mostrar/ocultar
- Animaciones suaves para el toggle
- Reutilizable en ambos formularios

## Características

- ✅ **Animaciones GSAP** profesionales con efectos 3D
- ✅ **Validación de formularios** con Zod
- ✅ **Componentes reutilizables** y modulares
- ✅ **TypeScript** con tipos estrictos
- ✅ **Responsive design** para móviles y desktop
- ✅ **Efectos visuales** modernos con glassmorphism
- ✅ **Accesibilidad** con ARIA labels y navegación por teclado

## Uso

```tsx
import { LoginPage } from '@/features/auth';

// En las rutas
<Route path="/login" element={<LoginPage />} />
```

## Patrones de Diseño

- **Composición**: Los componentes se componen usando props y children
- **Separación de responsabilidades**: UI, lógica y estado separados
- **Reutilización**: Componentes UI independientes y reutilizables
- **Lazy loading**: Carga diferida para optimizar el rendimiento 